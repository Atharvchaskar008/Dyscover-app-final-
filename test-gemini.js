const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = "AIzaSyBnw-V7e5g21euY8iarPHiqPsuz_r3fJX0";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testModel(modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hi");
        console.log(`[SUCCESS] ${modelName}:`, result.response.text());
        return true;
    } catch (e) {
        console.error(`[FAILED] ${modelName}:`, e.message);
        return false;
    }
}

async function run() {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-latest");
    await testModel("gemini-pro");
    await testModel("gemini-1.5-pro");
    await testModel("gemini-1.0-pro");
}

run();
