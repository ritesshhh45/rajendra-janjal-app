CREATE OR REPLACE FUNCTION public.unregister_device(_id uuid, _token uuid, _fcm_token text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.citizens WHERE id = _id AND session_token = _token) THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.device_tokens WHERE citizen_id = _id AND fcm_token = _fcm_token;
END;
$$;
REVOKE ALL ON FUNCTION public.unregister_device(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unregister_device(uuid, uuid, text) TO anon, authenticated, service_role;
CREATE INDEX IF NOT EXISTS notifications_birthday_day_idx ON public.notifications (citizen_id, created_at) WHERE type = 'birthday';