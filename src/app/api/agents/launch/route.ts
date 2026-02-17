import { NextRequest, NextResponse } from "next/server";
import { hasGeminiKey } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { requestText, policies, vendors } = await req.json();
        const origin = req.nextUrl.origin;
        const isAI = hasGeminiKey();

        const logs: { agent: string; action: string; status: string; result: unknown; timestamp: string; usedAI: boolean }[] = [];

        // ===== Step 1: Orchestrator =====
        const orchestratorRes = await fetch(`${origin}/api/agents/orchestrate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestText, policies }),
        });
        const orchestratorData = await orchestratorRes.json();

        if (!orchestratorData.success) {
            return NextResponse.json({
                success: false,
                error: "Orchestrator failed: " + orchestratorData.error,
            });
        }

        const parsed = orchestratorData.parsed;
        if (parsed?.needs_clarification) {
            return NextResponse.json({
                success: true,
                status: "clarification_needed",
                question: parsed.clarification_question,
                original_request: requestText,
                parsed_context: parsed
            });
        }

        logs.push({
            agent: "orchestrator",
            action: "Parsed procurement request into structured items",
            status: "completed",
            result: orchestratorData.parsed,
            timestamp: new Date().toISOString(),
            usedAI: orchestratorData.usedAI,
        });

        // ===== Step 2: Sourcing Scout =====
        const sourcingRes = await fetch(`${origin}/api/agents/sourcing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: orchestratorData.parsed.items,
                vendors,
            }),
        });
        const sourcingData = await sourcingRes.json();

        logs.push({
            agent: "sourcing_scout",
            action: sourcingData.summary || "Searched vendors for quotes",
            status: sourcingData.success ? "completed" : "failed",
            result: { quotes: sourcingData.quotes, selfHealing: sourcingData.selfHealing },
            timestamp: new Date().toISOString(),
            usedAI: sourcingData.usedAI,
        });

        // ===== Step 3: Compliance Officer =====
        const selectedQuotes = (sourcingData.quotes || []).filter((q: { selected: boolean }) => q.selected);
        const totalAmount = selectedQuotes.reduce(
            (sum: number, q: { total_price: number }) => sum + q.total_price, 0
        );

        const complianceRes = await fetch(`${origin}/api/agents/compliance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: orchestratorData.parsed.items,
                quotes: sourcingData.quotes,
                policies: policies || [],
                totalBudget: totalAmount,
            }),
        });
        const complianceData = await complianceRes.json();

        logs.push({
            agent: "compliance_officer",
            action: complianceData.summary || "Validated compliance policies",
            status: complianceData.success ? "completed" : "failed",
            result: complianceData.results,
            timestamp: new Date().toISOString(),
            usedAI: complianceData.usedAI,
        });

        // ===== Step 4: HITL Bridge =====
        const needsApproval = totalAmount > 5000 || !complianceData.allPassed;
        logs.push({
            agent: "hitl_bridge",
            action: needsApproval
                ? `Approval required — total amount $${totalAmount.toLocaleString()} exceeds auto-approval threshold`
                : `Auto-approved — total amount $${totalAmount.toLocaleString()} within auto-approval limit`,
            status: "completed",
            result: {
                needs_approval: needsApproval,
                total_amount: totalAmount,
                compliance_passed: complianceData.allPassed,
            },
            timestamp: new Date().toISOString(),
            usedAI: false,
        });

        // ===== Step 5: Document Drafter =====
        const documentRes = await fetch(`${origin}/api/agents/document`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                missionId: `m_${Date.now()}`,
                items: orchestratorData.parsed.items,
                selectedQuotes,
                type: "purchase_order",
            }),
        });
        const documentData = await documentRes.json();

        logs.push({
            agent: "document_drafter",
            action: `Generated ${documentData.document?.title || "Purchase Order"}`,
            status: documentData.success ? "completed" : "failed",
            result: documentData.document,
            timestamp: new Date().toISOString(),
            usedAI: documentData.usedAI,
        });

        // ===== Build final result =====
        const savings = Math.round(
            totalAmount * (0.08 + Math.random() * 0.15)
        );

        return NextResponse.json({
            success: true,
            usedAI: isAI,
            parsed: orchestratorData.parsed,
            quotes: sourcingData.quotes || [],
            compliance: complianceData.results || [],
            complianceAllPassed: complianceData.allPassed,
            needsApproval,
            document: documentData.document,
            selfHealing: sourcingData.selfHealing || [],
            totalAmount,
            savings,
            logs,
            summary: orchestratorData.parsed?.summary || requestText,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Mission launch error:", message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
