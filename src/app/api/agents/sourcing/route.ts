import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/openai";

export async function POST(req: NextRequest) {
    try {
        const { items, vendors } = await req.json();

        const systemInstruction = `You are the Sourcing Scout agent for AuraProcure. Your job is to find and compare vendor quotes for procurement items.

Given items to procure and available vendors, generate realistic vendor quotes. For each item, provide 3-4 vendor quotes with realistic pricing, availability, and reasoning.

Return JSON:
{
  "quotes": [
    {
      "vendor_name": "vendor name",
      "item_name": "item name",
      "unit_price": number,
      "quantity": number,
      "total_price": number,
      "availability": "In Stock | Limited Stock | Pre-Order | Out of Stock",
      "shipping_days": number,
      "selected": boolean (true for recommended vendor),
      "reasoning": "Why this vendor was or wasn't selected"
    }
  ],
  "summary": "Brief summary of sourcing results and recommendation",
  "selfHealing": [
    {
      "vendor": "vendor name",
      "issue": "what went wrong",
      "resolution": "how it was resolved"
    }
  ]
}

Select the best vendor based on: price (40%), shipping speed (25%), availability (20%), vendor rating (15%). Include at least one self-healing example where a vendor had an issue.`;

        const result = await generateJSON(
            JSON.stringify({
                items,
                available_vendors: vendors || ["TechDirect Pro", "GlobalSource Inc", "Enterprise Solutions", "Amazon Business"],
            }),
            systemInstruction
        );

        if (!result) {
            // Fallback: generate simulated quotes
            const quotes = (items || []).flatMap((item: { name: string; quantity: number; estimated_unit_price?: number }, idx: number) => {
                const basePrice = item.estimated_unit_price || 500;
                return [
                    {
                        vendor_name: "TechDirect Pro",
                        item_name: item.name,
                        unit_price: Math.round(basePrice * 0.95),
                        quantity: item.quantity,
                        total_price: Math.round(basePrice * 0.95 * item.quantity),
                        availability: "In Stock",
                        shipping_days: 3,
                        selected: true,
                        reasoning: "Best overall value with fast shipping and preferred vendor status",
                    },
                    {
                        vendor_name: "GlobalSource Inc",
                        item_name: item.name,
                        unit_price: Math.round(basePrice * 0.88),
                        quantity: item.quantity,
                        total_price: Math.round(basePrice * 0.88 * item.quantity),
                        availability: "In Stock",
                        shipping_days: 7,
                        selected: false,
                        reasoning: "Lowest price but longer shipping time",
                    },
                    {
                        vendor_name: "Enterprise Solutions",
                        item_name: item.name,
                        unit_price: Math.round(basePrice * 1.05),
                        quantity: item.quantity,
                        total_price: Math.round(basePrice * 1.05 * item.quantity),
                        availability: "Limited Stock",
                        shipping_days: 2,
                        selected: false,
                        reasoning: "Premium option with fastest delivery and warranty",
                    },
                ];
            });

            return NextResponse.json({
                success: true,
                usedAI: false,
                quotes,
                summary: `Found ${quotes.length} quotes from 3 vendors. Best value: TechDirect Pro.`,
                selfHealing: [],
            });
        }

        return NextResponse.json({
            success: true,
            usedAI: true,
            ...(result as object),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Sourcing Scout error:", message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
