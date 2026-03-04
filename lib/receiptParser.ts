// Receipt parser — uses Claude to extract structured data from raw OCR text.
//
// TODO: move API key to an environment variable (e.g. via expo-constants / .env)
const ANTHROPIC_API_KEY = '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';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// claude-haiku-4-5 is the latest Haiku model (faster + cheaper than Sonnet/Opus)
const MODEL = 'claude-haiku-4-5-20251001';

import type { ReceiptData } from '../types';

const SYSTEM_PROMPT = `You are a receipt parser. The user will give you raw OCR text from a receipt.
Extract the line items, subtotal, tax, tip, and total, then respond with ONLY a valid JSON object — no explanation, no markdown fences.

Schema:
{
  "items": [{ "name": string, "price": number }],
  "subtotal": number,
  "tax": number,
  "tip": number,
  "total": number
}

Rules:
- All monetary values must be plain numbers (no currency symbols).
- If a field is not present on the receipt, use 0.
- If the total is not explicit, sum items + tax + tip.
- Omit items that are $0 or clearly not food/product line items (e.g. table numbers).`;

/**
 * Parse raw OCR text from a receipt into structured ReceiptData.
 * Calls the Anthropic Messages API with claude-haiku-4-5.
 */
export async function parseReceiptText(rawText: string): Promise<ReceiptData> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the receipt OCR text:\n\n${rawText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Anthropic API error ${response.status}: ${msg}`);
  }

  const data = await response.json();
  const content: string = data.content?.[0]?.text ?? '';

  // Strip any accidental markdown fences before parsing
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: ReceiptData;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON:\n${content}`);
  }

  // Ensure required fields exist with safe defaults
  return {
    items: parsed.items ?? [],
    subtotal: parsed.subtotal ?? 0,
    tax: parsed.tax ?? 0,
    tip: parsed.tip ?? 0,
    total: parsed.total ?? 0,
  };
}
