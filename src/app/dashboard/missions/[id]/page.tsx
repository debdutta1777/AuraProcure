"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    Bot,
    Search,
    ShieldCheck,
    FileText,
    UserCheck,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    ArrowLeft,
    Terminal,
    Lightbulb,
    DollarSign,
    ChevronDown,
    ChevronUp,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { cn, timeAgo, formatDate, getStatusColor, getStatusBg, formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { AgentName } from "@/lib/agents/types";
import Link from "next/link";
import { useState } from "react";

const agentIcons: Record<AgentName, React.ElementType> = {
    orchestrator: Bot,
    sourcing_scout: Search,
    compliance_officer: ShieldCheck,
    document_drafter: FileText,
    hitl_bridge: UserCheck,
};

const agentLabels: Record<AgentName, string> = {
    orchestrator: "Lead Orchestrator",
    sourcing_scout: "Sourcing Scout",
    compliance_officer: "Compliance Officer",
    document_drafter: "Document Drafter",
    hitl_bridge: "HITL Bridge",
};

const agentColors: Record<AgentName, string> = {
    orchestrator: "text-accent-blue",
    sourcing_scout: "text-accent-cyan",
    compliance_officer: "text-accent-emerald",
    document_drafter: "text-accent-amber",
    hitl_bridge: "text-accent-purple",
};

const agentBgColors: Record<AgentName, string> = {
    orchestrator: "bg-accent-blue/10 border-accent-blue/20",
    sourcing_scout: "bg-accent-cyan/10 border-accent-cyan/20",
    compliance_officer: "bg-accent-emerald/10 border-accent-emerald/20",
    document_drafter: "bg-accent-amber/10 border-accent-amber/20",
    hitl_bridge: "bg-accent-purple/10 border-accent-purple/20",
};

export default function MissionDetailPage() {
    const params = useParams();
    const missionId = params.id as string;
    const { missions, steps, logs, quotes, approvals, updateApproval, updateMission, updateStep, addLog } = useAppStore();
    const [showLogs, setShowLogs] = useState(true);

    const mission = missions.find((m) => m.id === missionId);
    const missionSteps = steps
        .filter((s) => s.mission_id === missionId)
        .sort((a, b) => a.step_order - b.step_order);
    const missionLogs = logs
        .filter((l) => l.mission_id === missionId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const missionQuotes = quotes.filter((q) => q.mission_id === missionId);
    const missionApprovals = approvals.filter((a) => a.mission_id === missionId);
    const pendingApproval = missionApprovals.find((a) => a.status === "pending");

    if (!mission) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="glass-card p-12 text-center">
                    <p className="text-text-secondary">Mission not found</p>
                    <Link href="/dashboard/missions" className="text-accent-blue text-sm mt-2 inline-block">
                        ← Back to Mission Log
                    </Link>
                </div>
            </div>
        );
    }

    function handleApproval(approved: boolean) {
        if (!pendingApproval) return;
        updateApproval(pendingApproval.id, {
            status: approved ? "approved" : "rejected",
            approver: "admin@company.com",
            approved_at: new Date().toISOString(),
        });
        if (approved) {
            updateMission(missionId, { status: "running" });
        } else {
            updateMission(missionId, { status: "failed" });
        }
        addLog({
            id: crypto.randomUUID(),
            mission_id: missionId,
            agent_name: "hitl_bridge",
            level: "info",
            message: approved
                ? "✅ Approved by admin@company.com — resuming workflow"
                : "❌ Rejected by admin@company.com — workflow terminated",
            payload: { approver: "admin@company.com", approved },
            created_at: new Date().toISOString(),
        });
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Back + Header */}
            <div className="animate-slide-up">
                <Link
                    href="/dashboard/missions"
                    className="text-sm text-text-muted hover:text-accent-blue flex items-center gap-1 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Mission Log
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">
                            {mission.request_text}
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(mission.created_at)}
                            </span>
                            {mission.total_budget && (
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Budget: {formatCurrency(mission.total_budget)}
                                </span>
                            )}
                            {mission.total_savings && mission.total_savings > 0 && (
                                <span className="text-accent-emerald flex items-center gap-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Saved: {formatCurrency(mission.total_savings)}
                                </span>
                            )}
                        </div>
                    </div>
                    <span
                        className={cn(
                            "status-badge flexitems-center gap-1",
                            getStatusBg(mission.status),
                            getStatusColor(mission.status)
                        )}
                    >
                        {mission.status === "running" && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
                        {mission.status === "completed" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {mission.status.replace("_", " ")}
                    </span>
                </div>
            </div>

            {/* HITL Approval Panel */}
            {pendingApproval && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-6 border-accent-purple/30"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <UserCheck className="w-5 h-5 text-accent-purple" />
                        <h3 className="font-semibold text-accent-purple">Human Approval Required</h3>
                    </div>
                    <p className="text-sm text-text-secondary mb-4">{pendingApproval.description}</p>
                    <div className="flex items-center gap-2 mb-4 text-sm">
                        <span className="text-text-muted">Amount:</span>
                        <span className="font-semibold text-text-primary">
                            {formatCurrency(pendingApproval.total_amount)}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleApproval(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-accent-emerald to-accent-cyan rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            Approve
                        </button>
                        <button
                            onClick={() => handleApproval(false)}
                            className="px-6 py-2.5 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose font-semibold flex items-center gap-2 hover:bg-accent-rose/20 transition-all"
                        >
                            <ThumbsDown className="w-4 h-4" />
                            Reject
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Agent Timeline */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-accent-amber" />
                        Agent Reasoning Timeline
                    </h2>
                    <div className="space-y-3">
                        {missionSteps.map((step, i) => {
                            const Icon = agentIcons[step.agent_name];
                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        "glass-card p-5 border-l-4",
                                        step.status === "completed"
                                            ? "border-l-accent-emerald"
                                            : step.status === "running"
                                                ? "border-l-accent-blue"
                                                : step.status === "failed"
                                                    ? "border-l-accent-rose"
                                                    : "border-l-text-muted/20"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center border shrink-0",
                                                agentBgColors[step.agent_name]
                                            )}
                                        >
                                            {step.status === "running" ? (
                                                <Loader2
                                                    className={cn("w-4 h-4 animate-spin", agentColors[step.agent_name])}
                                                />
                                            ) : (
                                                <Icon className={cn("w-4 h-4", agentColors[step.agent_name])} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className={cn("text-sm font-semibold", agentColors[step.agent_name])}>
                                                    {agentLabels[step.agent_name]}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {step.status === "completed" && (
                                                        <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                                                    )}
                                                    {step.status === "failed" && (
                                                        <XCircle className="w-4 h-4 text-accent-rose" />
                                                    )}
                                                    {step.started_at && (
                                                        <span className="text-[10px] text-text-muted">
                                                            {timeAgo(step.started_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-primary mb-2">{step.action}</p>
                                            {step.reasoning && (
                                                <div className="p-3 bg-bg-primary/40 rounded-lg mt-2">
                                                    <p className="text-xs text-text-muted font-semibold mb-1 uppercase tracking-wider">
                                                        Reasoning
                                                    </p>
                                                    <p className="text-xs text-text-secondary leading-relaxed">
                                                        {step.reasoning}
                                                    </p>
                                                </div>
                                            )}
                                            {step.result && (
                                                <p className="text-xs text-accent-emerald mt-2 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {step.result}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Vendor Comparison Table */}
                    {missionQuotes.length > 0 && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-accent-cyan" />
                                Vendor Comparison
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-text-muted text-xs uppercase">
                                            <th className="text-left py-2 px-3">Vendor</th>
                                            <th className="text-left py-2 px-3">Product</th>
                                            <th className="text-right py-2 px-3">Unit Price</th>
                                            <th className="text-right py-2 px-3">Total</th>
                                            <th className="text-center py-2 px-3">Ship (days)</th>
                                            <th className="text-center py-2 px-3">Selected</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-secondary">
                                        {missionQuotes.map((q) => (
                                            <tr
                                                key={q.id}
                                                className={cn(
                                                    "transition-colors",
                                                    q.selected ? "bg-accent-emerald/5" : "hover:bg-white/[0.02]"
                                                )}
                                            >
                                                <td className="py-2.5 px-3 font-medium text-text-primary">
                                                    {q.vendor_name}
                                                </td>
                                                <td className="py-2.5 px-3 text-text-secondary text-xs">
                                                    {q.item_name}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-text-primary">
                                                    ${q.unit_price.toLocaleString()}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-text-primary">
                                                    ${q.total_price.toLocaleString()}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <span
                                                        className={cn(
                                                            "text-xs",
                                                            q.shipping_days <= 7 ? "text-accent-emerald" : "text-accent-amber"
                                                        )}
                                                    >
                                                        {q.shipping_days}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {q.selected ? (
                                                        <CheckCircle2 className="w-4 h-4 text-accent-emerald mx-auto" />
                                                    ) : (
                                                        <span className="text-text-muted">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Raw Logs */}
                <div className="space-y-4">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-lg font-semibold flex items-center gap-2 w-full"
                    >
                        <Terminal className="w-5 h-5 text-accent-blue" />
                        Agent Logs
                        {showLogs ? (
                            <ChevronUp className="w-4 h-4 text-text-muted ml-auto" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-text-muted ml-auto" />
                        )}
                    </button>
                    {showLogs && (
                        <div className="log-terminal p-4 max-h-[600px] overflow-y-auto">
                            {missionLogs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="mb-2 last:mb-0"
                                >
                                    <span className="text-text-muted text-[10px]">
                                        {new Date(log.created_at).toLocaleTimeString()}
                                    </span>
                                    <span
                                        className={cn(
                                            "ml-2 text-[10px] font-bold uppercase",
                                            log.level === "error"
                                                ? "text-accent-rose"
                                                : log.level === "warn"
                                                    ? "text-accent-amber"
                                                    : log.level === "debug"
                                                        ? "text-text-muted"
                                                        : "text-accent-emerald"
                                        )}
                                    >
                                        [{log.level}]
                                    </span>
                                    <span className={cn("ml-2 text-[11px]", `agent-${log.agent_name}`)}>
                                        {log.agent_name}:
                                    </span>
                                    <span className="ml-1 text-[12px] text-text-secondary">
                                        {log.message}
                                    </span>
                                </motion.div>
                            ))}
                            {missionLogs.length === 0 && (
                                <p className="text-text-muted text-xs">No logs yet...</p>
                            )}
                        </div>
                    )}

                    {/* Mission Summary */}
                    {mission.result_summary && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-text-primary mb-2">Mission Summary</h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                {mission.result_summary}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
