const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testApiVersions() {
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
        fs.writeFileSync('result_v.txt', 'FAILURE: No API Key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-pro"];
    const apiVersions = ["v1", "v1beta"];

    for (const modelName of models) {
        for (const version of apiVersions) {
            try {
                console.log(`Testing ${modelName} with ${version}...`);
                // Note: The Node SDK version might not expose apiVersion in getGenerativeModel options directly in all versions, 
                // but recent ones do. If not, it ignores it.
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: version });
                const result = await model.generateContent("Test");
                const response = await result.response;
                const text = response.text();

                const msg = `SUCCESS: ${modelName} with ${version} worked.`;
                fs.writeFileSync('result_v.txt', msg);
                console.log(msg);
                return;
            } catch (error) {
                console.log(`Failed ${modelName} (${version}): ${error.message.split('\n')[0]}`);
            }
        }
    }

    fs.writeFileSync('result_v.txt', 'FAILURE: No working combination found.');
}

testApiVersions();
