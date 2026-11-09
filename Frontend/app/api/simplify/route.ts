import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, SYSTEM_PROMPT_SIMPLIFY_TEXT } from '@/lib/gemini';
import { validateSourceQuote } from '@/lib/source-validator';
import { ScanResult } from '@/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const titleHint =
      typeof body.titleHint === 'string' ? body.titleHint.trim() : '';

    if (!text) {
      return NextResponse.json(
        { error: 'Teks materi tidak boleh kosong.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY belum disetel pada server. Materi tetap bisa ditulis manual tanpa bantuan AI.',
        },
        { status: 503 }
      );
    }

    const model = getGeminiModel();
    const prompt = `${SYSTEM_PROMPT_SIMPLIFY_TEXT}${
      titleHint ? `\n\nJudul yang disarankan guru: "${titleHint}"` : ''
    }

Teks materi dari guru:
"""
${text}
"""

Sederhanakan teks di atas dan kembalikan JSON terstruktur sesuai skema.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedData: any;
    try {
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Gagal parse JSON Gemini (simplify):', responseText);
      return NextResponse.json(
        { error: 'AI mengembalikan format yang tidak valid. Silakan coba lagi.' },
        { status: 502 }
      );
    }

    const points = (parsedData.points || [])
      .filter((pt: any) => pt && typeof pt.text === 'string' && pt.text.trim())
      .map((pt: any, idx: number) => ({
        order: idx + 1,
        text: pt.text.trim(),
        analogy: pt.analogy || null,
        source_quote: pt.source_quote || '',
        is_valid_quote: validateSourceQuote(pt.source_quote, text),
      }));

    if (points.length === 0) {
      return NextResponse.json(
        {
          error:
            'AI belum bisa menyederhanakan teks itu. Coba tulis lebih lengkap atau bagi menjadi beberapa bagian.',
        },
        { status: 502 }
      );
    }

    const simplifyResult: ScanResult = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: titleHint || parsedData.title || 'Materi Pelajaran',
      ocr_text: text,
      points,
      glossary: parsedData.glossary || [],
      flashcards: (parsedData.flashcards || []).map((fc: any) => ({
        ...fc,
        is_valid_quote: validateSourceQuote(fc.source_quote, text),
      })),
      readable: true,
      created_at: new Date().toISOString(),
      stars_earned: 0,
    };

    return NextResponse.json(simplifyResult);
  } catch (error: any) {
    console.error('Error in /api/simplify:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan saat memproses teks.' },
      { status: 500 }
    );
  }
}
