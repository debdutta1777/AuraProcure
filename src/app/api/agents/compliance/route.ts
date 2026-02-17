import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { items, quotes, policies, totalBudget } = await req.json();

        const systemInstruction = `You are the Compliance Officer agent for AuraProcure. Your job is to check procurement decisions against company policies.

Given items, selected vendor quotes, and company policies, validate each policy and provide detailed reasoning with citations.

Return JSON:
{
  "results": [
    {
      "policy_id": "policy id",
      "policy_name": "policy name",
      "passed": boolean,
      "reason": "Detailed explanation of why this policy passed or failed",
      "citation": "Exact citation from the policy text, e.g., 'Per Policy Budget Control, Section 2: All purchases over $10,000 require VP approval'"
    }
  ],
  "allPassed": boolean,
  "summary": "Overall compliance summary",
  "recommendations": ["Any recommendations for improving compliance"]
}

Be thorough and cite specific policy text. If a policy is inactive, mark it as passed with a note.`;

        const result = await generateJSON(
            JSON.stringify({ items, quotes, policies, totalBudget }),
            systemInstruction
        );

        if (!result) {
            // Fallback: simulated compliance check
            const results = (policies || []).map((policy: { id: string; name: string; rule_text: string; threshold_amount: number | null; is_active: boolean }) => {
                if (!policy.is_active) {
                    return {
                        policy_id: policy.id,
                        policy_name: policy.name,
                        passed: true,
                        reason: "Policy is currently inactive — skipped",
                        citation: null,
                    };
                }
                const totalAmount = (quotes || [])
                    .filter((q: { selected: boolean }) => q.selected)
                    .reduce((sum: number, q: { total_price: number }) => sum + q.total_price, 0);

                const passed = policy.threshold_amount ? totalAmount <= policy.threshold_amount : true;
                return {
                    policy_id: policy.id,
                    policy_name: policy.name,
                    passed,
                    reason: passed
                        ? `Total amount $${totalAmount.toLocaleString()} is within policy limits`
                        : `Total amount $${totalAmount.toLocaleString()} exceeds threshold of $${policy.threshold_amount?.toLocaleString()}`,
                    citation: `Policy "${policy.name}" — Rule: ${policy.rule_text}`,
                };
            });

            const allPassed = results.every((r: { passed: boolean }) => r.passed);
            return NextResponse.json({
                success: true,
                usedAI: false,
                results,
                allPassed,
                summary: allPassed
                    ? `All ${results.length} compliance policies passed.`
                    : `${results.filter((r: { passed: boolean }) => !r.passed).length} policy violation(s) detected.`,
            });
        }

        return NextResponse.json({
            success: true,
            usedAI: true,
            ...(result as object),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Compliance Officer error:", message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
