const { GoogleGenerativeAI } = require('@google/generative-ai');

const KEY1 = "AIzaSyBnw-V7e5g21euY8iarPHiqPsuz_r3fJX0";
const KEY2 = "AIzaSyATgBNL6iGsNqpcYApF8-s5F750x9HccZc"; // The vision one

async function testModelKey(key, modelName) {
    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        console.log(`[SUCCESS] Key: ${key.substring(0, 10)}... Model: ${modelName}`);
    } catch (e) {
        let msg = e.message;
        if (msg.includes("API key not valid")) msg = "Invalid Auth";
        console.log(`[FAILED] Key: ${key.substring(0, 10)}... Model: ${modelName} -> ${msg}`);
    }
}

async function run() {
    console.log("---- Testing Key 1 (Original Gemini Key) ----");
    await testModelKey(KEY1, "gemini-1.5-flash");
    await testModelKey(KEY1, "gemini-1.5-flash-latest");
    await testModelKey(KEY1, "gemini-pro");

    console.log("---- Testing Key 2 (Vision Key) ----");
    await testModelKey(KEY2, "gemini-1.5-flash");
    await testModelKey(KEY2, "gemini-1.5-flash-latest");
    await testModelKey(KEY2, "gemini-pro");
}

run();
