-- ============================================================
-- Skema Supabase InkluKids AI / PahamInklusif AI
-- ============================================================
-- Cara pakai:
--   Supabase Dashboard -> SQL Editor -> New query -> tempel -> Run.
--
-- File ini idempotent (aman dijalankan berulang). Proyek yang sudah
-- berjalan mungkin sudah memiliki sebagian objek di bawah; perintah
-- "if not exists" dan "drop policy if exists" menjaga agar tidak error.
--
-- Isi file ini:
--   1. Tabel profiles, guardianships, scans, teacher_verifications, quiz_results
--   2. Trigger profil otomatis saat akun Supabase Auth dibuat
--   3. Trigger pencegahan perubahan role dari klien
--   4. Index dan fungsi bantu is_teacher_of()
--   5. Row Level Security (RLS) + policy untuk siswa dan guru
--   6. Kolom accessibility_settings untuk menyimpan preferensi tampilan
--
-- Supabase Storage (bucket gambar) BELUM termasuk; gambar saat ini
-- hanya diproses untuk OCR dan tidak disimpan permanen.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Tabel
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  role text not null default 'siswa' check (role in ('siswa', 'guru', 'admin')),
  grade text,
  accessibility_settings jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists grade text;
alter table public.profiles add column if not exists accessibility_settings jsonb;

create table if not exists public.guardianships (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, student_id),
  constraint guardianships_not_self check (teacher_id <> student_id)
);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '',
  ocr_text text not null default '',
  points jsonb not null default '[]'::jsonb,
  glossary jsonb not null default '[]'::jsonb,
  flashcards jsonb not null default '[]'::jsonb,
  readable boolean not null default true,
  image_preview text,
  image_path text,
  stars_earned integer not null default 0,
  lesson_completed boolean not null default false,
  source_scan_id uuid references public.scans (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.scans add column if not exists source_scan_id uuid
  references public.scans (id) on delete set null;
alter table public.scans add column if not exists image_path text;
alter table public.scans add column if not exists image_preview text;

create table if not exists public.teacher_verifications (
  scan_id uuid primary key references public.scans (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  is_verified boolean not null default false,
  edited boolean not null default false,
  notes text not null default '',
  verified_at timestamptz
);

create table if not exists public.quiz_results (
  scan_id uuid primary key references public.scans (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  score integer not null default 0,
  total integer not null default 0,
  best_score integer not null default 0,
  attempts integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. Index
-- ------------------------------------------------------------

create index if not exists scans_owner_id_idx on public.scans (owner_id);
create index if not exists scans_created_at_idx on public.scans (created_at desc);
create index if not exists scans_source_scan_id_idx on public.scans (source_scan_id);
create index if not exists guardianships_student_id_idx on public.guardianships (student_id);
create index if not exists teacher_verifications_teacher_id_idx
  on public.teacher_verifications (teacher_id);
create index if not exists quiz_results_student_id_idx on public.quiz_results (student_id);

-- ------------------------------------------------------------
-- 3. Fungsi bantu
-- ------------------------------------------------------------

-- Apakah pengguna yang sedang login adalah guru dari student_id?
-- SECURITY DEFINER agar tidak terkena RLS guardianships saat dipakai policy.
create or replace function public.is_teacher_of(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guardianships g
    where g.teacher_id = auth.uid()
      and g.student_id = target
  );
$$;

-- Buat profil otomatis ketika akun Supabase Auth baru dibuat.
-- Role selalu 'siswa'; guru dibuat oleh pengelola lewat dashboard.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, 'siswa'), '@', 1)
    ),
    'siswa'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cegah klien mengubah role sendiri (mis. siswa menjadi guru).
-- Perubahan lewat SQL Editor / service_role tidak terpengaruh karena
-- auth.uid() bernilai null pada konteks tersebut.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Peran akun hanya dapat diubah oleh pengelola.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_change();

-- RPC Verifikasi Guru (Fase 1.5):
-- Memungkinkan guru memverifikasi materi siswa binaan dan menyinkronkan
-- suntingan judul/poin tanpa memerlukan izin UPDATE scans bebas.
create or replace function public.verify_scan(
  p_scan_id uuid,
  p_is_verified boolean,
  p_edited boolean,
  p_notes text,
  p_title text default null,
  p_points jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  select owner_id into v_owner_id
  from public.scans
  where id = p_scan_id;

  if v_owner_id is null then
    raise exception 'Materi tidak ditemukan.';
  end if;

  if not (v_owner_id = auth.uid() or public.is_teacher_of(v_owner_id)) then
    raise exception 'Hanya guru pendamping yang terdaftar yang dapat memverifikasi materi ini.';
  end if;

  insert into public.teacher_verifications (
    scan_id,
    teacher_id,
    is_verified,
    edited,
    notes,
    verified_at
  )
  values (
    p_scan_id,
    auth.uid(),
    p_is_verified,
    p_edited,
    coalesce(p_notes, ''),
    now()
  )
  on conflict (scan_id) do update set
    teacher_id = auth.uid(),
    is_verified = excluded.is_verified,
    edited = excluded.edited,
    notes = excluded.notes,
    verified_at = now();

  if p_edited and (p_title is not null or p_points is not null) then
    update public.scans
    set
      title = coalesce(p_title, title),
      points = coalesce(p_points, points)
    where id = p_scan_id;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- 4. Row Level Security
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.guardianships enable row level security;
alter table public.scans enable row level security;
alter table public.teacher_verifications enable row level security;
alter table public.quiz_results enable row level security;

-- profiles -------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_select_my_teacher" on public.profiles;
create policy "profiles_select_my_teacher"
on public.profiles for select
to authenticated
using (
  exists (
    select 1 from public.guardianships g
    where g.teacher_id = profiles.id
      and g.student_id = auth.uid()
  )
);

drop policy if exists "profiles_select_my_students" on public.profiles;
create policy "profiles_select_my_students"
on public.profiles for select
to authenticated
using (
  exists (
    select 1 from public.guardianships g
    where g.student_id = profiles.id
      and g.teacher_id = auth.uid()
  )
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and role = 'siswa');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- guardianships --------------------------------------------
-- Hanya bisa dibaca oleh guru dan siswa yang terhubung.
-- Penambahan relasi dilakukan pengelola lewat SQL Editor / service_role.
drop policy if exists "guardianships_select_own" on public.guardianships;
create policy "guardianships_select_own"
on public.guardianships for select
to authenticated
using (teacher_id = auth.uid() or student_id = auth.uid());

-- scans ----------------------------------------------------
drop policy if exists "scans_select_own" on public.scans;
create policy "scans_select_own"
on public.scans for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists "scans_select_teacher" on public.scans;
create policy "scans_select_teacher"
on public.scans for select
to authenticated
using (public.is_teacher_of(owner_id));

drop policy if exists "scans_insert_own" on public.scans;
create policy "scans_insert_own"
on public.scans for insert
to authenticated
with check (owner_id = auth.uid());

-- Guru membuat salinan materi untuk siswa binaannya.
drop policy if exists "scans_insert_teacher_share" on public.scans;
create policy "scans_insert_teacher_share"
on public.scans for insert
to authenticated
with check (public.is_teacher_of(owner_id));

drop policy if exists "scans_update_own" on public.scans;
create policy "scans_update_own"
on public.scans for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Guru boleh memperbarui salinan materi buatannya yang dibagikan ke siswa binaan.
-- Perubahan poin/judul pada scan asli siswa wajib melalui RPC verify_scan
-- agar guru tidak memiliki izin UPDATE scans bebas.
drop policy if exists "scans_update_teacher" on public.scans;
create policy "scans_update_teacher"
on public.scans for update
to authenticated
using (source_scan_id is not null and public.is_teacher_of(owner_id))
with check (source_scan_id is not null and public.is_teacher_of(owner_id));

drop policy if exists "scans_delete_own" on public.scans;
create policy "scans_delete_own"
on public.scans for delete
to authenticated
using (owner_id = auth.uid());

-- teacher_verifications ------------------------------------
drop policy if exists "teacher_verifications_select" on public.teacher_verifications;
create policy "teacher_verifications_select"
on public.teacher_verifications for select
to authenticated
using (
  teacher_id = auth.uid()
  or exists (
    select 1 from public.scans s
    where s.id = teacher_verifications.scan_id
      and (
        s.owner_id = auth.uid()
        or public.is_teacher_of(s.owner_id)
      )
  )
);

drop policy if exists "teacher_verifications_insert" on public.teacher_verifications;
create policy "teacher_verifications_insert"
on public.teacher_verifications for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.scans s
    where s.id = teacher_verifications.scan_id
      and public.is_teacher_of(s.owner_id)
  )
);

