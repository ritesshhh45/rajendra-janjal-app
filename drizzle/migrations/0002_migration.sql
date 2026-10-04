alter table public.app_settings
  add column if not exists splash_photo_url text, add column if not exists header_photo_url text,
  add column if not exists party_logo_url text, add column if not exists app_icon_url text,
  add column if not exists name_mr text not null default 'राजेंद्र जंजाळ', add column if not exists name_en text not null default 'Rajendra Janjal',
  add column if not exists designation_mr text not null default 'उपमहापौर व जिल्हाप्रमुख', add column if not exists designation_en text not null default 'Deputy Mayor & District Chief',
  add column if not exists ward_mr text not null default 'प्रभाग क्र. २२', add column if not exists ward_en text not null default 'Ward No. 22',
  add column if not exists slogan_mr text not null default 'जनसेवा हीच ईश्वरसेवा', add column if not exists slogan_en text not null default 'Service to people is service to God',
  add column if not exists tagline_mr text not null default 'आपला वॉर्ड, आपली जबाबदारी', add column if not exists tagline_en text not null default 'Our ward, our responsibility',
  add column if not exists party_name_mr text not null default 'शिवसेना', add column if not exists party_name_en text not null default 'Shiv Sena',
  add column if not exists app_name text not null default 'Digital Ward',
  add column if not exists office_address text not null default 'जनसंपर्क कार्यालय, प्रभाग क्र. २२, छत्रपती संभाजीनगर',
  add column if not exists office_phone text not null default '', add column if not exists office_whatsapp text not null default '',
  add column if not exists office_lat double precision, add column if not exists office_lng double precision;
comment on column public.app_settings.header_image_url is 'DEPRECATED: replaced by header_photo_url';
comment on column public.app_settings.splash_logo_url is 'DEPRECATED: replaced by party_logo_url';
comment on column public.app_settings.leader_name is 'DEPRECATED: replaced by name_mr/name_en';
comment on column public.app_settings.leader_title is 'DEPRECATED: replaced by designation_mr/en';
update public.app_settings set office_lat = 19.8762, office_lng = 75.3433 where id = 1;

alter table public.admins add column if not exists email text, add column if not exists approved boolean not null default false, add column if not exists is_primary boolean not null default false;
create or replace function public.is_admin(_uid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admins where user_id=_uid and approved) $$;

alter table public.schemes add column if not exists description_mr text, add column if not exists description_en text, add column if not exists icon text, add column if not exists sort_order int not null default 0;
update public.schemes set description_en = description where description_en is null;
comment on column public.schemes.description is 'DEPRECATED: replaced by description_mr/en';
alter table public.gallery add column if not exists caption_mr text, add column if not exists caption_en text, add column if not exists video_link text, add column if not exists sort_order int not null default 0;
comment on column public.gallery.caption is 'DEPRECATED: replaced by caption_mr/en';

create table public.service_categories (id uuid primary key default gen_random_uuid(), name_mr text not null, name_en text not null, icon text not null default 'Wrench', sort_order int not null default 0, active boolean not null default true, created_at timestamptz not null default now());
grant select on public.service_categories to anon, authenticated; grant insert, update, delete on public.service_categories to authenticated; grant all on public.service_categories to service_role;
alter table public.service_categories enable row level security;
create policy "public read cats" on public.service_categories for select to anon, authenticated using (true);
create policy "admin write cats" on public.service_categories for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.complaints (id uuid primary key default gen_random_uuid(), citizen_id uuid not null references public.citizens(id) on delete cascade, category_id uuid references public.service_categories(id) on delete set null, message text not null default '', status text not null default 'submitted' check (status in ('submitted','in_progress','resolved')), created_at timestamptz not null default now());
grant select, update, delete on public.complaints to authenticated; grant all on public.complaints to service_role;
alter table public.complaints enable row level security;
create policy "admin all complaints" on public.complaints for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.updates (id uuid primary key default gen_random_uuid(), category_mr text not null default '', category_en text not null default '', title_mr text not null, title_en text not null, body_mr text not null default '', body_en text not null default '', is_alert boolean not null default false, created_at timestamptz not null default now());
grant select on public.updates to anon, authenticated; grant insert, update, delete on public.updates to authenticated; grant all on public.updates to service_role;
alter table public.updates enable row level security;
create policy "public read updates" on public.updates for select to anon, authenticated using (true);
create policy "admin write updates" on public.updates for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table public.works (id uuid primary key default gen_random_uuid(), title_mr text not null, title_en text not null, description_mr text not null default '', description_en text not null default '', status_mr text not null default '', status_en text not null default '', photo_url text, sort_order int not null default 0, created_at timestamptz not null default now());
grant select on public.works to anon, authenticated; grant insert, update, delete on public.works to authenticated; grant all on public.works to service_role;
alter table public.works enable row level security;
create policy "public read works" on public.works for select to anon, authenticated using (true);
create policy "admin write works" on public.works for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

