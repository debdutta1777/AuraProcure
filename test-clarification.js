// Using global fetch (Node 18+)

async function testClarification() {
    const baseUrl = 'http://localhost:3000'; // Adjust port if needed

    console.log("--- Test 1: Vague Request (Orchestrator) ---");
    try {
        const res = await fetch(`${baseUrl}/api/agents/orchestrate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestText: "I need laptops" })
        });
        const data = await res.json();
        console.log("Orchestrator Response:", JSON.stringify(data.parsed, null, 2));

        if (data.parsed && data.parsed.needs_clarification) {
            console.log("✅ PASS: Orchestrator requested clarification.");
        } else {
            console.error("❌ FAIL: Orchestrator did NOT request clarification.");
        }
    } catch (e) { console.error("Error:", e); }

    console.log("\n--- Test 2: Vague Request (Launch) ---");
    try {
        const res = await fetch(`${baseUrl}/api/agents/launch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Mocking policies/vendors as empty lists for this test
            body: JSON.stringify({ requestText: "I need laptops", policies: [], vendors: [] })
        });
        const data = await res.json();
        console.log("Launch Response Status:", data.status);

        if (data.status === "clarification_needed") {
            console.log("✅ PASS: Launch API returned clarification_needed.");
            console.log("Question:", data.question);
        } else {
            console.error("❌ FAIL: Launch API did NOT return clarification_needed.");
        }
    } catch (e) { console.error("Error:", e); }

    console.log("\n--- Test 3: Specific Request (Launch) ---");
    try {
        const res = await fetch(`${baseUrl}/api/agents/launch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestText: "I need 50 laptops for $2000 each", policies: [], vendors: [] })
        });
        const data = await res.json();
        console.log("Launch Response Success:", data.success);

        if (data.success && !data.status) {
            console.log("✅ PASS: Launch API succeeded without clarification.");
        } else {
            console.log("⚠️ Note: Response might differ based on mock/real agent, but check if status is NOT clarification_needed.");
            console.log(data);
        }
    } catch (e) { console.error("Error:", e); }
}

testClarification();
