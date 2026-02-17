import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { requestText } = await req.json();

        const systemInstruction = `You are the Lead Orchestrator of a procurement AI system called AuraProcure. Your job is to parse natural language procurement requests into structured data.

Return a JSON object with this exact structure:
{
  "items": [
    {
      "name": "item name",
      "quantity": number,
      "category": "IT Hardware | Office Supplies | Software | Services | Furniture | Other",
      "specifications": "detailed specs",
      "estimated_unit_price": number
    }
  ],
  "urgency": "low | normal | high | critical",
  "budget_estimate": number (total estimated budget),
  "deadline": "ISO date string or null",
  "summary": "One-line plain-English summary of the procurement need",
  "needs_clarification": boolean,
  "clarification_question": "string or null"
}

Parse quantities, item types, deadlines, and any specifications from the user's request. 
CRITICAL: If the user has NOT provided a budget (e.g. "I need laptops" without price), OR if the specifications are too vague to estimate price (e.g. "I need 50 servers"), YOU MUST SET "needs_clarification": true and ask a specific question in "clarification_question".
Example: "What is your estimated budget per unit or total budget for the 50 laptops?"
If details are sufficient or you can make a reasonable standard estimate (e.g. coffee, pens), set "needs_clarification": false.`;

        const parsed = await generateJSON(requestText, systemInstruction);

        if (!parsed) {
            // Fallback: simulated parsing
            return NextResponse.json({
                success: true,
                usedAI: false,
                parsed: {
                    items: [
                        {
                            name: requestText.slice(0, 60),
                            quantity: 1,
                            category: "General Procurement",
                            specifications: "Standard specifications",
                            estimated_unit_price: 500,
                        },
                    ],
                    urgency: "normal",
                    budget_estimate: 5000,
                    deadline: null,
                    summary: `Procurement request: ${requestText}`,
                    needs_clarification: false,
                    clarification_question: null,
                },
            });
        }

        const parsedData = parsed as { items?: unknown[]; budget_estimate?: number };
        return NextResponse.json({
            success: true,
            usedAI: true,
            parsed,
            reasoning: `Gemini analyzed the request and identified ${parsedData.items?.length || 0} item(s) with a total estimated budget of $${parsedData.budget_estimate || "N/A"}.`,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Orchestrator error:", message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
