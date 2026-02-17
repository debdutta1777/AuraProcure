// ===== Mission Types =====
export type MissionStatus =
    | "pending"
    | "running"
    | "awaiting_approval"
    | "completed"
    | "failed";

export type AgentName =
    | "orchestrator"
    | "sourcing_scout"
    | "compliance_officer"
    | "document_drafter"
    | "hitl_bridge";

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface Mission {
    id: string;
    request_text: string;
    status: MissionStatus;
    parsed_items: ParsedItem[];
    total_budget: number | null;
    total_savings: number | null;
    deadline: string | null;
    result_summary: string | null;
    created_at: string;
    updated_at: string;
}

export interface ParsedItem {
    name: string;
    quantity: number;
    category: string;
    specifications?: string;
    estimated_unit_price?: number;
}

// ===== Step Types =====
export interface MissionStep {
    id: string;
    mission_id: string;
    agent_name: AgentName;
    step_order: number;
    action: string;
    reasoning: string | null;
    result: string | null;
    status: StepStatus;
    started_at: string | null;
    completed_at: string | null;
    metadata: Record<string, unknown>;
}

// ===== Vendor Types =====
export interface Vendor {
    id: string;
    name: string;
    website: string;
    category: string;
    is_whitelisted: boolean;
    rating: number;
    contact_email: string | null;
    notes: string | null;
    created_at: string;
}

export interface VendorQuote {
    id: string;
    mission_id: string;
    vendor_id: string;
    vendor_name: string;
    item_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    availability: string;
    shipping_days: number;
    selected: boolean;
    reasoning: string | null;
}

// ===== Policy Types =====
export interface Policy {
    id: string;
    name: string;
    description: string;
    category: string;
    rule_text: string;
    threshold_amount: number | null;
    is_active: boolean;
    created_at: string;
}

export interface ComplianceResult {
    policy_id: string;
    policy_name: string;
    passed: boolean;
    reason: string;
    citation: string | null;
}

// ===== Document Types =====
export type DocumentType = "rfq" | "purchase_order" | "invoice" | "contract_summary";

export interface ProcurementDocument {
    id: string;
    mission_id: string;
    type: DocumentType;
    title: string;
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

// ===== Approval Types =====
export interface ApprovalRequest {
    id: string;
    mission_id: string;
    description: string;
    total_amount: number;
    status: "pending" | "approved" | "rejected";
    approver: string | null;
    approved_at: string | null;
    created_at: string;
}

// ===== Agent Log Types =====
export type LogLevel = "info" | "warn" | "error" | "debug";

export interface AgentLog {
    id: string;
    mission_id: string;
    agent_name: AgentName;
    level: LogLevel;
    message: string;
    payload: Record<string, unknown> | null;
    created_at: string;
}

// ===== Agent Communication =====
export interface MissionContext {
    mission: Mission;
    parsed_items: ParsedItem[];
    vendors: Vendor[];
    policies: Policy[];
    quotes: VendorQuote[];
    compliance_results: ComplianceResult[];
    approval_status: "pending" | "approved" | "rejected" | null;
}

export interface AgentResult {
    success: boolean;
    agent: AgentName;
    action: string;
    reasoning: string;
    data: Record<string, unknown>;
    logs: Omit<AgentLog, "id" | "created_at">[];
}

// ===== Inventory Types =====
export type StockStatus = "critical" | "low" | "healthy" | "overstock";

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    maxStock: number;
    threshold: number;
    unit: string;
    burnRate: number; // units consumed per day
    lastRestocked: string;
    status: StockStatus;
    daysUntilEmpty: number | null;
    autoReorder: boolean;
}

// ===== Notification Types =====
export type NotificationType = "alert" | "success" | "info" | "warning";

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    agent?: AgentName | "inventory_monitor";
    read: boolean;
    actionUrl?: string;
    timestamp: string;
}
