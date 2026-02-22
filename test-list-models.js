const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const KEY1 = "AIzaSyBnw-V7e5g21euY8iarPHiqPsuz_r3fJX0";

async function run() {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${KEY1}`);
        const data = await res.json();
        fs.writeFileSync("models.json", JSON.stringify(data, null, 2));
        console.log("Successfully fetched models.");
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}
run();
