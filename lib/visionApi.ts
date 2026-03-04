// Google Cloud Vision API integration stub
// Docs: https://cloud.google.com/vision/docs/reference/rest

const VISION_API_KEY = 'YOUR_GOOGLE_CLOUD_VISION_API_KEY';
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

export type VisionAnnotation = {
  description: string;
  boundingPoly?: {
    vertices: Array<{ x: number; y: number }>;
  };
};

export type ReceiptParseResult = {
  rawText: string;
  totalAmount?: number;
  lineItems: Array<{
    description: string;
    amount: number;
  }>;
  currency?: string;
  date?: string;
  merchantName?: string;
};

/**
 * Send a base64-encoded image to the Vision API for OCR text detection.
 * Returns the raw response from the API.
 */
export async function detectTextInImage(
  base64Image: string
): Promise<VisionAnnotation[]> {
  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
      },
    ],
  };

  const response = await fetch(VISION_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const textAnnotations: VisionAnnotation[] =
    data.responses?.[0]?.textAnnotations ?? [];

  return textAnnotations;
}

/**
 * High-level helper: take a receipt image (base64) and extract
 * structured expense data. Parsing logic to be implemented.
 */
export async function parseReceiptImage(
  base64Image: string
): Promise<ReceiptParseResult> {
  const annotations = await detectTextInImage(base64Image);
  const rawText = annotations[0]?.description ?? '';

  // TODO: implement receipt parsing logic
  // - Extract total amount using regex / LLM
  // - Extract line items
  // - Extract merchant name and date
  return {
    rawText,
    lineItems: [],
  };
}
