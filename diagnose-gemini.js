const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function diagnoseGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env.local");
        return;
    }

    console.log("🔑 API Key found (starts with):", apiKey.substring(0, 8) + "...");
    const genAI = new GoogleGenerativeAI(apiKey);

    console.log("\n🔍 Listing available models...");

    try {
        // This is the correct way to list models in the node SDK if supported, 
        // or we have to use the REST API manually if the SDK doesn't expose it easily.
        // The SDK content unfortunately doesn't always have a direct 'listModels' on the instance in earlier versions,
        // but let's try the model manager if it exists, or fallback to a known list.

        // Actually, for the JS SDK, we often just try to use models.
        // Let's try to fetch model info if possible, or just test a few common ones.

        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro",
            "gemini-2.0-flash-exp"
        ];

        for (const modelName of modelsToTest) {
            console.log(`\n🧪 Testing model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test only: Say 'OK'");
                const response = await result.response;
                console.log(`✅ ${modelName} WORKED! Response: ${response.text().trim()}`);
            } catch (error) {
                console.log(`❌ ${modelName} FAILED:`, error.message.split('\n')[0]);
                if (error.message.includes("404")) {
                    console.log(`   -> Model not found or not supported in this API version.`);
                }
            }
        }

    } catch (error) {
        console.error("❌ General Error:", error);
    }
}

diagnoseGemini();
