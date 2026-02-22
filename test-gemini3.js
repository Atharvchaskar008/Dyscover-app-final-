const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const KEY1 = "AIzaSyBnw-V7e5g21euY8iarPHiqPsuz_r3fJX0";
const KEY2 = "AIzaSyATgBNL6iGsNqpcYApF8-s5F750x9HccZc"; // The vision one

let logData = "";

async function testModelKey(key, modelName) {
    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        logData += `[SUCCESS] Key: ${key.substring(0, 10)}... Model: ${modelName}\n`;
    } catch (e) {
        logData += `[FAILED] Key: ${key.substring(0, 10)}... Model: ${modelName} -> ${e.message}\n`;
    }
}

async function run() {
    logData += "---- Testing Key 1 (Original Gemini Key) ----\n";
    await testModelKey(KEY1, "gemini-1.5-flash");
    await testModelKey(KEY1, "gemini-1.5-pro");
    await testModelKey(KEY1, "gemini-pro");

    logData += "---- Testing Key 2 (Vision Key) ----\n";
    await testModelKey(KEY2, "gemini-1.5-flash");

    fs.writeFileSync("node-output.txt", logData);
}

run();
