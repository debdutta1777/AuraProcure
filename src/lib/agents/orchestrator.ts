import { MissionStep, AgentLog, ParsedItem, AgentName, Mission } from "./types";
import { generateId } from "../utils";

/**
 * Lead Orchestrator Agent (The Brain)
 * Interprets natural language requests, decomposes into tasks,
 * and dispatches to sub-agents in sequence.
 */

export function parseRequest(requestText: string): {
    items: ParsedItem[];
    budget: number | null;
    deadline: string | null;
} {
    const text = requestText.toLowerCase();

    // Extract quantity
    const qtyMatch = text.match(/(\d+)\s*(high-end|enterprise|ergonomic|premium|standard)?\s*(laptop|chair|firewall|monitor|desk|phone|tablet|server|printer|coffee|keyboard|mouse|headset|webcam|license|subscription)/i);
    const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
    const adjective = qtyMatch ? qtyMatch[2] || "" : "";
    const itemType = qtyMatch ? qtyMatch[3] : "item";

    // Extract budget
    const budgetMatch = text.match(/\$\s*([\d,]+(?:\.\d{2})?)\s*(?:k|K)?\s*(?:budget|cap|limit|maximum)?/);
    let budget: number | null = null;
    if (budgetMatch) {
        budget = parseFloat(budgetMatch[1].replace(/,/g, ""));
        if (text.includes("k") || text.includes("K")) budget *= 1000;
    }

    // Extract deadline
    let deadline: string | null = null;
    if (text.includes("friday")) {
        const d = new Date();
        d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
        d.setHours(17, 0, 0, 0);
        deadline = d.toISOString();
    } else if (text.includes("next week")) {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        deadline = d.toISOString();
    } else if (text.match(/(\d+)\s*(?:week|day)/)) {
        const match = text.match(/(\d+)\s*(week|day)/);
        if (match) {
            const d = new Date();
            const n = parseInt(match[1]);
            d.setDate(d.getDate() + (match[2] === "week" ? n * 7 : n));
            deadline = d.toISOString();
        }
    }

    // Determine category and specs
    const categoryMap: Record<string, string> = {
        laptop: "IT Hardware",
        monitor: "IT Hardware",
        server: "IT Hardware",
        keyboard: "IT Peripherals",
        mouse: "IT Peripherals",
        headset: "IT Peripherals",
        webcam: "IT Peripherals",
        chair: "Office Furniture",
        desk: "Office Furniture",
        phone: "Communications",
        tablet: "IT Hardware",
        printer: "Office Equipment",
        firewall: "Networking",
        coffee: "Office Supplies",
        license: "Software",
        subscription: "Software",
    };

    const specMap: Record<string, string> = {
        laptop: "16GB+ RAM, 512GB SSD, i7/Ryzen 7+",
        monitor: '27" 4K IPS, USB-C, adjustable stand',
        server: "Rack-mounted, Xeon, 64GB ECC RAM",
        chair: "Adjustable lumbar, mesh back, armrests",
        desk: "Height-adjustable standing desk",
        firewall: "Next-gen, IPS/IDS, 10Gbps throughput",
        printer: "Color laser, duplex, network-ready",
    };

    const priceMap: Record<string, number> = {
        laptop: 1500,
        monitor: 600,
        server: 5000,
        chair: 350,
        desk: 800,
        firewall: 4500,
        printer: 1200,
        keyboard: 80,
        mouse: 50,
        headset: 150,
        webcam: 120,
        phone: 400,
        tablet: 900,
        coffee: 25,
        license: 200,
        subscription: 100,
    };

    const category = categoryMap[itemType] || "General";
    const specs = specMap[itemType] || undefined;
    const estimatedPrice = priceMap[itemType] || 100;

    const item: ParsedItem = {
        name: `${adjective ? adjective.charAt(0).toUpperCase() + adjective.slice(1) + " " : ""}${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
        quantity,
        category,
        specifications: specs,
        estimated_unit_price: estimatedPrice,
    };

    return { items: [item], budget, deadline };
}

export function createOrchestratorSteps(missionId: string): MissionStep[] {
    const agentSequence: { agent: AgentName; action: string }[] = [
        { agent: "orchestrator", action: "Parse and decompose procurement request" },
        { agent: "sourcing_scout", action: "Search vendors and collect quotes" },
        { agent: "compliance_officer", action: "Verify compliance against policies" },
        { agent: "hitl_bridge", action: "Request human approval" },
        { agent: "document_drafter", action: "Generate procurement documents" },
    ];

    return agentSequence.map((s, i) => ({
        id: generateId(),
        mission_id: missionId,
        agent_name: s.agent,
        step_order: i + 1,
        action: s.action,
        reasoning: null,
        result: null,
        status: i === 0 ? "running" : "pending",
        started_at: i === 0 ? new Date().toISOString() : null,
        completed_at: null,
        metadata: {},
    }));
}

export function createInitialLogs(missionId: string, requestText: string): AgentLog[] {
    return [
        {
            id: generateId(),
            mission_id: missionId,
            agent_name: "orchestrator",
            level: "info",
            message: `Mission initiated: Processing natural language request`,
            payload: { request_text: requestText },
            created_at: new Date().toISOString(),
        },
    ];
}
