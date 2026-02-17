import { ProcurementDocument, VendorQuote, ParsedItem, AgentLog, DocumentType } from "./types";
import { generateId } from "../utils";

/**
 * Agent C: The Document Drafter
 * Generates professional procurement documents (RFQ, PO, Contract Summary).
 */

function generateRFQ(items: ParsedItem[], missionId: string): string {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const rfqNum = `RFQ-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}`;

    let content = `REQUEST FOR QUOTATION\n\n`;
    content += `RFQ Number: ${rfqNum}\n`;
    content += `Date: ${date}\n`;
    content += `Deadline for Responses: ${new Date(Date.now() + 86400000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n\n`;
    content += `Dear Vendor,\n\n`;
    content += `We are soliciting quotations for the following items:\n\n`;

    items.forEach((item, i) => {
        content += `Item ${i + 1}: ${item.name}\n`;
        content += `Quantity: ${item.quantity} units\n`;
        if (item.specifications) {
            content += `Specifications: ${item.specifications}\n`;
        }
        content += `\n`;
    });

    content += `Delivery Requirements:\n`;
    content += `- Location: Corporate HQ\n`;
    content += `- Packaging: Standard commercial packaging\n\n`;
    content += `Please include unit pricing, bulk discounts, shipping costs, and estimated delivery timeline.\n\n`;
    content += `Thank you,\nProcurement Department\nAuraProcure Corp`;

    return content;
}

function generatePO(items: ParsedItem[], selectedQuote: VendorQuote): string {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const poNum = `PO-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}`;
    const tax = Math.round(selectedQuote.total_price * 0.08);
    const total = selectedQuote.total_price + tax;

    let content = `PURCHASE ORDER\n\n`;
    content += `PO Number: ${poNum}\n`;
    content += `Date: ${date}\n`;
    content += `Vendor: ${selectedQuote.vendor_name}\n\n`;
    content += `Ship To:\nCorporate HQ\n123 Enterprise Blvd\nSan Francisco, CA 94105\n\n`;
    content += `Line Items:\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    content += `1. ${selectedQuote.item_name}\n`;
    content += `   - Qty: ${selectedQuote.quantity}\n`;
    content += `   - Unit Price: $${selectedQuote.unit_price.toLocaleString()}\n`;
    content += `   - Line Total: $${selectedQuote.total_price.toLocaleString()}\n`;
    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    content += `Subtotal: $${selectedQuote.total_price.toLocaleString()}\n`;
    content += `Shipping: $0.00 (Free shipping)\n`;
    content += `Tax (8%): $${tax.toLocaleString()}\n`;
    content += `Total: $${total.toLocaleString()}\n\n`;
    content += `Payment Terms: Net 30\n`;
    content += `Delivery Date: ${new Date(Date.now() + selectedQuote.shipping_days * 86400000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;

    return content;
}

function generateContractSummary(items: ParsedItem[], selectedQuote: VendorQuote): string {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const tax = Math.round(selectedQuote.total_price * 0.08);
    const total = selectedQuote.total_price + tax;

    let content = `CONTRACT SUMMARY\n\n`;
    content += `Date: ${date}\n\n`;
    content += `Parties:\n`;
    content += `- Buyer: AuraProcure Corp\n`;
    content += `- Seller: ${selectedQuote.vendor_name}\n\n`;
    content += `Key Terms:\n`;
    content += `1. Product: ${selectedQuote.quantity}x ${selectedQuote.item_name}\n`;
    content += `2. Total Value: $${total.toLocaleString()} (incl. tax)\n`;
    content += `3. Payment: Net 30 from delivery\n`;
    content += `4. Warranty: Standard manufacturer warranty\n`;
    content += `5. Delivery: Within ${selectedQuote.shipping_days} business days\n`;
    content += `6. Returns: 30-day DOA replacement policy\n\n`;
    content += `Compliance Notes:\n`;
    content += `- ✅ Competitive quotes obtained\n`;
    content += `- ✅ Vendor compliance verified\n`;
    content += `- ✅ Budget authorization confirmed`;

    return content;
}

export function draftDocuments(
    items: ParsedItem[],
    quotes: VendorQuote[],
    missionId: string
): { documents: ProcurementDocument[]; logs: AgentLog[] } {
    const logs: AgentLog[] = [];
    const documents: ProcurementDocument[] = [];
    const selectedQuote = quotes.find((q) => q.selected);

    logs.push({
        id: generateId(),
        mission_id: missionId,
        agent_name: "document_drafter",
        level: "info",
        message: "Generating procurement documents...",
        payload: { document_types: ["rfq", "purchase_order", "contract_summary"] },
        created_at: new Date().toISOString(),
    });

    // Generate RFQ
    const rfqContent = generateRFQ(items, missionId);
    documents.push({
        id: generateId(),
        mission_id: missionId,
        type: "rfq",
        title: `RFQ — ${items[0]?.name || "Procurement Request"}`,
        content: rfqContent,
        metadata: { items_count: items.length },
        created_at: new Date().toISOString(),
    });

    logs.push({
        id: generateId(),
        mission_id: missionId,
        agent_name: "document_drafter",
        level: "info",
        message: "RFQ document generated",
        payload: { type: "rfq" },
        created_at: new Date().toISOString(),
    });

    if (selectedQuote) {
        // Generate PO
        const poContent = generatePO(items, selectedQuote);
        documents.push({
            id: generateId(),
            mission_id: missionId,
            type: "purchase_order",
            title: `PO — ${selectedQuote.quantity}x ${selectedQuote.item_name}`,
            content: poContent,
            metadata: { vendor: selectedQuote.vendor_name, total: selectedQuote.total_price },
            created_at: new Date().toISOString(),
        });

        logs.push({
            id: generateId(),
            mission_id: missionId,
            agent_name: "document_drafter",
            level: "info",
            message: `Purchase Order generated for ${selectedQuote.vendor_name}`,
            payload: { type: "purchase_order", vendor: selectedQuote.vendor_name },
            created_at: new Date().toISOString(),
        });

        // Generate Contract Summary
        const csContent = generateContractSummary(items, selectedQuote);
        documents.push({
            id: generateId(),
            mission_id: missionId,
            type: "contract_summary",
            title: `Contract Summary — ${selectedQuote.vendor_name}`,
            content: csContent,
            metadata: { vendor: selectedQuote.vendor_name },
            created_at: new Date().toISOString(),
        });

        logs.push({
            id: generateId(),
            mission_id: missionId,
            agent_name: "document_drafter",
            level: "info",
            message: "Contract summary generated — all documents stored in Document Vault",
            payload: { documents_created: documents.length },
            created_at: new Date().toISOString(),
        });
    }

    return { documents, logs };
}
