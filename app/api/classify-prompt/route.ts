import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured on server' }, { status: 400 });
    }

    const systemInstruction = `
Classify the user prompt into three categories: 'code' (for programming, algorithms, database queries, syntax questions), 'creative' (for marketing copies, design concepts, creative writing, brainstorming), and 'debug' (for error messages, docker issues, logs diagnostics, troubleshooting).
You must output your confidence scores as a JSON object with keys 'code', 'creative', and 'debug' where the values are integers summing up to 100.
Example:
{
  "code": 85,
  "creative": 5,
  "debug": 10
}
Output only the raw JSON. Do not include markdown block markers like \`\`\`json or \`\`\`. Do not include any thoughts or explanation.
`;

    const model = 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `User Prompt: "${prompt}"` }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          maxOutputTokens: 128,
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || 'Gemini classification call failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    try {
      const scores = JSON.parse(text.trim());
      if (
        typeof scores.code === 'number' &&
        typeof scores.creative === 'number' &&
        typeof scores.debug === 'number'
      ) {
        return NextResponse.json(scores);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ error: 'Failed to parse classification JSON', rawText: text }, { status: 500 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
