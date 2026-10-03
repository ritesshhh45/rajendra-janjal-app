create table public.admins (user_id uuid primary key, created_at timestamptz not null default now());
grant select on public.admins to authenticated; grant all on public.admins to service_role;
alter table public.admins enable row level security;
create or replace function public.is_admin(_uid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admins where user_id=_uid) $$;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());

create table public.citizens (id uuid primary key default gen_random_uuid(), name text not null, mobile text not null unique, address text not null default '', dob date, device_id text, session_token uuid not null default gen_random_uuid(), created_at timestamptz not null default now());
grant select on public.citizens to authenticated; grant all on public.citizens to service_role;
alter table public.citizens enable row level security;
create policy "admins read citizens" on public.citizens for select to authenticated using (public.is_admin(auth.uid()));

create table public.device_tokens (id uuid primary key default gen_random_uuid(), citizen_id uuid references public.citizens(id) on delete cascade, fcm_token text not null unique, platform text, created_at timestamptz not null default now());
grant select on public.device_tokens to authenticated; grant all on public.device_tokens to service_role;
alter table public.device_tokens enable row level security;
create policy "admins read tokens" on public.device_tokens for select to authenticated using (public.is_admin(auth.uid()));

create table public.notifications (id uuid primary key default gen_random_uuid(), title text not null, message text not null, image_url text, type text not null default 'manual' check (type in ('manual','birthday')), citizen_id uuid references public.citizens(id) on delete cascade, created_at timestamptz not null default now());
grant select on public.notifications to anon, authenticated; grant insert, update, delete on public.notifications to authenticated; grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "public read manual" on public.notifications for select to anon, authenticated using (type='manual');
create policy "admin all notif" on public.notifications for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.gallery (id uuid primary key default gen_random_uuid(), image_url text not null, caption text, created_at timestamptz not null default now());
grant select on public.gallery to anon, authenticated; grant insert, update, delete on public.gallery to authenticated; grant all on public.gallery to service_role;
alter table public.gallery enable row level security;
create policy "public read gallery" on public.gallery for select to anon, authenticated using (true);
create policy "admin write gallery" on public.gallery for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.schemes (id uuid primary key default gen_random_uuid(), title_mr text not null, title_en text not null, description text, eligibility text, how_to_apply text, apply_link text, image_url text, created_at timestamptz not null default now());
grant select on public.schemes to anon, authenticated; grant insert, update, delete on public.schemes to authenticated; grant all on public.schemes to service_role;
alter table public.schemes enable row level security;
create policy "public read schemes" on public.schemes for select to anon, authenticated using (true);
create policy "admin write schemes" on public.schemes for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.app_settings (id int primary key default 1 check (id=1), header_image_url text, splash_logo_url text, leader_photo_url text, leader_name text not null default 'Rajendra Janjal', leader_title text not null default 'Deputy Mayor & District Chief, Shiv Sena', updated_at timestamptz not null default now());
grant select on public.app_settings to anon, authenticated; grant update on public.app_settings to authenticated; grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "public read settings" on public.app_settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.app_settings for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
insert into public.app_settings (id) values (1);

insert into public.schemes (title_mr, title_en, description, eligibility, how_to_apply, apply_link) values
('मुख्यमंत्री माझी लाडकी बहीण योजना','Mukhyamantri Majhi Ladki Bahin Yojana','Monthly financial assistance for eligible women in Maharashtra.','Women aged 21-65, Maharashtra resident, family income below ₹2.5 lakh.','Apply online on the official portal or at the ward office with Aadhaar and bank details.','https://ladakibahin.maharashtra.gov.in'),
('प्रधानमंत्री आवास योजना (शहरी)','Pradhan Mantri Awas Yojana (Urban)','Housing assistance for urban poor families.','EWS/LIG families without a pucca house.','Apply via PMAY-U portal or visit the municipal corporation office.','https://pmaymis.gov.in'),
('आयुष्मान भारत','Ayushman Bharat (PM-JAY)','Health cover up to ₹5 lakh per family per year.','Families listed in SECC database / eligible ration card holders.','Check eligibility online and get your Ayushman card at a nearby centre.','https://pmjay.gov.in');