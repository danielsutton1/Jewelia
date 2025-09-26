import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, quote } = body;

  let systemPrompt = `You are a luxury jewelry CRM assistant. Use the provided context to generate highly personalized, professional, and helpful responses. Be concise, warm, and actionable.`;

  let context = '';
  if (quote) {
    context = `\nQuote Details:\nClient: ${quote.client}\nItem: ${quote.item}\nQuote Number: ${quote.quoteNumber}\nDue Date: ${quote.dueDate}\nStatus: ${quote.status}\nNotes: ${quote.notes}`;
    systemPrompt = `You are a luxury jewelry CRM assistant. Use the provided quote details to generate highly personalized, professional, and friendly responses. Always use the client's name, item, and context. Be concise, warm, and helpful.`;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Missing OpenAI API key' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context ? `${context}\n\n${prompt}` : prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate AI response' }, { status: 500 });
  }
} 