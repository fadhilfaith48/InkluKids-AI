import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, SYSTEM_PROMPT_EXPLAIN } from '@/lib/gemini';
import { rateLimitRequest, RATE_LIMIT_MESSAGE } from '@/lib/server-rate-limit';
import { validateSourceQuote } from '@/lib/source-validator';
import { ExplanationResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimitRequest(req);
    if (!limited.ok) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
      );
    }

    const body = await req.json();
    const { pointText, ocrText, requestType } = body;

    if (!pointText || !ocrText) {
      return NextResponse.json(
        { error: 'pointText dan ocrText wajib disertakan.' },
        { status: 400 }
      );
    }

    const validTypes = ['lebih_mudah', 'beri_contoh', 'kata_sulit'];
    const chosenType = validTypes.includes(requestType) ? requestType : 'lebih_mudah';

    if (!process.env.GEMINI_API_KEY) {
      // Mock explanation fallback if API key is not yet set
      let mockText = '';
      if (chosenType === 'lebih_mudah') {
        mockText = `Intinya: ${pointText} (dijelaskan lebih sederhana agar mudah diingat).`;
      } else if (chosenType === 'beri_contoh') {
        mockText = `Contoh dalam kehidupan: ${pointText} sering kita jumpai di sekitar kita setiap hari.`;
      } else {
        mockText = `Kata penting pada materi ini berkaitan langsung dengan isi bacaan halaman buku.`;
      }

      const mockResult: ExplanationResult = {
        text: mockText,
        source_quote: ocrText.slice(0, 100),
        is_valid_quote: true,
      };
      return NextResponse.json(mockResult);
    }

    const model = getGeminiModel();

    const userPrompt = `
${SYSTEM_PROMPT_EXPLAIN}

Poin yang ditanyakan: "${pointText}"
Jenis Permintaan: "${chosenType}"
Teks Halaman Buku:
"""
${ocrText}
"""
    `.trim();

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    let parsedData: any;
    try {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      return NextResponse.json(
        { error: 'Format respon tutor tidak valid.' },
        { status: 502 }
      );
    }

    const sourceQuote = parsedData.source_quote || '';
    const isValid = validateSourceQuote(sourceQuote, ocrText);

    const explanationResult: ExplanationResult = {
      text: parsedData.text || '',
      source_quote: sourceQuote,
      is_valid_quote: isValid,
    };

    return NextResponse.json(explanationResult);
  } catch (error: any) {
    console.error('Error in /api/explain:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan pada layanan tutor.' },
      { status: 500 }
    );
  }
}
