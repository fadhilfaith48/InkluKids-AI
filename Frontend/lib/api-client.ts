import { ScanResult, ExplanationResult } from '@/types';
import { getSupabase, isSupabaseConfigured } from './supabase';

/**
 * Basis URL backend FastAPI.
 * - Diisi lewat NEXT_PUBLIC_API_BASE_URL (mis. http://localhost:8000).
 * - Bila kosong, aplikasi memakai Route Handler Next.js yang sudah ada.
 * - Bila backend tidak dapat dihubungi, permintaan otomatis jatuh ke Route
 *   Handler lokal agar demo tetap berjalan.
 */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

interface ErrorPayload {
  error?: string;
  detail?: string;
}

/**
 * Ambil token akses Supabase bila pengguna sedang login.
 *
 * Backend memverifikasi token ini (JWT) supaya endpoint AI tidak bisa dipakai
 * pihak lain untuk menghabiskan kuota Gemini. Tamu tetap boleh memakai demo:
 * tanpa sesi, header tidak dikirim dan backend berjalan di mode `optional`.
 */
async function authHeaders(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured) return {};

  try {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    // Gagal membaca sesi tidak boleh memblokir demo tamu.
    return {};
  }
}

async function postJson<T>(path: string, body: unknown, fallbackMessage: string): Promise<T> {
  const requestInit: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  };

  let response: Response;

  if (API_BASE_URL) {
    try {
      response = await fetch(`${API_BASE_URL}${path}`, requestInit);
    } catch (networkError) {
      // Backend belum dijalankan: pakai route handler Next.js sebagai cadangan.
      console.warn('Backend FastAPI tidak dapat dihubungi. Memakai route handler lokal.', networkError);
      response = await fetch(path, requestInit);
    }
  } else {
    response = await fetch(path, requestInit);
  }

  if (!response.ok) {
    const errorData: ErrorPayload = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.detail ||
        `${fallbackMessage} (Status: ${response.status})`
    );
  }

  return (await response.json()) as T;
}

/**
 * Siapkan gambar di sisi klien (Green IT) sebelum dikirim ke backend:
 * - Sisi terpanjang maksimal 2000px, tanpa memperbesar gambar yang lebih kecil.
 * - JPEG kualitas 0.9, diturunkan bertahap bila ukuran melebihi batas.
 * - Latar putih untuk PNG transparan agar tidak menjadi hitam.
 * - Base64 dijaga di bawah ~9 MB (batas backend 10 MB).
 *
 * Resolusi perlu cukup tinggi agar teks halaman buku masih terbaca oleh OCR.
 */
const MAX_IMAGE_DIMENSION = 2000;
const MAX_BASE64_BYTES = 9 * 1024 * 1024;
const JPEG_QUALITIES = [0.9, 0.8, 0.7, 0.6];
const MIN_IMAGE_DIMENSION = 400;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar untuk dikompres'));
    img.src = dataUrl;
  });
}

function drawToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Gagal menginisialisasi canvas untuk kompresi');
  }

  // Latar putih: JPEG tidak mendukung transparansi (akan menjadi hitam).
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

export async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const longestSide = Math.max(img.width, img.height) || MAX_IMAGE_DIMENSION;
  let scale = longestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestSide : 1;

  for (;;) {
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = drawToCanvas(img, width, height);

    for (const quality of JPEG_QUALITIES) {
      const encoded = canvas.toDataURL('image/jpeg', quality);
      const base64 = encoded.split(',')[1] || '';

      // base64 mengembang ~4/3 dari ukuran byte aslinya.
      if (base64 && base64.length * 0.75 <= MAX_BASE64_BYTES) {
        return { base64, mimeType: 'image/jpeg' };
      }
    }

    // Masih terlalu besar: turunkan dimensi 20% lalu ulangi.
    if (Math.min(width, height) <= MIN_IMAGE_DIMENSION) {
      throw new Error(
        'Gambar terlalu besar. Silakan pilih foto dengan ukuran lebih kecil ya.'
      );
    }
    scale *= 0.8;
  }
}

export async function scanBookImage(
  imageBase64: string,
  mimeType: string,
  imagePreview?: string
): Promise<ScanResult> {
  return postJson<ScanResult>(
    '/api/scan',
    { imageBase64, mimeType, imagePreview },
    'Gagal memindai buku'
  );
}

export async function simplifyMaterialText(
  text: string,
  titleHint?: string
): Promise<ScanResult> {
  return postJson<ScanResult>(
    '/api/simplify',
    { text, titleHint: titleHint || undefined },
    'Gagal menyederhanakan teks materi'
  );
}

export async function askAITutor(
  pointText: string,
  ocrText: string,
  requestType: 'lebih_mudah' | 'beri_contoh' | 'kata_sulit'
): Promise<ExplanationResult> {
  return postJson<ExplanationResult>(
    '/api/explain',
    { pointText, ocrText, requestType },
    'Gagal meminta penjelasan'
  );
}
