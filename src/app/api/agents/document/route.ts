import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { missionId, items, selectedQuotes, type } = await req.json();

        const docType = type || "purchase_order";
        const now = new Date();
        const poNumber = `PO-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${(missionId || "0000").slice(-4).toUpperCase()}`;

        const totalAmount = (selectedQuotes || []).reduce(
            (sum: number, q: { total_price: number }) => sum + q.total_price,
            0
        );

        const systemInstruction = `You are the Document Drafter agent for AuraProcure. Generate professional procurement documents.

Document type: ${docType}
PO Number: ${poNumber}
Date: ${now.toISOString().split("T")[0]}

Generate a professional, well-formatted ${docType === "purchase_order" ? "Purchase Order" : docType === "rfq" ? "Request for Quotation" : "Contract Summary"} document.

Include these sections:
- Header with document number, date, and type
- Buyer information (AuraProcure Corp)
- Vendor/Supplier information (from the selected quote)
- Line items table with: item name, quantity, unit price, total
- Terms and conditions
- Total amount
- Approval section

Use plain text formatting with clear section headers and unicode box-drawing characters. Make it look professional and complete.`;

        const docContent = await generateText(
            JSON.stringify({ items, selectedQuotes }),
            systemInstruction
        );

        if (!docContent) {
            // Fallback: template document
            const vendorName = selectedQuotes?.[0]?.vendor_name || "Selected Vendor";
            const content = generateTemplateDocument(docType, {
                poNumber,
                items: items || [],
                quotes: selectedQuotes || [],
                totalAmount,
                date: now.toISOString().split("T")[0],
                vendorName,
            });

            return NextResponse.json({
                success: true,
                usedAI: false,
                document: {
                    title: `${docType === "purchase_order" ? "Purchase Order" : docType === "rfq" ? "Request for Quotation" : "Contract Summary"} — ${poNumber}`,
                    type: docType,
                    content,
                    metadata: {
                        po_number: poNumber,
                        generated_at: now.toISOString(),
                        total_amount: totalAmount,
                        item_count: (items || []).length,
                    },
                },
            });
        }

        return NextResponse.json({
            success: true,
            usedAI: true,
            document: {
                title: `${docType === "purchase_order" ? "Purchase Order" : docType === "rfq" ? "Request for Quotation" : "Contract Summary"} — ${poNumber}`,
                type: docType,
                content: docContent,
                metadata: {
                    po_number: poNumber,
                    generated_at: now.toISOString(),
                    total_amount: totalAmount,
                    item_count: (items || []).length,
                    ai_generated: true,
                },
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Document Drafter error:", message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

function generateTemplateDocument(
    type: string,
    data: {
        poNumber: string;
        items: { name: string; quantity: number }[];
        quotes: { vendor_name: string; item_name: string; unit_price: number; quantity: number; total_price: number }[];
        totalAmount: number;
        date: string;
        vendorName: string;
    }
) {
    if (type === "purchase_order") {
        return `
═══════════════════════════════════════════════
                  PURCHASE ORDER
═══════════════════════════════════════════════

PO Number:  ${data.poNumber}
Date:       ${data.date}
Status:     PENDING APPROVAL

───────────────────────────────────────────────
BUYER
───────────────────────────────────────────────
Company:    AuraProcure Corp
Address:    123 Procurement Ave, Suite 500
            San Francisco, CA 94102
Contact:    Procurement Manager
Email:      procurement@auraprocure.ai

───────────────────────────────────────────────
VENDOR
───────────────────────────────────────────────
Company:    ${data.vendorName}
Terms:      Net 30
Shipping:   Standard Ground

───────────────────────────────────────────────
LINE ITEMS
───────────────────────────────────────────────
${data.quotes
                .map(
                    (q, i) =>
                        `${i + 1}. ${q.item_name}
   Qty: ${q.quantity}  |  Unit: $${q.unit_price.toLocaleString()}  |  Total: $${q.total_price.toLocaleString()}`
                )
                .join("\n\n")}

───────────────────────────────────────────────
                                SUBTOTAL:  $${data.totalAmount.toLocaleString()}
                                TAX (0%):  $0
                                ─────────
                                TOTAL:     $${data.totalAmount.toLocaleString()}
───────────────────────────────────────────────

TERMS & CONDITIONS
1. Delivery within agreed shipping timeframe
2. Payment terms: Net 30 from invoice date
3. Quality must meet stated specifications
4. Returns accepted within 30 days if defective

───────────────────────────────────────────────
AUTHORIZATION
───────────────────────────────────────────────
Requested By:   AI Agent (AuraProcure)
Approved By:    _________________________
Date:           _________________________
Signature:      _________________________

═══════════════════════════════════════════════
    Generated by AuraProcure AI • ${data.date}
═══════════════════════════════════════════════`.trim();
    }

    return `
═══════════════════════════════════════════════
            REQUEST FOR QUOTATION (RFQ)
═══════════════════════════════════════════════

RFQ Number: ${data.poNumber.replace("PO", "RFQ")}
Date:       ${data.date}
Due Date:   ${new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]}

───────────────────────────────────────────────
FROM: AuraProcure Corp
TO:   [Prospective Vendors]
───────────────────────────────────────────────

Dear Vendor,

We are requesting quotations for the following items:

${data.items
            .map(
                (item, i) =>
                    `${i + 1}. ${item.name}
   Quantity Required: ${item.quantity}
   Specifications: Standard business grade`
            )
            .join("\n\n")}

REQUIREMENTS:
• Please provide unit pricing and volume discounts
• Include shipping costs and estimated delivery time
• Specify warranty terms
• Quote valid for minimum 30 days

Submit responses to: procurement@auraprocure.ai

═══════════════════════════════════════════════
    Generated by AuraProcure AI • ${data.date}
═══════════════════════════════════════════════`.trim();
}