alter publication supabase_realtime add table public.updates;

insert into public.service_categories (name_mr, name_en, icon, sort_order) values
('पाणीपुरवठा','Water Supply','Droplets',1),('रस्ता दुरुस्ती','Road Repair','Construction',2),('गटार-स्वच्छता','Drainage & Cleanliness','Trash2',3),('वीज समस्या','Electricity','Zap',4),
('पथदिवे','Street Lights','Lightbulb',5),('आरोग्य मदत','Health Help','HeartPulse',6),('शिक्षण मदत','Education Help','GraduationCap',7),('उद्यान-वृक्ष','Garden & Trees','Trees',8);

insert into public.updates (category_mr, category_en, title_mr, title_en, body_mr, body_en, is_alert, created_at) values
('पाणी','Water','उद्या पाणीपुरवठा बंद','Water supply off tomorrow','उद्या सकाळी १० ते ५ वाजेपर्यंत प्रभागात पाणीपुरवठा बंद राहील. कृपया पाणी साठवून ठेवा.','Water supply in the ward will be off tomorrow from 10 AM to 5 PM. Please store water.',true, now()),
('विकासकामे','Development','नवीन रस्ता उद्घाटन','New road inauguration','प्रभागातील नवीन काँक्रीट रस्त्याचे उद्घाटन रविवारी सकाळी ९ वाजता होणार आहे.','The new concrete road in the ward will be inaugurated on Sunday at 9 AM.',false, now() - interval '1 hour'),
('स्वच्छता','Cleanliness','स्वच्छता अभियान','Cleanliness drive','शनिवारी सकाळी ७ वाजता स्वच्छता अभियान. सर्व नागरिकांनी सहभागी व्हावे.','Cleanliness drive on Saturday at 7 AM. All citizens are invited.',false, now() - interval '2 hours'),
('आरोग्य','Health','मोफत आरोग्य शिबीर','Free health camp','रविवारी सकाळी १० ते दुपारी २ पर्यंत मोफत आरोग्य तपासणी शिबीर.','Free health check-up camp on Sunday, 10 AM to 2 PM.',false, now() - interval '3 hours');

insert into public.works (title_mr, title_en, description_mr, description_en, status_mr, status_en, sort_order) values
('काँक्रीट रस्ता - गल्ली क्र. ५','Concrete road - Lane 5','१.२ किमी काँक्रीट रस्त्याचे काम','1.2 km concrete road work','पूर्ण','Completed',1),
('नवीन जलवाहिनी','New water pipeline','प्रभागात नवीन जलवाहिनी टाकणे','Laying a new water pipeline across the ward','प्रगतीपथावर','In progress',2),
('एलईडी पथदिवे','LED street lights','२०० नवीन एलईडी पथदिवे','200 new LED street lights','प्रगतीपथावर','In progress',3),
('उद्यान सुशोभीकरण','Garden beautification','स्थानिक उद्यानाचे सुशोभीकरण','Beautification of the local garden','मंजूर','Approved',4);

update public.schemes set description_mr = 'पात्र महिलांना दरमहा आर्थिक मदत.' where title_en like 'Mukhyamantri%';
update public.schemes set description_mr = 'शहरी गरीब कुटुंबांना घरकुलासाठी मदत.' where title_en like 'Pradhan%';
update public.schemes set description_mr = 'प्रति कुटुंब प्रति वर्ष ₹५ लाखांपर्यंत आरोग्य विमा.' where title_en like 'Ayushman%';
insert into public.schemes (title_mr, title_en, description_mr, description_en, eligibility, how_to_apply, apply_link, icon, sort_order) values
('संजय गांधी निराधार अनुदान योजना','Sanjay Gandhi Niradhar Anudan Yojana','निराधार व्यक्तींना मासिक अनुदान.','Monthly pension for destitute persons.','Destitute, disabled, widows, orphans with low income.','Apply at the tehsil office or Aaple Sarkar portal.','https://aaplesarkar.mahaonline.gov.in','HandHeart',4),
('महात्मा फुले जन आरोग्य योजना','Mahatma Phule Jan Arogya Yojana','गंभीर आजारांवर मोफत उपचार.','Free treatment for serious illnesses.','Yellow/orange ration card holders in Maharashtra.','Visit an empanelled hospital with ration card and Aadhaar.','https://www.jeevandayee.gov.in','HeartPulse',5),
('प्रधानमंत्री उज्ज्वला योजना','PM Ujjwala Yojana','गरीब कुटुंबांना मोफत गॅस जोडणी.','Free LPG connection for poor households.','Women from BPL households.','Apply at the nearest LPG distributor.','https://pmuy.gov.in','Flame',6);