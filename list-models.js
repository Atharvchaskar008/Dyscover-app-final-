const KEY1 = "AIzaSyBnw-V7e5g21euY8iarPHiqPsuz_r3fJX0";
const KEY2 = "AIzaSyATgBNL6iGsNqpcYApF8-s5F750x9HccZc";

async function checkModels(key, name) {
    console.log(`\n--- Checking ${name} ---`);
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.error) {
            console.error(JSON.stringify(data.error, null, 2));
        } else {
            const models = data.models.map(m => m.name);
            console.log(`Found ${models.length} models. First few:`, models.slice(0, 5));
            console.log("Includes gemini-1.5-flash?", models.includes("models/gemini-1.5-flash"));
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

async function run() {
    await checkModels(KEY1, "KEY1 (Original)");
    await checkModels(KEY2, "KEY2 (Vision)");
}

run();
