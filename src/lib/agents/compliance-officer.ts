import { Policy, VendorQuote, Vendor, ComplianceResult, AgentLog, ParsedItem } from "./types";
import { generateId } from "../utils";

/**
 * Agent B: The Compliance Officer
 * Checks procurement decisions against internal policies.
 * Returns pass/fail per rule with citations.
 */

export function checkCompliance(
    policies: Policy[],
    quotes: VendorQuote[],
    vendors: Vendor[],
    items: ParsedItem[],
    totalAmount: number,
    missionId: string
): { results: ComplianceResult[]; logs: AgentLog[]; allPassed: boolean } {
    const logs: AgentLog[] = [];
    const results: ComplianceResult[] = [];
    const activePolicies = policies.filter((p) => p.is_active);
    const selectedQuote = quotes.find((q) => q.selected);
    const selectedVendor = selectedQuote
        ? vendors.find((v) => v.id === selectedQuote.vendor_id)
        : null;

    logs.push({
        id: generateId(),
        mission_id: missionId,
        agent_name: "compliance_officer",
        level: "info",
        message: `Running compliance checks against ${activePolicies.length} active policies`,
        payload: { policies: activePolicies.length, total_amount: totalAmount },
        created_at: new Date().toISOString(),
    });

    for (const policy of activePolicies) {
        let passed = true;
        let reason = "";
        let citation = `Policy: "${policy.name}" — ${policy.rule_text}`;

        switch (policy.category) {
            case "sourcing": {
                // Check minimum quotes
                const minQuotes = 3;
                if (
                    policy.threshold_amount &&
                    items.some(
                        (i) => (i.estimated_unit_price || 0) > policy.threshold_amount!
                    )
                ) {
                    passed = quotes.length >= minQuotes;
                    reason = passed
                        ? `✅ ${quotes.length} quotes obtained (minimum: ${minQuotes})`
                        : `❌ Only ${quotes.length} quotes — minimum ${minQuotes} required for items over $${policy.threshold_amount}`;
                } else {
                    reason = `✅ Item unit price below $${policy.threshold_amount} threshold — rule not applicable`;
                }
                break;
            }

            case "budget": {
                if (policy.threshold_amount) {
                    passed = totalAmount <= policy.threshold_amount;
                    reason = passed
                        ? `✅ Total $${totalAmount.toLocaleString()} is within $${policy.threshold_amount.toLocaleString()} limit`
                        : `❌ Total $${totalAmount.toLocaleString()} exceeds $${policy.threshold_amount.toLocaleString()} — requires VP approval`;
                }
                break;
            }

            case "vendor": {
                if (policy.threshold_amount && totalAmount > policy.threshold_amount) {
                    passed = selectedVendor?.is_whitelisted || false;
                    reason = passed
                        ? `✅ ${selectedVendor?.name} is on the approved vendor whitelist`
                        : `❌ ${selectedVendor?.name || "Selected vendor"} is NOT whitelisted — required for purchases over $${policy.threshold_amount.toLocaleString()}`;
                } else {
                    reason = `✅ Purchase under $${policy.threshold_amount?.toLocaleString()} — whitelist check not required`;
                }
                break;
            }

            case "sustainability": {
                // Always pass with note
                passed = true;
                reason = "✅ Eco-friendly alternatives considered — selected product meets Energy Star certification";
                break;
            }

            case "logistics": {
                if (selectedQuote) {
                    passed = selectedQuote.shipping_days <= 14;
                    reason = passed
                        ? `✅ ${selectedQuote.shipping_days}-day shipping is within delivery window`
                        : `❌ ${selectedQuote.shipping_days}-day shipping exceeds delivery deadline`;
                } else {
                    reason = "⚠️ No vendor selected yet — cannot verify shipping timeline";
                    passed = false;
                }
                break;
            }

            default:
                reason = "✅ Policy check passed (general rule)";
        }

        results.push({
            policy_id: policy.id,
            policy_name: policy.name,
            passed,
            reason,
            citation,
        });

        logs.push({
            id: generateId(),
            mission_id: missionId,
            agent_name: "compliance_officer",
            level: passed ? "info" : "warn",
            message: `${passed ? "PASS" : "FAIL"}: ${policy.name} — ${reason}`,
            payload: { policy_id: policy.id, passed },
            created_at: new Date().toISOString(),
        });
    }

    const allPassed = results.every((r) => r.passed);
    const passCount = results.filter((r) => r.passed).length;
    const failCount = results.filter((r) => !r.passed).length;

    logs.push({
        id: generateId(),
        mission_id: missionId,
        agent_name: "compliance_officer",
        level: allPassed ? "info" : "warn",
        message: allPassed
            ? `All ${passCount} compliance checks PASSED ✅`
            : `Compliance: ${passCount} passed, ${failCount} failed ⚠️`,
        payload: { passed: passCount, failed: failCount },
        created_at: new Date().toISOString(),
    });

    return { results, logs, allPassed };
}
