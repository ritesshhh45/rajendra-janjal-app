-- 0007_security_hardening.sql
-- Run once in Supabase SQL editor (or via your migration flow). Safe to re-run.

-- ============ 1. Rate limiting helper ============
create table if not exists public.rate_limits (
  key text not null,
  bucket timestamptz not null,
  hits int not null default 0,
  primary key (key, bucket)
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;
grant all on public.rate_limits to service_role;

create or replace function public._rate_check(_key text, _max int, _window interval)
returns void language plpgsql security definer set search_path = public as $$
declare b timestamptz := date_bin(_window, now(), timestamptz 'epoch'); h int;
begin
  insert into public.rate_limits(key, bucket, hits) values (_key, b, 1)
  on conflict (key, bucket) do update set hits = public.rate_limits.hits + 1
  returning hits into h;
  if h > _max then raise exception 'rate_limited' using errcode = 'P0001'; end if;
  if random() < 0.01 then delete from public.rate_limits where bucket < now() - interval '2 days'; end if;
end $$;
revoke all on function public._rate_check(text, int, interval) from public, anon, authenticated;

-- ============ 2. register_citizen: stop account takeover by mobile number ============
-- BEFORE: anyone who typed an existing mobile number got that citizen's session token
--         (=> could read name/address/DOB, read complaints, delete the account).
-- NOW:    an existing mobile only gets its token back from the SAME device (device_id match).
--         Anyone else gets an empty row, which the app already shows as "already registered".
-- NOTE:   the real long-term fix is SMS OTP verification (see SECURITY-REVIEW.md).
create or replace function public.register_citizen(_name text, _mobile text, _address text, _dob date, _device_id text default null)
returns table(id uuid, token uuid, existing boolean)
language plpgsql security definer set search_path = public as $$
declare
  r public.citizens%rowtype;
  dev text := left(coalesce(_device_id, ''), 100);
begin
  if _mobile is null or _mobile !~ '^[6-9][0-9]{9}$' then raise exception 'invalid_mobile' using errcode = '22023'; end if;
  if length(trim(coalesce(_name, ''))) < 2 or length(_name) > 100 then raise exception 'invalid_name' using errcode = '22023'; end if;
  if length(trim(coalesce(_address, ''))) < 10 or length(_address) > 500 then raise exception 'invalid_address' using errcode = '22023'; end if;
  if _dob is null or _dob > (current_date - interval '13 years')::date or _dob < (current_date - interval '110 years')::date then
    raise exception 'invalid_dob' using errcode = '22023';
  end if;

  perform public._rate_check('reg:all', 2000, interval '1 hour');
  perform public._rate_check('reg:mob:' || _mobile, 5, interval '1 hour');
  perform public._rate_check('reg:dev:' || (case when dev = '' then 'none' else dev end), 10, interval '1 hour');

  select * into r from public.citizens c where c.mobile = _mobile;
  if found then
    if dev <> '' and r.device_id is not null and r.device_id = dev then
      return query select r.id, r.session_token, true;
    else
      return query select null::uuid, null::uuid, true;
    end if;
    return;
  end if;

  begin
    insert into public.citizens(name, mobile, address, dob, device_id)
    values (trim(_name), _mobile, left(trim(_address), 500), _dob, nullif(dev, ''))
    returning * into r;
    return query select r.id, r.session_token, false;
  exception when unique_violation then
    return query select null::uuid, null::uuid, true;
  end;
end $$;
grant execute on function public.register_citizen(text, text, text, date, text) to anon, authenticated;

-- ============ 3. Complaint submission: validate + limit spam ============
create or replace function public.citizen_submit_complaint(_id uuid, _token uuid, _category_id uuid, _message text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.citizens c where c.id = _id and c.session_token = _token) then
    raise exception 'not_found' using errcode = '42501';
  end if;
  if _category_id is null or not exists (select 1 from public.service_categories s where s.id = _category_id and s.active) then
    raise exception 'invalid_message' using errcode = '22023';
  end if;
  perform public._rate_check('cmp:' || _id::text, 20, interval '1 day');
  insert into public.complaints(citizen_id, category_id, message)
  values (_id, _category_id, left(trim(coalesce(_message, '')), 1000));
end $$;
grant execute on function public.citizen_submit_complaint(uuid, uuid, uuid, text) to anon, authenticated;

create index if not exists complaints_citizen_idx on public.complaints (citizen_id, created_at desc);

-- ============ 4. Admin hardening ============
-- Only confirmed e-mails can even request admin access.
create or replace function public.claim_admin() returns public.admins
language plpgsql security definer set search_path = public as $$
declare r public.admins; first boolean;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '42501'; end if;
  select * into r from public.admins where user_id = auth.uid();
  if found then return r; end if;
  if not exists (select 1 from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null) then
    raise exception 'email_not_confirmed' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(42022);
  first := not exists (select 1 from public.admins);
  insert into public.admins(user_id, email, approved, is_primary)
  values (auth.uid(), (auth.jwt() ->> 'email'), first, first) returning * into r;
  return r;
end $$;

-- Admin-only helpers must not be callable by anonymous visitors.
revoke all on function public.claim_admin() from public, anon;
grant execute on function public.claim_admin() to authenticated;
revoke all on function public.is_primary_admin(uuid) from public, anon;
grant execute on function public.is_primary_admin(uuid) to authenticated, service_role;
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

-- Admin panel can read citizens' details, but never their login token / device id.
revoke select on public.citizens from authenticated;
grant select (id, name, mobile, address, dob, created_at) on public.citizens to authenticated;
