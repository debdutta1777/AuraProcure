const fs = require('fs');
const path = require('path');

async function listModels() {
    // 1. Get API Key
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
        } catch (e) { }
    }

    if (!apiKey) {
        console.error("No API Key found.");
        return;
    }

    // 2. Fetch Models via REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Fetching models from ${url}...`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS:");
            data.models.forEach(m => {
                // Filter for 'generateContent' supported models
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace("models/", "")} (${m.displayName})`);
                }
            });
        } else {
            console.error("❌ Error fetching models:", data);
        }

    } catch (error) {
        console.error("❌ Network error:", error);
    }
}

listModels();
