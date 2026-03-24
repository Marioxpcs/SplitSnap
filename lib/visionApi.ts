// Google Cloud Vision API — DOCUMENT_TEXT_DETECTION
// Docs: https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate
const VISION_API_KEY = process.env.EXPO_PUBLIC_VISION_API_KEY!;
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

/**
 * Send a base64-encoded image to Cloud Vision and return the full OCR text.
 *
 * @param base64Image  Raw base64 string — no "data:image/..." prefix.
 * @returns            The concatenated text found in the image.
 */
export async function extractTextFromImage(base64Image: string): Promise<string> {
  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
      },
    ],
  };

  const response = await fetch(VISION_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const msg = await response.text().catch(() => response.statusText);
    throw new Error(`Vision API error ${response.status}: ${msg}`);
  }

  const data = await response.json();

  // DOCUMENT_TEXT_DETECTION returns fullTextAnnotation with the complete text block
  const fullText: string =
    data.responses?.[0]?.fullTextAnnotation?.text ??
    data.responses?.[0]?.textAnnotations?.[0]?.description ??
    '';

  return fullText;
}
