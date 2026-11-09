import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, SYSTEM_PROMPT_SCAN } from '@/lib/gemini';
import { validateSourceQuote } from '@/lib/source-validator';
import { ScanResult } from '@/types';

export const maxDuration = 60; // Allow sufficient time for vision OCR model

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, imagePreview } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'Gambar tidak ditemukan. Silakan unggah foto halaman buku.' },
        { status: 400 }
      );
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const selectedMime = validMimes.includes(mimeType) ? mimeType : 'image/jpeg';

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY belum disetel pada server. Anda dapat mencoba mode contoh materi di modal pindai untuk demonstrasi.',
        },
        { status: 500 }
      );
    }

    const model = getGeminiModel();

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: selectedMime,
      },
    };

    const prompt = `${SYSTEM_PROMPT_SCAN}\n\nSilakan baca foto halaman buku berikut, sederhanakan, dan kembalikan JSON terstruktur sesuai skema.`;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Parse JSON hasil dari Gemini
    let parsedData: any;
    try {
      // Bersihkan kemungkinan code block markdown jika ada
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Gagal parse JSON Gemini:', responseText);
      return NextResponse.json(
        { error: 'AI mengembalikan format yang tidak valid. Silakan coba pindai kembali.' },
        { status: 502 }
      );
    }

    if (!parsedData.readable) {
      return NextResponse.json(
        {
          error:
            'Foto terlihat terlalu buram atau bukan halaman buku teks pelajaran. Silakan ambil foto ulang dengan pencahayaan yang cukup.',
          readable: false,
        },
        { status: 422 }
      );
    }

    const ocrText = parsedData.ocr_text || '';

    // Validasi kutipan sumber (Explainable AI)
    const validatedPoints = (parsedData.points || []).map((pt: any, idx: number) => {
      const isValid = validateSourceQuote(pt.source_quote, ocrText);
      return {
        order: pt.order || idx + 1,
        text: pt.text,
        analogy: pt.analogy || null,
        source_quote: pt.source_quote || '',
        is_valid_quote: isValid,
      };
    });

    // Validasi kutipan untuk flashcards jika ada
    const validatedFlashcards = (parsedData.flashcards || []).map((fc: any) => {
      const isValid = validateSourceQuote(fc.source_quote, ocrText);
      return {
        ...fc,
        is_valid_quote: isValid,
      };
    });

    const scanResult: ScanResult = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: parsedData.title || 'Materi Pelajaran',
      ocr_text: ocrText,
      points: validatedPoints,
      glossary: parsedData.glossary || [],
      flashcards: validatedFlashcards,
      readable: true,
      created_at: new Date().toISOString(),
      image_preview: imagePreview || undefined,
      stars_earned: 0,
    };

    return NextResponse.json(scanResult);
  } catch (error: any) {
    console.error('Error in /api/scan:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan saat memproses gambar.' },
      { status: 500 }
    );
  }
}
