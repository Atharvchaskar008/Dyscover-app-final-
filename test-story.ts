import { generateStory } from './src/services/gemini';

async function run() {
    try {
        console.log("Generating simple story...");
        const result = await generateStory("a magic flying cat");
        console.log("SUCCESS:");
        console.log(result);
    } catch (e) {
        console.error("ERROR:", e);
    }
}

run();
