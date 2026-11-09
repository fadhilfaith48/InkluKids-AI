/**
 * source-validator.ts
 * Memvalidasi apakah kutipan sumber (source_quote) benar-benar ada di teks OCR
 * sesuai spesifikasi pada Docs/AI.md.
 */

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // hapus tanda aksen/diakritik
    .replace(/[^\w\s]/g, ' ') // hapus tanda baca, ganti spasi
    .replace(/\s+/g, ' ') // rapikan spasi berlebih
    .trim();
}

/**
 * Validasi kutipan terhadap teks OCR.
 * Mengembalikan true jika cocok persis atau proporsi kata >= 0.85
 */
export function validateSourceQuote(quote: string, ocrText: string, threshold = 0.85): boolean {
  if (!quote || !ocrText) return false;

  const normQuote = normalizeText(quote);
  const normOcr = normalizeText(ocrText);

  if (!normQuote || !normOcr) return false;

  // 1. Cocok persis (substring)
  if (normOcr.includes(normQuote)) {
    return true;
  }

  // 2. Proporsi kata kutipan (abaikan kata <= 2 huruf)
  const words = normQuote.split(' ').filter((w) => w.length > 2);
  if (words.length === 0) {
    return normOcr.includes(normQuote);
  }

  let matchedWords = 0;
  for (const word of words) {
    if (normOcr.includes(word)) {
      matchedWords++;
    }
  }

  const ratio = matchedWords / words.length;
  return ratio >= threshold;
}
