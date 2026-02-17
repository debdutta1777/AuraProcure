const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function findWorkingModel() {
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
        fs.writeFileSync('result.txt', 'FAILURE: No API Key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const candidates = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    let winner = null;

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            const text = response.text();
            winner = modelName;
            fs.writeFileSync('result.txt', `WINNER: ${winner}`);
            console.log(`WINNER: ${winner}`);
            return;
        } catch (error) {
            console.log(`Failed: ${modelName} - ${error.message.split('\n')[0]}`);
        }
    }

    fs.writeFileSync('result.txt', 'FAILURE: No working model found in candidates.');
}

findWorkingModel();
