-- ============================================================
-- Pengerasan keamanan Supabase (P0)
-- ============================================================
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan berulang.
--
-- Yang diperbaiki:
--   1. Siswa tidak lagi bisa mengubah `role` dirinya menjadi 'guru'.
--   2. Klien hanya boleh meng-UPDATE kolom yang memang miliknya.
--   3. Daftar policy "nyasar" yang bisa melebarkan akses ikut diperiksa.
--
-- Latar belakang: policy `profiles_update_own` mengizinkan pengguna mengubah
-- barisnya sendiri, dan `grant update on public.profiles` dulu mencakup SEMUA
-- kolom (termasuk `role`). Jadi tanpa trigger pembatas, siswa dapat menaikkan
-- perannya sendiri menjadi guru.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Trigger: tolak perubahan role dari klien
-- ------------------------------------------------------------
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
as $$
begin
  -- auth.uid() null berarti dijalankan dari SQL Editor / service_role
  -- (pengelola), jadi perubahan role manual tetap diizinkan.
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

-- ------------------------------------------------------------
-- 2. Pastikan kolom yang diizinkan benar-benar ada
-- ------------------------------------------------------------
-- Proyek lama bisa dibuat sebelum kolom ini ditambahkan oleh
-- Docs/SQL-schema.sql. Tanpa langkah ini, GRANT di bawah gagal dengan
-- error 42703: column "grade" of relation "profiles" does not exist.
alter table public.profiles add column if not exists grade text;
alter table public.profiles add column if not exists accessibility_settings jsonb;

-- ------------------------------------------------------------
-- 3. Batasi kolom yang boleh di-UPDATE klien
-- ------------------------------------------------------------
-- Lapisan kedua: meskipun trigger dilepas, izin kolom tetap menolak `role`.
revoke update on public.profiles from authenticated;
grant update (name, grade, accessibility_settings) on public.profiles to authenticated;

-- ------------------------------------------------------------
-- 4. Verifikasi
-- ------------------------------------------------------------
-- a) Trigger harus ada (1 baris).
-- select tgname from pg_trigger where tgname = 'profiles_prevent_role_change';

-- b) Hanya 3 kolom aman yang boleh di-UPDATE. `role` TIDAK boleh muncul.
-- select column_name, privilege_type
-- from information_schema.column_privileges
-- where table_schema = 'public'
--   and table_name = 'profiles'
--   and grantee = 'authenticated'
--   and privilege_type = 'UPDATE'
-- order by column_name;

-- c) Policy UPDATE untuk profil sendiri harus ada.
-- select policyname, cmd
-- from pg_policies
-- where schemaname = 'public'
--   and tablename = 'profiles';

-- d) Periksa policy lama yang tidak ada di Docs/SQL-schema.sql.
--    Policy bersifat OR: satu policy longgar membatalkan policy ketat.
-- select policyname, cmd, qual
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, cmd;

-- ------------------------------------------------------------
-- 5. Uji cepat (jalankan sebagai pengguna login di aplikasi)
-- ------------------------------------------------------------
-- Dari Console browser saat login sebagai siswa:
--   await supabase.from('profiles').update({ role: 'guru' }).eq('id', '<id-siswa>')
-- Hasil yang benar: error "permission denied for table profiles"
-- atau "Peran akun hanya dapat diubah oleh pengelola."
--
-- Simpan pengaturan harus tetap berhasil:
--   await supabase.from('profiles')
--     .update({ accessibility_settings: { fontSize: 'large' } })
--     .eq('id', '<id-siswa>')
--
-- Catatan: menjalankan SQL ini TIDAK mengubah peran siapa pun. Akun guru yang
-- sudah ada tetap guru.
