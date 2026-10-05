CREATE UNIQUE INDEX IF NOT EXISTS citizens_mobile_key ON public.citizens(mobile);

CREATE OR REPLACE FUNCTION public.register_citizen(_name text, _mobile text, _address text, _dob date, _device_id text DEFAULT NULL)
RETURNS TABLE(id uuid, token uuid, existing boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.citizens%ROWTYPE;
BEGIN
  IF _mobile !~ '^[6-9][0-9]{9}$' THEN RAISE EXCEPTION 'invalid_mobile' USING ERRCODE = '22023'; END IF;
  IF length(trim(coalesce(_name,''))) < 2 OR length(_name) > 100 THEN RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023'; END IF;
  SELECT * INTO r FROM public.citizens c WHERE c.mobile = _mobile;
  IF FOUND THEN RETURN QUERY SELECT r.id, r.session_token, true; RETURN; END IF;
  BEGIN
    INSERT INTO public.citizens(name, mobile, address, dob, device_id)
    VALUES (trim(_name), _mobile, left(trim(coalesce(_address,'')),500), _dob, left(_device_id,100))
    RETURNING * INTO r;
    RETURN QUERY SELECT r.id, r.session_token, false;
  EXCEPTION WHEN unique_violation THEN
    SELECT * INTO r FROM public.citizens c WHERE c.mobile = _mobile;
    RETURN QUERY SELECT r.id, r.session_token, true;
  END;
END $$;

CREATE OR REPLACE FUNCTION public.citizen_me(_id uuid, _token uuid)
RETURNS TABLE(id uuid, name text, mobile text, address text, dob date, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id, c.name, c.mobile, c.address, c.dob, c.created_at FROM public.citizens c WHERE c.id = _id AND c.session_token = _token
$$;

CREATE OR REPLACE FUNCTION public.citizen_submit_complaint(_id uuid, _token uuid, _category_id uuid, _message text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.citizens WHERE id = _id AND session_token = _token) THEN RAISE EXCEPTION 'not_found' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.complaints(citizen_id, category_id, message) VALUES (_id, _category_id, left(trim(coalesce(_message,'')),1000));
END $$;

CREATE OR REPLACE FUNCTION public.citizen_complaints(_id uuid, _token uuid)
RETURNS TABLE(id uuid, message text, status text, created_at timestamptz, name_mr text, name_en text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT co.id, co.message, co.status, co.created_at, sc.name_mr, sc.name_en
  FROM public.complaints co JOIN public.citizens c ON c.id = co.citizen_id AND c.session_token = _token
  LEFT JOIN public.service_categories sc ON sc.id = co.category_id
  WHERE co.citizen_id = _id ORDER BY co.created_at DESC
$$;

CREATE OR REPLACE FUNCTION public.citizen_update(_id uuid, _token uuid, _name text, _address text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF length(trim(coalesce(_name,''))) < 2 THEN RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023'; END IF;
  UPDATE public.citizens SET name = left(trim(_name),100), address = left(trim(coalesce(_address,'')),500) WHERE id = _id AND session_token = _token;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found' USING ERRCODE = '42501'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.citizen_delete(_id uuid, _token uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.citizens WHERE id = _id AND session_token = _token) THEN RETURN; END IF;
  DELETE FROM public.device_tokens WHERE citizen_id = _id;
  DELETE FROM public.complaints WHERE citizen_id = _id;
  DELETE FROM public.citizens WHERE id = _id;
END $$;

GRANT EXECUTE ON FUNCTION public.register_citizen(text,text,text,date,text), public.citizen_me(uuid,uuid), public.citizen_submit_complaint(uuid,uuid,uuid,text), public.citizen_complaints(uuid,uuid), public.citizen_update(uuid,uuid,text,text), public.citizen_delete(uuid,uuid) TO anon, authenticated;