drop policy if exists "teacher_verifications_update" on public.teacher_verifications;
create policy "teacher_verifications_update"
on public.teacher_verifications for update
to authenticated
using (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.scans s
    where s.id = teacher_verifications.scan_id
      and public.is_teacher_of(s.owner_id)
  )
)
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.scans s
    where s.id = teacher_verifications.scan_id
      and public.is_teacher_of(s.owner_id)
  )
);

-- quiz_results ---------------------------------------------
drop policy if exists "quiz_results_select" on public.quiz_results;
create policy "quiz_results_select"
on public.quiz_results for select
to authenticated
using (student_id = auth.uid() or public.is_teacher_of(student_id));

drop policy if exists "quiz_results_insert_own" on public.quiz_results;
create policy "quiz_results_insert_own"
on public.quiz_results for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "quiz_results_update_own" on public.quiz_results;
create policy "quiz_results_update_own"
on public.quiz_results for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

-- ------------------------------------------------------------
-- 5. Hak akses tabel untuk klien terautentikasi
--    (RLS tetap yang menentukan baris mana yang boleh diakses)
-- ------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, delete on public.profiles to authenticated;
-- Klien hanya boleh mengubah kolom miliknya. `role` sengaja TIDAK diberikan
-- agar siswa tidak bisa menaikkan perannya menjadi guru (lihat juga trigger
-- profiles_prevent_role_change di atas).
revoke update on public.profiles from authenticated;
grant update (name, grade, accessibility_settings) on public.profiles to authenticated;
grant select on public.guardianships to authenticated;
grant select, insert, update, delete on public.scans to authenticated;
grant select, insert, update, delete on public.teacher_verifications to authenticated;
grant select, insert, update, delete on public.quiz_results to authenticated;
grant execute on function public.verify_scan to authenticated;

-- ------------------------------------------------------------
-- Catatan
-- ------------------------------------------------------------
-- - Role guru dibuat manual: update public.profiles set role = 'guru' where id = '<uuid>';
-- - Relasi guru-siswa dibuat manual:
--     insert into public.guardianships (teacher_id, student_id)
--     values ('<uuid-guru>', '<uuid-siswa>')
--     on conflict do nothing;
-- - Proyek yang SUDAH berjalan cukup menjalankan Docs/SQL-security-hardening.sql
--   untuk menutup celah eskalasi peran tanpa membuat ulang tabel.
-- - File Docs/SQL-teacher-materials.sql adalah versi ringkas untuk kolom
--   source_scan_id + policy berbagi materi. Isinya sudah tercakup di sini.
-- - Skema tabel ai_reports dan ai_usage_logs belum dibuat (fase lanjutan).
