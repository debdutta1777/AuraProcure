import { ApprovalRequest, AgentLog, VendorQuote, Policy } from "./types";
import { generateId } from "../utils";

/**
 * Agent D: The Human-in-the-Loop (HITL) Bridge
 * Pauses workflow to request human approval before financial actions.
 */

export function createApprovalRequest(
    missionId: string,
    totalAmount: number,
    selectedQuote: VendorQuote | null,
    policies: Policy[]
): { approval: ApprovalRequest; logs: AgentLog[]; requiresApproval: boolean } {
    const logs: AgentLog[] = [];

    // Check if approval is needed based on policies
    const budgetPolicies = policies.filter(
        (p) => p.category === "budget" && p.is_active && p.threshold_amount
    );

    let requiresApproval = false;
    let reason = "";

    for (const policy of budgetPolicies) {
        if (policy.threshold_amount && totalAmount > policy.threshold_amount) {
            requiresApproval = true;
            reason = `Total amount $${totalAmount.toLocaleString()} exceeds $${policy.threshold_amount.toLocaleString()} threshold (${policy.name})`;
            break;
        }
    }

    // Also require approval for any purchase over $10K as a safety net
    if (!requiresApproval && totalAmount > 10000) {
        requiresApproval = true;
        reason = `Total amount $${totalAmount.toLocaleString()} exceeds $10,000 general approval threshold`;
    }

    if (requiresApproval) {
        logs.push({
            id: generateId(),
            mission_id: missionId,
            agent_name: "hitl_bridge",
            level: "info",
            message: `⏸ Workflow paused — human approval required`,
            payload: {
                reason,
                amount: totalAmount,
                vendor: selectedQuote?.vendor_name || "N/A",
            },
            created_at: new Date().toISOString(),
        });
    } else {
        logs.push({
            id: generateId(),
            mission_id: missionId,
            agent_name: "hitl_bridge",
            level: "info",
            message: `Auto-approved: Amount $${totalAmount.toLocaleString()} is within auto-approval limits`,
            payload: { amount: totalAmount, auto_approved: true },
            created_at: new Date().toISOString(),
        });
    }

    const description = selectedQuote
        ? `Approve purchase of ${selectedQuote.quantity}x ${selectedQuote.item_name} from ${selectedQuote.vendor_name} for $${totalAmount.toLocaleString()}`
        : `Approve procurement totaling $${totalAmount.toLocaleString()}`;

    const approval: ApprovalRequest = {
        id: generateId(),
        mission_id: missionId,
        description,
        total_amount: totalAmount,
        status: requiresApproval ? "pending" : "approved",
        approver: requiresApproval ? null : "system (auto-approved)",
        approved_at: requiresApproval ? null : new Date().toISOString(),
        created_at: new Date().toISOString(),
    };

    return { approval, logs, requiresApproval };
}

export function processApproval(
    approvalId: string,
    approved: boolean,
    approver: string,
    missionId: string
): { logs: AgentLog[] } {
    const logs: AgentLog[] = [];

    logs.push({
        id: generateId(),
        mission_id: missionId,
        agent_name: "hitl_bridge",
        level: "info",
        message: approved
            ? `✅ Approved by ${approver} — resuming workflow`
            : `❌ Rejected by ${approver} — workflow terminated`,
        payload: { approver, approved, approval_id: approvalId },
        created_at: new Date().toISOString(),
    });

    return { logs };
}
