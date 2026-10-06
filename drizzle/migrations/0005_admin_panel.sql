CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- primary admin helper
CREATE OR REPLACE FUNCTION public.is_primary_admin(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists(select 1 from public.admins where user_id=_uid and approved and is_primary) $$;

-- called right after sign-in/sign-up: first account becomes primary admin, others pending
CREATE OR REPLACE FUNCTION public.claim_admin() RETURNS public.admins
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.admins; first boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not_signed_in' USING ERRCODE='42501'; END IF;
  SELECT * INTO r FROM public.admins WHERE user_id = auth.uid();
  IF FOUND THEN RETURN r; END IF;
  PERFORM pg_advisory_xact_lock(42022);
  first := NOT EXISTS (SELECT 1 FROM public.admins);
  INSERT INTO public.admins(user_id, email, approved, is_primary)
  VALUES (auth.uid(), (auth.jwt()->>'email'), first, first) RETURNING * INTO r;
  RETURN r;
END $$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_primary_admin(uuid) TO authenticated;

GRANT SELECT, UPDATE, DELETE ON public.admins TO authenticated;
CREATE POLICY "admins read all" ON public.admins FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "primary approves" ON public.admins FOR UPDATE TO authenticated USING (public.is_primary_admin(auth.uid())) WITH CHECK (public.is_primary_admin(auth.uid()));
CREATE POLICY "primary removes" ON public.admins FOR DELETE TO authenticated USING (public.is_primary_admin(auth.uid()) AND NOT is_primary);

-- grants for admin writes (policies already exist)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.updates, public.works, public.schemes, public.service_categories, public.gallery, public.notifications, public.complaints TO authenticated;
GRANT UPDATE ON public.app_settings TO authenticated;
GRANT SELECT ON public.citizens, public.device_tokens TO authenticated;

-- device token registration from the citizen app (no login)
CREATE UNIQUE INDEX IF NOT EXISTS device_tokens_fcm_key ON public.device_tokens(fcm_token);
CREATE OR REPLACE FUNCTION public.register_device(_id uuid, _token uuid, _fcm_token text, _platform text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.citizens WHERE id=_id AND session_token=_token) THEN RAISE EXCEPTION 'not_found' USING ERRCODE='42501'; END IF;
  IF length(coalesce(_fcm_token,'')) < 10 OR length(_fcm_token) > 4096 THEN RAISE EXCEPTION 'invalid_token' USING ERRCODE='22023'; END IF;
  INSERT INTO public.device_tokens(citizen_id, fcm_token, platform) VALUES (_id, _fcm_token, left(_platform,20))
  ON CONFLICT (fcm_token) DO UPDATE SET citizen_id = excluded.citizen_id, platform = excluded.platform;
END $$;
GRANT EXECUTE ON FUNCTION public.register_device(uuid,uuid,text,text) TO anon, authenticated;

-- media bucket: admins upload/remove; reads through long-lived signed links
CREATE POLICY "admins read media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='media' AND public.is_admin(auth.uid()));
CREATE POLICY "admins upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='media' AND public.is_admin(auth.uid()));
CREATE POLICY "admins delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='media' AND public.is_admin(auth.uid()));