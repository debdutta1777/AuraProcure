"use client";

import { create } from "zustand";
import {
    Mission,
    MissionStatus,
    MissionStep,
    AgentName,
    Vendor,
    VendorQuote,
    Policy,
    ProcurementDocument,
    ApprovalRequest,
    AgentLog,
    InventoryItem,
    AppNotification,
    StockStatus,
} from "./agents/types";
import {
    SEED_MISSIONS,
    SEED_STEPS,
    SEED_VENDORS,
    SEED_QUOTES,
    SEED_POLICIES,
    SEED_DOCUMENTS,
    SEED_APPROVALS,
    SEED_LOGS,
} from "./seed-data";
import { SEED_INVENTORY } from "./seed-inventory";

export interface AgentActivityItem {
    agent: AgentName;
    message: string;
    timestamp: string;
}

interface AppState {
    // Data
    missions: Mission[];
    steps: MissionStep[];
    vendors: Vendor[];
    quotes: VendorQuote[];
    policies: Policy[];
    documents: ProcurementDocument[];
    approvals: ApprovalRequest[];
    logs: AgentLog[];
    agentActivity: AgentActivityItem[];
    inventory: InventoryItem[];
    notifications: AppNotification[];
    isDemoMode: boolean;

    // UI State
    selectedMissionId: string | null;
    isCreatingMission: boolean;

    // Actions
    setSelectedMission: (id: string | null) => void;
    setIsCreatingMission: (v: boolean) => void;
    addMission: (mission: Mission) => void;
    updateMission: (id: string, updates: Partial<Mission>) => void;
    addStep: (step: MissionStep) => void;
    updateStep: (id: string, updates: Partial<MissionStep>) => void;
    addVendor: (vendor: Vendor) => void;
    removeVendor: (id: string) => void;
    updateVendor: (id: string, updates: Partial<Vendor>) => void;
    addPolicy: (policy: Policy) => void;
    removePolicy: (id: string) => void;
    updatePolicy: (id: string, updates: Partial<Policy>) => void;
    addDocument: (doc: ProcurementDocument) => void;
    addQuotes: (quotes: VendorQuote[]) => void;
    addLog: (log: AgentLog) => void;
    addApproval: (approval: ApprovalRequest) => void;
    updateApproval: (id: string, updates: Partial<ApprovalRequest>) => void;
    launchMission: (requestText: string) => Promise<any>;
    addAgentActivity: (item: AgentActivityItem) => void;
    // Inventory
    updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
    drainStock: (id: string, amount: number) => void;
    restockItem: (id: string, amount: number) => void;
    startDemoMode: () => void;
    stopDemoMode: () => void;
    // Notifications
    addNotification: (notification: AppNotification) => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initialize with seed data
    missions: SEED_MISSIONS,
    steps: SEED_STEPS,
    vendors: SEED_VENDORS,
    quotes: SEED_QUOTES,
    policies: SEED_POLICIES,
    documents: SEED_DOCUMENTS,
    approvals: SEED_APPROVALS,
    logs: SEED_LOGS,
    agentActivity: [],
    inventory: SEED_INVENTORY,
    notifications: [],
    isDemoMode: false,

    selectedMissionId: null,
    isCreatingMission: false,

    setSelectedMission: (id) => set({ selectedMissionId: id }),
    setIsCreatingMission: (v) => set({ isCreatingMission: v }),

    addMission: (mission) =>
        set((state) => ({ missions: [mission, ...state.missions] })),

    updateMission: (id, updates) =>
        set((state) => ({
            missions: state.missions.map((m) =>
                m.id === id ? { ...m, ...updates } : m
            ),
        })),

    addStep: (step) =>
        set((state) => ({ steps: [...state.steps, step] })),

    updateStep: (id, updates) =>
        set((state) => ({
            steps: state.steps.map((s) =>
                s.id === id ? { ...s, ...updates } : s
            ),
        })),

    addVendor: (vendor) =>
        set((state) => ({ vendors: [...state.vendors, vendor] })),

    removeVendor: (id) =>
        set((state) => ({
            vendors: state.vendors.filter((v) => v.id !== id),
        })),

    updateVendor: (id, updates) =>
        set((state) => ({
            vendors: state.vendors.map((v) =>
                v.id === id ? { ...v, ...updates } : v
            ),
        })),

    addPolicy: (policy) =>
        set((state) => ({ policies: [...state.policies, policy] })),

    removePolicy: (id) =>
        set((state) => ({
            policies: state.policies.filter((p) => p.id !== id),
        })),

    updatePolicy: (id, updates) =>
        set((state) => ({
            policies: state.policies.map((p) =>
                p.id === id ? { ...p, ...updates } : p
            ),
        })),

    addDocument: (doc) =>
        set((state) => ({ documents: [doc, ...state.documents] })),

    addQuotes: (newQuotes) =>
        set((state) => ({ quotes: [...state.quotes, ...newQuotes] })),

    addLog: (log) =>
        set((state) => ({ logs: [...state.logs, log] })),

