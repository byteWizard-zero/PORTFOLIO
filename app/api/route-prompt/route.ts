import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, model, systemInstruction } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured on server' }, { status: 400 });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let text = '';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction 
            ? { parts: [{ text: systemInstruction }] } 
            : undefined,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Direct API returned status ${response.status}`);
      }

      const data = await response.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (directError) {
      console.warn("Direct Gemini API failed, attempting local FreeLLMAPI backup proxy:", directError);

      const proxyResponse = await fetch('http://localhost:3001/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer freellmapi-9a1c00a670d3d3d1a9a7b276f24e8c60e8ad730e2e110bb6`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        }),
      });

      if (!proxyResponse.ok) {
        const errorData = await proxyResponse.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.error?.message || 'FreeLLMAPI proxy call failed' },
          { status: proxyResponse.status }
        );
      }

      const data = await proxyResponse.json();
      text = data.choices?.[0]?.message?.content || '';
    }
    
    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
