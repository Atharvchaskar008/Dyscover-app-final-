const fs = require('fs');
const KEY1 = "AIzaSyBnw-V7e5g21euY8iarPHiqPsuz_r3fJX0";
const KEY2 = "AIzaSyATgBNL6iGsNqpcYApF8-s5F750x9HccZc";

async function checkModels(key, name) {
    let result = { name, error: null, models: null };
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.error) {
            result.error = data.error;
        } else {
            result.models = data.models.map(m => m.name);
        }
    } catch (e) {
        result.error = e.message;
    }
    return result;
}

async function run() {
    const res1 = await checkModels(KEY1, "KEY1");
    const res2 = await checkModels(KEY2, "KEY2");
    fs.writeFileSync('api-check.json', JSON.stringify([res1, res2], null, 2));
}

run();
