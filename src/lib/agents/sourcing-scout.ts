import { VendorQuote, Vendor, ParsedItem, AgentLog, AgentResult } from "./types";
import { generateId } from "../utils";

/**
 * Agent A: The Sourcing Scout
 * Searches vendors for the best prices and availability.
 * Implements self-healing: if a vendor source fails, logs the error and tries alternatives.
 */

interface VendorCatalogEntry {
    product_name: string;
    unit_price: number;
    availability: string;
    shipping_days: number;
}

// Simulate vendor catalogs
function getVendorCatalog(vendor: Vendor, item: ParsedItem): VendorCatalogEntry | null {
    const basePrice = item.estimated_unit_price || 1000;

    const catalogs: Record<string, () => VendorCatalogEntry | null> = {
        "TechDirect Pro": () => ({
            product_name: `${item.name} — Premium Grade`,
            unit_price: Math.round(basePrice * 0.88),
            availability: "In Stock",
            shipping_days: 5,
        }),
        "GlobalSupply Co": () => ({
            product_name: `${item.name} — Standard`,
            unit_price: Math.round(basePrice * 0.94),
            availability: "In Stock",
            shipping_days: 7,
        }),
        "PrimeOffice Solutions": () => ({
            product_name: `${item.name} — Business Line`,
            unit_price: Math.round(basePrice * 0.91),
            availability: "In Stock",
            shipping_days: 4,
        }),
        "CloudWare Systems": () => ({
            product_name: `${item.name} — Enterprise`,
            unit_price: Math.round(basePrice * 0.98),
            availability: "In Stock",
            shipping_days: 3,
        }),
        "SecureNet Distributors": () => ({
            product_name: `${item.name} — Certified`,
            unit_price: Math.round(basePrice * 0.95),
            availability: "In Stock",
            shipping_days: 6,
        }),
        "BudgetTech Outlet": () => ({
            product_name: `${item.name} — Value`,
            unit_price: Math.round(basePrice * 0.82),
            availability: "Limited Stock",
            shipping_days: 21,
        }),
    };

    const getEntry = catalogs[vendor.name];
    if (!getEntry) return null;

    // Simulate self-healing: random failure chance for non-whitelisted vendors
    if (!vendor.is_whitelisted && Math.random() < 0.15) {
        return null; // Simulate vendor API failure
    }

    return getEntry();
}

export function searchVendors(
    vendors: Vendor[],
    items: ParsedItem[],
    missionId: string
): { quotes: VendorQuote[]; logs: AgentLog[]; selectedVendorId: string } {
    const logs: AgentLog[] = [];
    const allQuotes: VendorQuote[] = [];

    const item = items[0]; // Primary item

    logs.push({
        id: generateId(),
        mission_id: missionId,
        agent_name: "sourcing_scout",
        level: "info",
        message: `Initiating vendor search for: ${item.name} (qty: ${item.quantity})`,
        payload: { category: item.category, vendors_available: vendors.length },
        created_at: new Date().toISOString(),
    });

    for (const vendor of vendors) {
        const entry = getVendorCatalog(vendor, item);

        if (!entry) {
            // Self-healing: log failure and continue
            logs.push({
                id: generateId(),
                mission_id: missionId,
                agent_name: "sourcing_scout",
                level: "warn",
                message: `⚠️ Self-healing: ${vendor.name} API unavailable — skipping to alternative source`,
                payload: { vendor: vendor.name, error: "CONNECTION_TIMEOUT" },
                created_at: new Date().toISOString(),
            });
            continue;
        }

        const totalPrice = entry.unit_price * item.quantity;

        allQuotes.push({
            id: generateId(),
            mission_id: missionId,
            vendor_id: vendor.id,
            vendor_name: vendor.name,
            item_name: entry.product_name,
            unit_price: entry.unit_price,
            quantity: item.quantity,
            total_price: totalPrice,
            availability: entry.availability,
            shipping_days: entry.shipping_days,
            selected: false,
            reasoning: null,
        });

        logs.push({
            id: generateId(),
            mission_id: missionId,
            agent_name: "sourcing_scout",
            level: "debug",
            message: `GET ${vendor.website}/api/products?q=${encodeURIComponent(item.name)} — 200 OK`,
            payload: { vendor: vendor.name, unit_price: entry.unit_price, shipping_days: entry.shipping_days },
            created_at: new Date().toISOString(),
        });
    }

    // Score and rank quotes
    const scoredQuotes = allQuotes.map((q) => {
        const vendor = vendors.find((v) => v.id === q.vendor_id);
        const priceScore = 40 * (1 - (q.unit_price / (item.estimated_unit_price || 1000)));
        const shippingScore = q.shipping_days <= 7 ? 25 : q.shipping_days <= 14 ? 15 : 5;
        const ratingScore = (vendor?.rating || 3) * 5;
        const whitelistBonus = vendor?.is_whitelisted ? 10 : 0;
        const score = Math.round(priceScore + shippingScore + ratingScore + whitelistBonus);
        return { ...q, score };
    });

    scoredQuotes.sort((a, b) => b.score - a.score);

    // Select the best
    if (scoredQuotes.length > 0) {
        const best = scoredQuotes[0];
        best.selected = true;
        best.reasoning = `Best score: ${best.score}/100 — competitive pricing at $${best.unit_price}/unit, ${best.shipping_days}-day shipping, vendor rating ${vendors.find((v) => v.id === best.vendor_id)?.rating}★`;

        // Add reasoning to other quotes
        scoredQuotes.slice(1).forEach((q) => {
            const reasons: string[] = [];
            if (q.unit_price > best.unit_price) reasons.push(`$${q.unit_price - best.unit_price} more expensive per unit`);
            if (q.shipping_days > best.shipping_days) reasons.push(`${q.shipping_days - best.shipping_days} days slower shipping`);
            if (!vendors.find((v) => v.id === q.vendor_id)?.is_whitelisted) reasons.push("Not on approved vendor list");
            q.reasoning = reasons.length > 0 ? reasons.join(". ") : `Score: ${q.score}/100`;
        });

        logs.push({
            id: generateId(),
            mission_id: missionId,
            agent_name: "sourcing_scout",
            level: "info",
            message: `Vendor comparison complete. Recommending ${best.vendor_name} (score: ${best.score}/100)`,
            payload: {
                scores: Object.fromEntries(scoredQuotes.map((q) => [q.vendor_name, q.score])),
                selected: best.vendor_name,
                total_quotes: scoredQuotes.length,
            },
            created_at: new Date().toISOString(),
        });
    }

    return {
        quotes: scoredQuotes,
        logs,
        selectedVendorId: scoredQuotes.length > 0 ? scoredQuotes[0].vendor_id : "",
    };
}
