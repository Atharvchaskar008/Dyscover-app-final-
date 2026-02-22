import { GoogleGenerativeAI } from '@google/generative-ai';

// Provided by user explicitly
const GEMINI_API_KEY = "AIzaSyCkmZghpqResmRUOpkNN6qMemwqnM50a2s";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const VISION_API_KEY = "AIzaSyC5hNFjBQfU-gkNuJm0dcKrk32PXVZwPHA";
export const VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

// The AI API Correction Engine: Automatically falls back if a Model is Not Found (404) or Restricted
const FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
];

const runWithFallback = async (promptData: any) => {
    let lastError: any = null;
    for (const modelName of FALLBACK_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(promptData);
            return result.response.text();
        } catch (err: any) {
            lastError = err;
            console.log(`[Correction Engine] Model ${modelName} failed. Trying next...`);
            // If the error isn't a 404/403 (model disabled), we should probably still try the next one just in case,
            // but for major auth issues, it will exhaust the list and throw safely.
        }
    }
    throw new Error(`Correction Engine exhausted all models. Last Error: ${lastError?.message || 'Unknown'}`);
};

/**
 * Simplifies text to make it dyslexia-friendly.
 */
export const simplifyText = async (text: string): Promise<{ simplified: string }> => {
    try {
        const prompt = `
      You are an AI assistant specialized in making content accessible for individuals with dyslexia.
      Please simplify the following text.
      Rules:
      1. Use short, crisp sentences.
      2. Avoid passive voice, metaphors, or complex vocabulary.
      3. Use simple, everyday words.
      4. Maintain the original meaning.
      
      Text: "${text}"
    `;

        const responseText = await runWithFallback(prompt);

        return { simplified: responseText.trim() };
    } catch (error) {
        console.error("Gemini Simplify Error:", error);
        throw new Error("Failed to simplify text. Please try again.");
    }
};

/**
 * Analyzes text to extract key concepts or explain it simply.
 */
export const analyzeContent = async (text: string): Promise<{ analysis: string, correctionSteps?: string[] }> => {
    try {
        const prompt = `
      You are an AI tutor helping a student with dyslexia understand a difficult piece of text.
      Analyze the text and explain its main points.
      RESPOND ONLY WITH VALID JSON no markdown, no code fences:
      {
         "analysis": "1-sentence summary followed by 2-3 bullet points with the most important takeaways. Keep tone encouraging.",
         "correctionSteps": ["Step 1 to improve text...", "Step 2...", "Step 3..."]
      }
      Rules:
      1. Provide a brief summary and bullet points in the analysis field.
      2. Provide exactly 3 actionable steps to make the text better or correct mistakes in the correctionSteps array.
      
      Text: "${text}"
    `;

        let responseText = await runWithFallback(prompt);
        responseText = responseText.trim();

        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/\`\`\`/g, '').trim();
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Analyze Error:", error);
        throw new Error("Failed to analyze content. Please try again.");
    }
};

/**
 * Uses Gemini Vision to extract readable text from an image (OCR).
 */
export const extractTextFromImage = async (base64Image: string): Promise<string> => {
    try {
        const prompt = `
      You are an AI assistant specialized in reading textbooks and worksheets for students with dyslexia.
      Please read the text in this image.
      Rules:
      1. Extract all readable text accurately.
      2. Format it clearly using paragraphs and simple bullet points if there are lists. 
      3. Do not add any extra commentary, just return the text found in the image.
    `;

        const responseText = await runWithFallback([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg"
                }
            }
        ]);

        return responseText.trim();
    } catch (error) {
        console.error("Gemini Vision OCR Error:", error);
        throw new Error("Failed to read the image. Please ensure the image is clear and try again.");
    }
};

/**
 * Uses Gemini to generate a short, dyslexia-friendly story about a given topic.
 */
export const generateStory = async (topic: string): Promise<string> => {
    try {
        const prompt = `
      You are an AI storyteller for students with dyslexia.
      Write a very short, engaging story about: "${topic}".
      Rules:
      1. Keep it under 150 words.
      2. Use simple, everyday vocabulary and short, crisp sentences.
      3. Avoid complex metaphors or confusing phrasing.
      4. Make the tone encouraging and fun.
    `;

        const responseText = await runWithFallback(prompt);
        return responseText.trim();
    } catch (error) {
        console.error("Gemini Story Error:", error);
        throw new Error("Failed to generate a story. Please try another topic.");
    }
};

/**
 * Uses Gemini to break a word into syllables and provide a simple meaning.
 */
export const analyzeWord = async (word: string): Promise<{ word: string, syllables: string[], meaning: string, example: string }> => {
    try {
        const prompt = `
      You are an English tutor for a dyslexic student. Analyze the word "${word}".
      Respond ONLY with a raw JSON object (no markdown tags) containing:
      {
         "word": "${word}",
         "syllables": ["list", "of", "syl", "la", "bles"],
         "meaning": "A very short, simple 1-sentence definition.",
         "example": "A short, easy-to-read sentence using the word."
      }
    `;

        let responseText = await runWithFallback(prompt);
        responseText = responseText.trim();

        // Clean up potential markdown code blocks
        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/\`\`\`/g, '').trim();
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Word Lab Error:", error);
        throw new Error("Failed to analyze word. Please ensure you entered a recognized English word.");
    }
};

/**
 * Uses Gemini to analyze a student's handwriting and return structured feedback.
 */
export const analyzeHandwriting = async (base64Image: string): Promise<{ flaws: any[], encouragement: string, topStrength: string, practiceHint: string }> => {
    try {
        const prompt = `You are a compassionate dyslexia specialist analysing a student's handwriting.
RESPOND ONLY WITH VALID JSON — no markdown, no code fences, no extra text:
{
  "flaws": [{ "type": "e.g. Letter Reversal", "detail": "one sentence", "severity": "mild|moderate|notable" }],
  "encouragement": "2-3 warm uplifting sentences in simple language",
  "topStrength": "one specific positive observation",
  "practiceHint": "one gentle actionable tip",
  "correctionSteps": ["Step 1...", "Step 2...", "Step 3..."]
}
Rules: max 4 flaws, max 3 simple correctionSteps, empty [] if writing is good, grade-5 vocabulary, always encouraging.`;

        let responseText = await runWithFallback([
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
            prompt
        ]);
        responseText = responseText.trim();

        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/\`\`\`/g, '').trim();
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Handwriting Error:", error);
        throw new Error("Failed to analyze handwriting. Please ensure the image is clear and try again.");
    }
};

/**
 * Runs Google Vision OCR on a base64 encoded image.
 */
export const runVisionOCR = async (base64Image: string): Promise<string | null> => {
    try {
        const body = {
            requests: [{
                image: { content: base64Image },
                features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
            }],
        };
        const res = await fetch(VISION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Vision API error: ${err}`);
        }

        const data = await res.json();
        const annotations = data.responses?.[0]?.textAnnotations;
        if (!annotations || annotations.length === 0) return null;

        return annotations[0].description.trim();
    } catch (error) {
        console.error("Vision OCR Error:", error);
        throw new Error("Failed to run OCR. Please check your connection and try again.");
    }
};
