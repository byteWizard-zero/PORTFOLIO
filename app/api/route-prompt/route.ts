import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, systemInstruction } = await request.json();
    
    const proxyBase = (process.env.OPENAI_API_BASE || 'https://my-freellmapi-proxy.onrender.com/v1').replace(/\/$/, '');
    const proxyKey = process.env.OPENAI_API_KEY || 'freellmapi-ec75ec409b980a3248a3b64f0a702afb51781feb35d3ec23';
    
    const proxyResponse = await fetch(`${proxyBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${proxyKey}`
      },
      body: JSON.stringify({
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
    const text = data.choices?.[0]?.message?.content || '';
    
    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
