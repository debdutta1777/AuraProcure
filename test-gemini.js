const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
    // Manual .env.local parsing
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        try {
            const envPath = path.resolve(__dirname, '.env.local');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/GEMINI_API_KEY=(.+)/);
                if (match && match[1]) {
                    apiKey = match[1].trim();
                }
            }
        } catch (e) {
            console.error("Error reading .env.local:", e);
        }
    }

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found.");
        return;
    }

    console.log("🔑 API Key loaded.");
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = [
        "gemini-1.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-pro"
    ];

    console.log("----------------------------------------");
    for (const modelName of models) {
        console.log(`Testing [${modelName}]...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Ready'");
            const response = await result.response;
            console.log(`✅ [${modelName}] SUCCEEDED. Response: ${response.text().trim()}`);
        } catch (error) {
            console.log(`❌ [${modelName}] FAILED.`);
            // console.error(error); // Uncomment for full error
        }
        console.log("----------------------------------------");
    }
}

run();
