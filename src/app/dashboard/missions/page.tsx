"use client";

import { motion } from "framer-motion";
import {
    ClipboardList,
    Search,
    Filter,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Clock,
    DollarSign,
    ArrowRight,
} from "lucide-react";
import { cn, timeAgo, getStatusColor, getStatusBg, formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function MissionsPage() {
    const { missions, steps } = useAppStore();
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const filteredMissions = missions
        .filter((m) => filter === "all" || m.status === filter)
        .filter((m) => m.request_text.toLowerCase().includes(search.toLowerCase()));

    const statusFilters = [
        { label: "All", value: "all", count: missions.length },
        { label: "Running", value: "running", count: missions.filter((m) => m.status === "running").length },
        { label: "Awaiting Approval", value: "awaiting_approval", count: missions.filter((m) => m.status === "awaiting_approval").length },
        { label: "Completed", value: "completed", count: missions.filter((m) => m.status === "completed").length },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="w-5 h-5 text-accent-blue" />
                    <span className="text-sm text-text-muted">Agent Traceability</span>
                </div>
                <h1 className="text-3xl font-bold text-text-primary">Mission Log</h1>
                <p className="text-text-secondary mt-1">
                    Track every agent decision with full reasoning and audit trails
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search missions..."
                        className="w-full pl-11 pr-4 py-2.5 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary placeholder:text-text-muted"
                    />
                </div>
                <div className="flex gap-2">
                    {statusFilters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={cn(
                                "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                                filter === f.value
                                    ? "bg-accent-blue/15 border-accent-blue/30 text-accent-blue"
                                    : "bg-bg-card border-border-secondary text-text-muted hover:text-text-secondary"
                            )}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Mission List */}
            <div className="space-y-3">
                {filteredMissions.map((mission, i) => {
                    const missionSteps = steps.filter((s) => s.mission_id === mission.id);
                    const completedSteps = missionSteps.filter((s) => s.status === "completed").length;
                    const progress = missionSteps.length > 0 ? (completedSteps / missionSteps.length) * 100 : 0;

                    return (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={`/dashboard/missions/${mission.id}`}>
                                <div className="glass-card p-5 cursor-pointer hover:border-accent-blue/30 transition-all group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <p className="font-medium text-text-primary group-hover:text-accent-blue transition-colors">
                                                {mission.request_text}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(mission.created_at)}
                                                </span>
                                                <span>{mission.parsed_items?.[0]?.category || "General"}</span>
                                                <span>{completedSteps}/{missionSteps.length} steps</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {mission.total_savings && mission.total_savings > 0 && (
                                                <span className="text-xs text-accent-emerald flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {formatCurrency(mission.total_savings)}
                                                </span>
                                            )}
                                            <span
                                                className={cn(
                                                    "status-badge whitespace-nowrap",
                                                    getStatusBg(mission.status),
                                                    getStatusColor(mission.status)
                                                )}
                                            >
                                                {mission.status === "running" && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
                                                {mission.status === "completed" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                                                {mission.status === "awaiting_approval" && <AlertCircle className="w-3 h-3 inline mr-1" />}
                                                {mission.status.replace("_", " ")}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent-blue transition-colors" />
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="h-1 bg-bg-primary/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {mission.result_summary && (
                                        <p className="text-xs text-text-secondary mt-3 line-clamp-1">
                                            {mission.result_summary}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}

                {filteredMissions.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <p className="text-text-secondary">No missions found</p>
                        <p className="text-xs text-text-muted mt-1">
                            Launch a new mission from the Command Center
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
