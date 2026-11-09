import type { ScanResult, TeacherVerification } from '@/types';
import {
  getHistory,
  saveToHistory,
  deleteFromHistory,
} from './history';
import { dataMode, getSupabase } from './supabase';

/**
 * Lapisan data materi.
 *
 * Semua komponen cukup memanggil fungsi di file ini. Sumber datanya dipilih
 * lewat NEXT_PUBLIC_DATA_MODE:
 * - 'local'    → localStorage (perilaku demo saat ini)
 * - 'supabase' → tabel scans + teacher_verifications + quiz_results
 *
 * Bila Supabase gagal (offline, RLS, env salah), fungsi otomatis kembali ke
 * localStorage supaya demo tidak berhenti.
 */

const isRemote = dataMode === 'supabase';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function warn(message: string, error: unknown) {
  console.warn(`${message} Memakai penyimpanan lokal sebagai cadangan.`, error);
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Format tanggal verifikasi agar sama dengan tampilan lokal. */
function formatVerifiedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface VerificationRow {
  is_verified: boolean;
  edited: boolean | null;
  notes: string | null;
  verified_at: string | null;
  teacher?: { name: string | null } | null;
}

interface QuizRow {
  score: number | null;
  total: number | null;
  best_score: number | null;
  attempts: number | null;
  completed: boolean | null;
}

interface ScanRow {
  id: string;
  owner_id: string;
  title: string;
  ocr_text: string;
  points: ScanResult['points'] | null;
  glossary: ScanResult['glossary'] | null;
  flashcards: ScanResult['flashcards'] | null;
  readable: boolean;
  image_preview: string | null;
  stars_earned: number | null;
  lesson_completed: boolean | null;
  created_at: string;
  source_scan_id?: string | null;
  owner?: { name: string | null; role: ScanResult['owner_role'] | null } | null;
  // Relasi satu-ke-satu dari PostgREST bisa berupa objek, bukan array.
  teacher_verifications?: VerificationRow | VerificationRow[] | null;
  quiz_results?: QuizRow | QuizRow[] | null;
}

function pickOne<T>(value?: T | T[] | null): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function mapVerification(row?: VerificationRow | null): TeacherVerification | undefined {
  if (!row) return undefined;

  return {
    verifiedBy: row.teacher?.name?.trim() || 'Guru',
    verifiedAt: row.verified_at ? formatVerifiedAt(row.verified_at) : '',
    notes: row.notes || '',
    isVerified: row.is_verified,
    edited: row.edited === true,
  };
}

function mapScanRow(row: ScanRow): ScanResult {
  const verification = pickOne(row.teacher_verifications);
  const quiz = pickOne(row.quiz_results);

  return {
    id: row.id,
    owner_id: row.owner_id,
    owner_name: row.owner?.name?.trim() || undefined,
    owner_role: row.owner?.role ?? undefined,
    source_scan_id: row.source_scan_id ?? undefined,
    title: row.title,
    ocr_text: row.ocr_text,
    points: row.points ?? [],
    glossary: row.glossary ?? [],
    flashcards: row.flashcards ?? [],
    readable: row.readable,
    created_at: row.created_at,
    image_preview: row.image_preview ?? undefined,
    stars_earned: row.stars_earned ?? 0,
    lesson_completed: row.lesson_completed === true,
    teacher_verification: mapVerification(verification),
    quiz_score: quiz?.score ?? undefined,
    quiz_total: quiz?.total ?? undefined,
    quiz_best_score: quiz?.best_score ?? undefined,
    quiz_attempts: quiz?.attempts ?? undefined,
    quiz_completed: quiz?.completed === true,
  };
}

function scanToRow(item: ScanResult, ownerId: string, id: string) {
  return {
    id,
    owner_id: ownerId,
    title: item.title,
    ocr_text: item.ocr_text,
    points: item.points ?? [],
    glossary: item.glossary ?? [],
    flashcards: item.flashcards ?? [],
    readable: item.readable,
    image_preview: item.image_preview ?? null,
    stars_earned: item.stars_earned ?? 0,
    lesson_completed: item.lesson_completed === true,
  };
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await getSupabase().auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

export interface SaveMaterialResult {
  items: ScanResult[];
  saved: ScanResult;
}

/** Ambil seluruh materi (plus verifikasi guru dan hasil kuis). */
export async function listMaterials(): Promise<ScanResult[]> {
  if (!isRemote) return getHistory();

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('scans')
      .select(
        `*,
         owner:profiles (name, role),
         teacher_verifications (*, teacher:profiles (name)),
         quiz_results (*)`
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    return ((data || []) as unknown as ScanRow[]).map(mapScanRow);
  } catch (error) {
    warn('Gagal memuat materi dari Supabase.', error);
    return getHistory();
  }
}

/**
 * Simpan materi baru atau perbarui materi yang sudah ada.
 * Hanya pemilik materi (siswa) yang boleh menulis.
 */
export async function saveMaterial(item: ScanResult): Promise<SaveMaterialResult> {
  if (!isRemote) {
    return { items: saveToHistory(item), saved: item };
  }

  try {
    const supabase = getSupabase();
    const ownerId = await currentUserId();
    if (!ownerId) throw new Error('Belum ada sesi login.');

    const id = isUuid(item.id) ? item.id : crypto.randomUUID();
    const { error } = await supabase
      .from('scans')
      .upsert(scanToRow(item, ownerId, id), { onConflict: 'id' });

    if (error) throw error;

    const items = await listMaterials();
    const saved = items.find((lesson) => lesson.id === id) ?? { ...item, id };
    return { items, saved };
  } catch (error) {
    warn('Gagal menyimpan materi ke Supabase.', error);
    return { items: saveToHistory(item), saved: item };
  }
}

/** Hapus materi milik sendiri. */
export async function deleteMaterial(id: string): Promise<ScanResult[]> {
  if (!isRemote || !isUuid(id)) {
    return deleteFromHistory(id);
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('scans').delete().eq('id', id);
    if (error) throw error;
    return await listMaterials();
  } catch (error) {
    warn('Gagal menghapus materi dari Supabase.', error);
    return deleteFromHistory(id);
  }
}

/**
 * Simpan verifikasi guru: status, catatan, dan poin yang mungkin disunting.
 * Poin disimpan ke scans agar siswa melihat hasil yang sama di perangkat lain.
 */
export async function saveVerification(item: ScanResult): Promise<SaveMaterialResult> {
  const verification = item.teacher_verification;

  if (!isRemote) {
    return { items: saveToHistory(item), saved: item };
  }

  if (!isUuid(item.id)) {
    // Materi contoh/lokal belum punya id database.
    return { items: saveToHistory(item), saved: item };
  }

  try {
    const supabase = getSupabase();
    const teacherId = await currentUserId();
    if (!teacherId) throw new Error('Belum ada sesi login.');

    const { data: updatedScans, error: scanError } = await supabase
      .from('scans')
      .update({
        title: item.title,
        points: item.points ?? [],
      })
      .eq('id', item.id)
      .select('id');

    if (scanError) throw scanError;

    if (!updatedScans || updatedScans.length === 0) {
      // Policy untuk guru menyunting materi siswa belum ada. Verifikasi tetap
      // disimpan, tetapi judul/poin hasil suntingan belum tersinkron.
      console.warn(
        'Judul/poin materi tidak tersimpan ke Supabase. Jalankan policy "scans_update_teacher" agar guru bisa menyinkronkan suntingan.'
      );
    }

    const { error: verificationError } = await supabase
      .from('teacher_verifications')
      .upsert(
        {
          scan_id: item.id,
          teacher_id: teacherId,
          is_verified: verification?.isVerified === true,
          edited: verification?.edited === true,
          notes: verification?.notes || '',
          verified_at: nowIso(),
        },
        { onConflict: 'scan_id' }
      );

    if (verificationError) throw verificationError;

    const items = await listMaterials();
    const saved = items.find((lesson) => lesson.id === item.id) ?? item;
    return { items, saved };
  } catch (error) {
    warn('Gagal menyimpan verifikasi ke Supabase.', error);
    return { items: saveToHistory(item), saved: item };
  }
}

/**
 * Bagikan materi milik guru ke semua siswa binaannya.
 *
 * Caranya: buat salinan materi untuk tiap siswa (owner_id = siswa,
 * source_scan_id = materi guru). Dengan begitu kuis, progres, dan badge
 * skor tetap memakai alur yang sudah ada tanpa mengubah tabel lain.
 */
export async function shareMaterialToStudents(
  material: ScanResult
): Promise<{ items: ScanResult[]; sharedCount: number; error?: string }> {
  if (!isRemote || !isUuid(material.id)) {
    return { items: getHistory(), sharedCount: 0 };
  }

  try {
    const supabase = getSupabase();
    const teacherId = await currentUserId();
    if (!teacherId) throw new Error('Belum ada sesi login.');

    const { data: links, error: linkError } = await supabase
      .from('guardianships')
      .select('student_id')
      .eq('teacher_id', teacherId);

    if (linkError) throw linkError;

    const studentIds = Array.from(
      new Set(
        ((links || []) as { student_id: string }[])
          .map((link) => link.student_id)
          .filter(Boolean)
      )
    );

    if (studentIds.length === 0) {
      return { items: await listMaterials(), sharedCount: 0 };
    }

    // Salinan yang sudah pernah dibagikan, supaya tidak menumpuk.
    const { data: existing, error: existingError } = await supabase
      .from('scans')
      .select('id, owner_id')
      .eq('source_scan_id', material.id);

    if (existingError) throw existingError;

    const copyByOwner = new Map<string, string>();
    for (const row of (existing || []) as { id: string; owner_id: string }[]) {
      copyByOwner.set(row.owner_id, row.id);
    }

    for (const studentId of studentIds) {
      const existingId = copyByOwner.get(studentId);

      if (existingId) {
        // Perbarui isi salinan, tetapi pertahankan bintang & progres siswa.
        const { error } = await supabase
          .from('scans')
          .update({
            title: material.title,
            ocr_text: material.ocr_text,
            points: material.points ?? [],
            glossary: material.glossary ?? [],
            flashcards: material.flashcards ?? [],
            readable: material.readable,
          })
          .eq('id', existingId);

        if (error) throw error;
        continue;
      }

      const copyId = crypto.randomUUID();
      const { error } = await supabase.from('scans').insert({
        ...scanToRow(material, studentId, copyId),
        source_scan_id: material.id,
      });

      if (error) throw error;
    }

    return { items: await listMaterials(), sharedCount: studentIds.length };
  } catch (error) {
    warn('Gagal membagikan materi ke siswa.', error);
    return {
      items: await listMaterials(),
      sharedCount: 0,
      error:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat membagikan materi.',
    };
  }
}

/**
 * Simpan hasil kuis + kemajuan belajar.
 * Hasil kuis menyimpan skor terakhir, total soal, skor terbaik, dan percobaan.
 */
export async function saveQuizResult(
  item: ScanResult,
  score: number,
  total: number
): Promise<SaveMaterialResult> {
  if (!isRemote) {
    return { items: saveToHistory(item), saved: item };
  }

  if (!isUuid(item.id)) {
    return { items: saveToHistory(item), saved: item };
  }

  try {
    const supabase = getSupabase();
    const studentId = await currentUserId();
    if (!studentId) throw new Error('Belum ada sesi login.');

    // Kemajuan (bintang, status selesai) tetap disimpan di scans.
    const { error: scanError } = await supabase
      .from('scans')
      .update({
        stars_earned: item.stars_earned ?? 0,
        lesson_completed: item.lesson_completed === true,
      })
      .eq('id', item.id);

    if (scanError) throw scanError;

    const { error: quizError } = await supabase.from('quiz_results').upsert(
      {
        scan_id: item.id,
        student_id: studentId,
        score,
        total,
        best_score: item.quiz_best_score ?? score,
        attempts: item.quiz_attempts ?? 1,
        completed: item.quiz_completed === true,
        updated_at: nowIso(),
      },
      { onConflict: 'scan_id' }
    );

    if (quizError) throw quizError;

    const items = await listMaterials();
    const saved = items.find((lesson) => lesson.id === item.id) ?? item;
    return { items, saved };
  } catch (error) {
    warn('Gagal menyimpan hasil kuis ke Supabase.', error);
    return { items: saveToHistory(item), saved: item };
  }
}
