-- Fitur "Materi Kelas": guru membuat materi sendiri lalu membagikannya ke siswa.
-- Jalankan di Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Aman dijalankan berulang (idempotent bila constraint sudah ada).

-- 1. Penanda salinan materi: baris milik siswa menunjuk ke materi asli guru.
alter table public.scans
  add column if not exists source_scan_id uuid
  references public.scans(id) on delete set null;

create index if not exists scans_source_scan_id_idx
  on public.scans (source_scan_id);

-- 2. Izinkan guru membuat salinan materi untuk siswa binaannya.
--    Hanya untuk siswa yang terhubung lewat guardianships.
drop policy if exists "scans_insert_teacher_share" on public.scans;

create policy "scans_insert_teacher_share"
on public.scans for insert
to authenticated
with check (public.is_teacher_of(owner_id));

-- Catatan:
-- - Policy update guru (scans_update_teacher pada Docs/SQL-schema.sql) dipakai
--   khusus untuk memperbarui salinan (source_scan_id is not null) saat guru
--   menekan "Bagikan" lagi, sedangkan perubahan poin scan asli siswa melalui RPC verify_scan.
-- - Siswa tetap tidak bisa mengubah materi milik guru, hanya salinannya sendiri.
