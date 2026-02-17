import { NextRequest, NextResponse } from "next/server";
import { generateText, getGemini } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { message, history, policies, vendors } = await req.json();

        const systemInstruction = `You are AuraProcure's AI procurement assistant. You help users with all procurement needs through a team of specialized agents:

- **Orchestrator**: Parses requests and coordinates agents
- **Sourcing Scout**: Finds vendor quotes and compares pricing
- **Compliance Officer**: Validates against company policies
- **Document Drafter**: Generates POs, RFQs, and contracts
- **HITL Bridge**: Manages human approval workflows

You have access to:
- Active policies: ${JSON.stringify(policies || [])}
- Known vendors: ${JSON.stringify(vendors || [])}

Respond conversationally but be helpful and specific. If the user asks about procurement, provide realistic helpful answers. Format responses with markdown bold (**text**) for emphasis. Keep responses concise (2-4 paragraphs max).

When analyzing a procurement request, break it down:
1. What items are needed
2. Estimated pricing ranges
3. Which policies might apply
4. Recommended vendors
5. Next steps

Always be professional, helpful, and proactive with suggestions.`;

        const gemini = getGemini();
        if (!gemini) {
            // Fallback: intelligent template responses
            const lowerMsg = message.toLowerCase();
            let response = "";

            if (lowerMsg.includes("laptop") || lowerMsg.includes("computer")) {
                response = `Great request! Here's my analysis:\n\n**Items Identified**: Laptops/Computers\n**Estimated Range**: $800-$2,000 per unit depending on specs\n**Recommended Vendors**: TechDirect Pro (best bulk pricing), Enterprise Solutions (premium warranty)\n\nI'd suggest launching a **full procurement mission** from the Command Center for real-time vendor quotes and compliance checks. Would you like me to help refine the specifications?`;
            } else if (lowerMsg.includes("compliance") || lowerMsg.includes("policy")) {
                response = `I can help with compliance! You currently have **${(policies || []).length} active policies**.\n\nTo check compliance for a specific purchase, provide the item details and budget, and I'll run them against all active policies with detailed citations.\n\nYou can also manage your policies directly in the **Compliance Manager** page.`;
            } else if (lowerMsg.includes("vendor") || lowerMsg.includes("supplier")) {
                response = `Here are your registered vendors: ${(vendors || []).join(", ")}.\n\n**Vendor Selection Tips**:\n- Check the **Analytics** page for vendor performance ratings\n- Use the **Sourcing Scout** to compare real-time quotes\n- Review delivery reliability in the vendor ratings table\n\nWant me to search for quotes from specific vendors?`;
            } else if (lowerMsg.includes("document") || lowerMsg.includes("po") || lowerMsg.includes("rfq")) {
                response = `I can help generate procurement documents!\n\n**Available Document Types**:\n- **Purchase Orders** — formal buy commitments\n- **RFQs** — request quotes from vendors\n- **Contract Summaries** — outline terms and conditions\n\nLaunch a mission from the Command Center and I'll auto-generate the appropriate documents. You can also view all generated documents in the **Document Vault**.`;
            } else {
                response = `I'd be happy to help with that procurement request!\n\nHere's what I recommend:\n1. **Launch a mission** from the Command Center with your request\n2. The **Sourcing Scout** will find competitive vendor quotes\n3. **Compliance Officer** validates against your ${(policies || []).length} active policies\n4. Documents are auto-generated and available in the **Document Vault**\n\nWould you like me to help refine your requirements, or should I explain any specific feature?`;
            }

            return NextResponse.json({
                success: true,
                response,
                agent: "orchestrator",
                usedAI: false,
            });
        }

        // Build conversation history for Gemini
        const model = gemini.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction,
        });

        const chat = model.startChat({
            history: (history || []).map((h: { role: string; content: string }) => ({
                role: h.role === "user" ? "user" : "model",
                parts: [{ text: h.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        // Determine which agent is most relevant
        const lowerMsg = message.toLowerCase();
        let agent = "orchestrator";
        if (lowerMsg.includes("vendor") || lowerMsg.includes("quote") || lowerMsg.includes("price")) {
            agent = "sourcing_scout";
        } else if (lowerMsg.includes("compliance") || lowerMsg.includes("policy")) {
            agent = "compliance_officer";
        } else if (lowerMsg.includes("document") || lowerMsg.includes("po") || lowerMsg.includes("rfq")) {
            agent = "document_drafter";
        } else if (lowerMsg.includes("approv")) {
            agent = "hitl_bridge";
        }

        return NextResponse.json({
            success: true,
            response,
            agent,
            usedAI: true,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Chat error:", message);
        return NextResponse.json({
            success: false,
            response: `I encountered an error: ${message}. Please try again.`,
            agent: "orchestrator",
        });
    }
}