    addApproval: (approval) =>
        set((state) => ({ approvals: [...state.approvals, approval] })),

    updateApproval: (id, updates) =>
        set((state) => ({
            approvals: state.approvals.map((a) =>
                a.id === id ? { ...a, ...updates } : a
            ),
        })),

    addAgentActivity: (item) =>
        set((state) => ({
            agentActivity: [item, ...state.agentActivity].slice(0, 50),
        })),

    // === Inventory Actions ===
    updateInventoryItem: (id, updates) =>
        set((state) => ({
            inventory: state.inventory.map((item) =>
                item.id === id ? { ...item, ...updates } : item
            ),
        })),

    drainStock: (id, amount) =>
        set((state) => {
            const inventory = state.inventory.map((item) => {
                if (item.id !== id) return item;
                const newStock = Math.max(0, item.currentStock - amount);
                const burnRate = item.burnRate;
                const daysUntilEmpty = burnRate > 0 ? Math.round(newStock / burnRate) : null;
                let status: StockStatus = "healthy";
                if (newStock <= 0) status = "critical";
                else if (newStock <= item.threshold * 0.5) status = "critical";
                else if (newStock <= item.threshold) status = "low";
                else if (newStock >= item.maxStock * 0.9) status = "overstock";
                return { ...item, currentStock: newStock, daysUntilEmpty, status };
            });
            return { inventory };
        }),

    restockItem: (id, amount) =>
        set((state) => ({
            inventory: state.inventory.map((item) => {
                if (item.id !== id) return item;
                const newStock = Math.min(item.maxStock, item.currentStock + amount);
                const daysUntilEmpty = item.burnRate > 0 ? Math.round(newStock / item.burnRate) : null;
                let status: StockStatus = "healthy";
                if (newStock >= item.maxStock * 0.9) status = "overstock";
                else if (newStock <= item.threshold * 0.5) status = "critical";
                else if (newStock <= item.threshold) status = "low";
                return { ...item, currentStock: newStock, daysUntilEmpty, status, lastRestocked: new Date().toISOString() };
            }),
        })),

    startDemoMode: () => set({ isDemoMode: true }),
    stopDemoMode: () => set({ isDemoMode: false }),

    // === Notification Actions ===
    addNotification: (notification) =>
        set((state) => ({
            notifications: [notification, ...state.notifications].slice(0, 100),
        })),

    markNotificationRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),

    markAllNotificationsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

    clearNotifications: () => set({ notifications: [] }),

    launchMission: async (requestText) => {
        const missionId = `mission_${Date.now()}`;
        const now = new Date().toISOString();

        const newMission: Mission = {
            id: missionId,
            request_text: requestText,
            status: "running",
            parsed_items: [
                {
                    name: requestText.slice(0, 50),
                    quantity: 1,
                    category: "General Procurement",
                },
            ],
            total_budget: null,
            total_savings: null,
            deadline: null,
            result_summary: null,
            created_at: now,
            updated_at: now,
        };

        set((state) => ({
            missions: [newMission, ...state.missions],
            isCreatingMission: true,
        }));

        // Show "Orchestrator initializing" activity
        set((state) => ({
            agentActivity: [
                { agent: "orchestrator" as AgentName, message: "Initializing mission pipeline...", timestamp: new Date().toISOString() },
                ...state.agentActivity,
            ].slice(0, 20),
            steps: [
                ...state.steps,
                {
                    id: `step_${Date.now()}_init`,
                    mission_id: missionId,
                    agent_name: "orchestrator" as AgentName,
                    step_order: 0,
                    action: "Initializing multi-agent pipeline...",
                    reasoning: "Setting up agent communication channels",
                    result: null,
                    status: "running" as const,
                    started_at: new Date().toISOString(),
                    completed_at: null,
                    metadata: {},
                },
            ],
        }));

        try {
            // Get current policies for the API call
            const currentPolicies = useAppStore.getState().policies.filter((p) => p.is_active);
            const currentVendors = useAppStore.getState().vendors;

            // Call the real agent API
            const res = await fetch("/api/agents/launch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestText,
                    policies: currentPolicies,
                    vendors: currentVendors.map((v) => v.name),
                }),
            });

            const data = await res.json();

            if (data.status === "clarification_needed") {
                // Revert optimistic updates
                set((state) => ({
                    missions: state.missions.filter((m) => m.id !== missionId),
                    steps: state.steps.filter((s) => s.mission_id !== missionId),
                    agentActivity: state.agentActivity.filter((a) => !a.message.includes("Initializing mission pipeline") || a.timestamp !== now),
                    isCreatingMission: false,
                }));
                return data;
            }

            if (!data.success) {
                throw new Error(data.error || "Mission failed");
            }

            // Process each logged step with small delays for visual feedback
            const agentLogs = data.logs || [];
            for (let i = 0; i < agentLogs.length; i++) {
                const log = agentLogs[i];
                await new Promise((resolve) => setTimeout(resolve, 400));

                const stepId = `step_${Date.now()}_${i}`;
                const stepNow = new Date().toISOString();

                set((state) => ({
                    steps: [
                        ...state.steps,
                        {
                            id: stepId,
                            mission_id: missionId,
                            agent_name: log.agent as AgentName,
                            step_order: i + 1,
                            action: log.action,
                            reasoning: log.usedAI ? "Powered by GPT-4o" : "Simulated agent logic",
                            result: JSON.stringify(log.result).slice(0, 200),
                            status: "completed" as const,
                            started_at: log.timestamp || stepNow,
                            completed_at: stepNow,
                            metadata: { usedAI: log.usedAI },
                        },
                    ],
                    agentActivity: [
                        {
                            agent: log.agent as AgentName,
                            message: `${log.usedAI ? "🧠 " : ""}${log.action}`,
                            timestamp: stepNow,
                        },
                        ...state.agentActivity,
                    ].slice(0, 20),
                    logs: [
                        ...state.logs,
                        {
                            id: `log_${Date.now()}_${i}`,
                            mission_id: missionId,
                            agent_name: log.agent as AgentName,
                            level: log.status === "completed" ? "info" as const : "error" as const,
                            message: log.action,
                            payload: typeof log.result === "object" ? log.result : null,
                            created_at: stepNow,
                        },
                    ],
                }));
            }

            // Add quotes to store
            if (data.quotes && data.quotes.length > 0) {
                const storeQuotes: VendorQuote[] = data.quotes.map((q: { vendor_name: string; item_name: string; unit_price: number; quantity: number; total_price: number; availability: string; shipping_days: number; selected: boolean; reasoning: string }, idx: number) => ({
                    id: `quote_${Date.now()}_${idx}`,
                    mission_id: missionId,
                    vendor_id: `vendor_${q.vendor_name.toLowerCase().replace(/\s+/g, "_")}`,
                    vendor_name: q.vendor_name,
                    item_name: q.item_name,
                    unit_price: q.unit_price,
                    quantity: q.quantity,
                    total_price: q.total_price,
                    availability: q.availability,
                    shipping_days: q.shipping_days,
                    selected: q.selected,
                    reasoning: q.reasoning,
                }));
                set((state) => ({ quotes: [...state.quotes, ...storeQuotes] }));
            }

            // Add document to store
            if (data.document) {
                const doc: ProcurementDocument = {
                    id: `doc_${Date.now()}`,
                    mission_id: missionId,
                    type: data.document.type || "purchase_order",
                    title: data.document.title,
                    content: data.document.content,
                    metadata: data.document.metadata || {},
                    created_at: new Date().toISOString(),
                };
                set((state) => ({ documents: [doc, ...state.documents] }));
            }

            // Add approval request if needed
            if (data.needsApproval) {
                const approval: ApprovalRequest = {
                    id: `approval_${Date.now()}`,
                    mission_id: missionId,
                    description: `Approve procurement: ${data.summary || requestText}`,
                    total_amount: data.totalAmount || 0,
                    status: "pending",
                    approver: null,
                    approved_at: null,
                    created_at: new Date().toISOString(),
                };
                set((state) => ({ approvals: [...state.approvals, approval] }));
            }

            // Complete the init step and finalize mission
            set((state) => ({
                missions: state.missions.map((m) =>
                    m.id === missionId
                        ? {
                            ...m,
                            status: (data.needsApproval ? "awaiting_approval" : "completed") as MissionStatus,
                            parsed_items: data.parsed?.items || m.parsed_items,
                            total_budget: data.totalAmount || null,
                            total_savings: data.savings || null,
                            result_summary: data.usedAI
                                ? `🧠 AI-powered: ${data.summary || "Mission completed successfully."}`
                                : `${data.summary || "Mission completed successfully."}`,
                            updated_at: new Date().toISOString(),
                        }
                        : m
                ),
                steps: state.steps.map((s) =>
                    s.mission_id === missionId && s.status === "running"
                        ? { ...s, status: "completed" as const, completed_at: new Date().toISOString(), result: "Pipeline initialized" }
                        : s
                ),
                isCreatingMission: false,
            }));
        } catch (error) {
            // On error, mark mission as failed
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            set((state) => ({
                missions: state.missions.map((m) =>
                    m.id === missionId
                        ? {
                            ...m,
                            status: "failed" as MissionStatus,
                            result_summary: `Mission failed: ${errorMsg}`,
                            updated_at: new Date().toISOString(),
                        }
                        : m
                ),
                steps: state.steps.map((s) =>
                    s.mission_id === missionId && s.status === "running"
                        ? { ...s, status: "failed" as const, completed_at: new Date().toISOString(), result: errorMsg }
                        : s
                ),
                agentActivity: [
                    { agent: "orchestrator" as AgentName, message: `❌ Mission failed: ${errorMsg}`, timestamp: new Date().toISOString() },
                    ...state.agentActivity,
                ].slice(0, 20),
                isCreatingMission: false,
            }));
        }
    },
}));
