import { ScanResult } from '@/types';
import { sampleLessons } from './seed-data';

const STORAGE_KEY = 'inklukids_history_v1';
const MAX_HISTORY = 20;

export function getHistory(): ScanResult[] {
  if (typeof window === 'undefined') return sampleLessons;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with default sample lessons if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleLessons));
      return sampleLessons;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return sampleLessons;
  } catch (err) {
    console.error('Gagal membaca riwayat:', err);
    return sampleLessons;
  }
}

export function saveToHistory(item: ScanResult): ScanResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    // Hilangkan image_preview agar tidak membebani kuota localStorage browser (privasi anak & zero image storage)
    const sanitizedItem: ScanResult = { ...item, image_preview: undefined };
    // Jika item dengan ID yang sama sudah ada, gantikan
    const filtered = current.filter((x) => x.id !== item.id);
    const updated = [sanitizedItem, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Gagal menyimpan riwayat:', err);
    return [];
  }
}

export function deleteFromHistory(id: string): ScanResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    const updated = current.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Gagal menghapus riwayat:', err);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Gagal membersihkan riwayat:', err);
  }
}
