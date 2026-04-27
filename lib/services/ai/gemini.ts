import { logger } from '../../utils/logger';

/**
 * ⚡ Shoofly Gemini Gateway
 * A lightweight, dependency-free wrapper for Google Gemini 1.5 API.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_GEMINI_API_KEY') {
    logger.warn('ai.gemini.missing_key', { message: 'Using simulation mode as GEMINI_API_KEY is not set.' });
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  try {
    logger.info('ai.gemini.request_started', { promptLength: prompt.length });

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        system_instruction: systemInstruction ? {
          parts: [{ text: systemInstruction }]
        } : undefined,
        generation_config: {
          temperature: 0.2,
          top_p: 0.8,
          top_k: 40,
          max_output_tokens: 1024,
          response_mime_type: "application/json",
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error('Gemini API returned an empty response.');
    }

    logger.info('ai.gemini.request_completed');
    return resultText;
  } catch (error: any) {
    logger.error('ai.gemini.error', { error: error.message });
    throw error;
  }
}
