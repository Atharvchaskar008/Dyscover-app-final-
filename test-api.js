const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = "AIzaSyCkmZghpqResmRUOpkNN6qMemwqnM50a2s";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
];

const runWithFallback = async (promptData) => {
    let lastError = null;
    for (const modelName of FALLBACK_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(promptData);
            return result.response.text();
        } catch (err) {
            lastError = err;
            console.log(`[Correction Engine] Model ${modelName} failed. Trying next...`);
        }
    }
    throw new Error(`Correction Engine exhausted all models. Last Error: ${lastError?.message || 'Unknown'}`);
};

async function testStory() {
    console.log("Generating simple story...");
    try {
        const prompt = `Write a very short story about a magic flying cat.`;
        const result = await runWithFallback(prompt);
        console.log("=========================================");
        console.log("SUCCESS:");
        console.log(result);
        console.log("=========================================");
    } catch (e) {
        console.error("ERROR:", e);
    }
}

testStory();
