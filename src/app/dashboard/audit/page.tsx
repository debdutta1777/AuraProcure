"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
    ClipboardList,
    Search,
    Filter,
    Bot,
    User,
    ShieldCheck,
    FileText,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { format } from "date-fns";

interface AuditEntry {
    id: string;
    timestamp: string;
    actor: string;
    actorType: "agent" | "user" | "system";
    action: string;
    category: "mission" | "compliance" | "document" | "approval" | "system";
    details: string;
    status: "success" | "warning" | "error" | "info";
}

const CATEGORY_ICONS = {
    mission: Bot,
    compliance: ShieldCheck,
    document: FileText,
    approval: User,
    system: AlertTriangle,
};

const STATUS_COLORS = {
    success: "text-accent-emerald",
    warning: "text-accent-amber",
    error: "text-accent-rose",
    info: "text-accent-blue",
};

export default function AuditTrailPage() {
    const { missions, logs, steps, documents, approvals } = useAppStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Build audit entries from all store data
    const auditEntries: AuditEntry[] = useMemo(() => {
        const entries: AuditEntry[] = [];

        // From missions
        missions.forEach((m) => {
            entries.push({
                id: `audit_mission_${m.id}`,
                timestamp: m.created_at,
                actor: "Orchestrator",
                actorType: "agent",
                action: "Mission Created",
                category: "mission",
                details: `"${m.request_text.slice(0, 80)}" — Status: ${m.status}`,
                status: m.status === "completed" ? "success" : m.status === "failed" ? "error" : "info",
            });
        });

        // From steps
        steps.forEach((s) => {
            entries.push({
                id: `audit_step_${s.id}`,
                timestamp: s.started_at || s.completed_at || new Date().toISOString(),
                actor: s.agent_name.replace("_", " "),
                actorType: "agent",
                action: s.action.slice(0, 60),
                category: "mission",
                details: `Step ${s.step_order}: ${s.result || "In progress"} — ${s.status}`,
                status: s.status === "completed" ? "success" : s.status === "failed" ? "error" : "info",
            });
        });

        // From documents
        documents.forEach((d) => {
            entries.push({
                id: `audit_doc_${d.id}`,
                timestamp: d.created_at,
                actor: "Document Drafter",
                actorType: "agent",
                action: `Generated ${d.type.replace("_", " ")}`,
                category: "document",
                details: d.title,
                status: "success",
            });
        });

        // From approvals
        approvals.forEach((a) => {
            entries.push({
                id: `audit_approval_${a.id}`,
                timestamp: a.created_at,
                actor: a.approver || "HITL Bridge",
                actorType: a.approver ? "user" : "agent",
                action: `Approval ${a.status}`,
                category: "approval",
                details: `${a.description} — $${a.total_amount.toLocaleString()}`,
                status: a.status === "approved" ? "success" : a.status === "rejected" ? "error" : "warning",
            });
        });

        // From logs
        logs.forEach((l) => {
            entries.push({
                id: `audit_log_${l.id}`,
                timestamp: l.created_at,
                actor: l.agent_name.replace("_", " "),
                actorType: "agent",
                action: l.message.slice(0, 60),
                category: l.level === "error" ? "system" : "mission",
                details: l.message,
                status: l.level === "error" ? "error" : l.level === "warn" ? "warning" : "info",
            });
        });

        // Sort by timestamp descending
        return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [missions, steps, documents, approvals, logs]);

    const filtered = useMemo(() => {
        return auditEntries.filter((entry) => {
            const matchesSearch =
                !searchQuery ||
                entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.actor.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [auditEntries, searchQuery, categoryFilter]);

    const categories = ["all", "mission", "compliance", "document", "approval", "system"];

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <ClipboardList className="w-7 h-7 text-accent-blue" />
                        Audit Trail
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Complete history of all actions — {auditEntries.length} entries
                    </p>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-4 flex flex-col md:flex-row gap-3"
            >
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search audit trail..."
                        className="w-full bg-bg-primary/50 text-sm text-text-primary placeholder:text-text-muted pl-10 pr-4 py-2.5 rounded-xl border border-border-secondary focus:border-accent-blue/30"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-text-muted" />
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-all capitalize ${categoryFilter === cat
                                ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                                : "border-border-secondary text-text-muted hover:text-text-primary"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Actions", value: auditEntries.length, icon: ClipboardList, color: "text-accent-blue" },
                    { label: "Successful", value: auditEntries.filter((e) => e.status === "success").length, icon: CheckCircle, color: "text-accent-emerald" },
                    { label: "Warnings", value: auditEntries.filter((e) => e.status === "warning").length, icon: Clock, color: "text-accent-amber" },
                    { label: "Errors", value: auditEntries.filter((e) => e.status === "error").length, icon: XCircle, color: "text-accent-rose" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="glass-card p-4 flex items-center gap-3"
                    >
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <div>
                            <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Audit Log Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-text-muted text-xs border-b border-border-secondary bg-bg-primary/30">
                                <th className="text-left py-3 px-4 font-medium">Time</th>
                                <th className="text-left py-3 px-4 font-medium">Actor</th>
                                <th className="text-left py-3 px-4 font-medium">Action</th>
                                <th className="text-left py-3 px-4 font-medium">Category</th>
                                <th className="text-left py-3 px-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.slice(0, 100).map((entry, i) => {
                                const CategoryIcon = CATEGORY_ICONS[entry.category] || Bot;
                                return (
                                    <motion.tr
                                        key={entry.id + i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="border-b border-border-secondary/50 hover:bg-bg-card/50 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-text-muted text-xs whitespace-nowrap">
                                            {format(new Date(entry.timestamp), "MMM dd, HH:mm:ss")}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="flex items-center gap-2 text-text-primary capitalize">
                                                {entry.actorType === "agent" ? (
                                                    <Bot className="w-3.5 h-3.5 text-accent-blue" />
                                                ) : (
                                                    <User className="w-3.5 h-3.5 text-accent-purple" />
                                                )}
                                                {entry.actor}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-text-secondary max-w-xs truncate">
                                            {entry.action}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="flex items-center gap-1.5 text-xs text-text-muted capitalize">
                                                <CategoryIcon className="w-3 h-3" />
                                                {entry.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`flex items-center gap-1 text-xs font-medium ${STATUS_COLORS[entry.status]}`}>
                                                {entry.status === "success" && <CheckCircle className="w-3 h-3" />}
                                                {entry.status === "warning" && <Clock className="w-3 h-3" />}
                                                {entry.status === "error" && <XCircle className="w-3 h-3" />}
                                                {entry.status === "info" && <Bot className="w-3 h-3" />}
                                                {entry.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-text-muted text-sm">
                        No audit entries match your filters
                    </div>
                )}
            </motion.div>
        </div>
    );
}
