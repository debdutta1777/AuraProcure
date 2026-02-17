"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Search,
    Mic,
    MicOff,
    Send,
    Bot,
    TrendingUp,
    Clock,
    CheckCircle2,
    DollarSign,
    Loader2,
    AlertCircle,
    Activity,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import { cn, formatCurrency, timeAgo, getStatusColor, getStatusBg } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

const kpiData = [
    {
        label: "Total Savings",
        value: "$127,430",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "text-accent-emerald",
        bgColor: "bg-accent-emerald/10",
    },
    {
        label: "Avg Cycle Time",
        value: "2.4 hrs",
        change: "-18.3%",
        trend: "down",
        icon: Clock,
        color: "text-accent-blue",
        bgColor: "bg-accent-blue/10",
    },
    {
        label: "Success Rate",
        value: "96.8%",
        change: "+2.1%",
        trend: "up",
        icon: CheckCircle2,
        color: "text-accent-cyan",
        bgColor: "bg-accent-cyan/10",
    },
    {
        label: "Active Missions",
        value: "7",
        change: "+3",
        trend: "up",
        icon: Activity,
        color: "text-accent-purple",
        bgColor: "bg-accent-purple/10",
    },
];

export default function DashboardPage() {
    const { missions, steps, launchMission, agentActivity } = useAppStore();
    const [query, setQuery] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [clarification, setClarification] = useState<{ question: string; originalRequest: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleLaunch = async () => {
        if (!query.trim() || isLaunching) return;
        setIsLaunching(true);

        const textToSubmit = clarification
            ? `${clarification.originalRequest}. User Answer: ${query.trim()}`
            : query.trim();

        try {
            const result = await launchMission(textToSubmit);

            if (result && result.status === "clarification_needed") {
                setClarification({
                    question: result.question,
                    originalRequest: result.original_request
                });
                setQuery("");
                // Focus input
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                setClarification(null);
                setQuery("");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLaunching(false);
        }
    };

    const handleVoice = () => {
        if (isListening) {
            setIsListening(false);
            return;
        }
        setIsListening(true);
        // Simulate voice transcription
        setTimeout(() => {
            setQuery("We need 50 high-end laptops for the engineering team by end of week");
            setIsListening(false);
        }, 2000);
    };

    const activeMissions = missions.filter(
        (m) => m.status === "running" || m.status === "awaiting_approval"
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-accent-blue" />
                    <span className="text-sm text-text-muted">Command Center</span>
                </div>
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-secondary mt-1">
                    Launch procurement missions and monitor your AI agent team in real-time
                </p>
            </div>

            {/* Quick Trigger */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 glow-blue"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-accent-blue" />
                    <span className="text-sm font-medium text-text-secondary">
                        {clarification ? (
                            <span className="text-accent-amber animate-pulse font-bold">
                                ⚠️ Clarification Needed: {clarification.question}
                            </span>
                        ) : (
                            "Start a New Procurement Mission"
                        )}
                    </span>
                </div>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
                            placeholder={clarification ? "Type your answer here..." : 'Try: "We need 50 laptops for the dev team by Friday"'}
                            className="w-full pl-12 pr-4 py-3.5 bg-bg-primary/80 border border-border-primary rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue/50 focus:outline-none transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleVoice}
                        className={cn(
                            "p-3.5 rounded-xl border transition-all",
                            isListening
                                ? "bg-accent-rose/20 border-accent-rose/40 text-accent-rose animate-pulse"
                                : "bg-bg-primary/80 border-border-primary text-text-muted hover:text-text-primary hover:border-accent-rose/30"
                        )}
                    >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={handleLaunch}
                        disabled={!query.trim() || isLaunching}
                        className="px-6 py-3.5 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-xl text-white font-semibold text-sm hover:shadow-lg hover:shadow-accent-blue/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLaunching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Launch
                    </button>
                </div>
            </motion.div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiData.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div
                            key={kpi.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={cn("p-2 rounded-xl", kpi.bgColor)}>
                                    <Icon className={cn("w-5 h-5", kpi.color)} />
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-full",
                                        kpi.trend === "up"
                                            ? "text-accent-emerald bg-accent-emerald/10"
                                            : "text-accent-blue bg-accent-blue/10"
                                    )}
                                >
                                    {kpi.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
                            <p className="text-xs text-text-muted mt-0.5">{kpi.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Active Missions Feed + Agent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Missions Feed */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-text-primary flex items-center gap-2">
                            <Activity className="w-4 h-4 text-accent-blue" />
                            Active Missions
                        </h2>
                        <Link href="/dashboard/missions" className="text-xs text-accent-blue hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {missions.slice(0, 5).map((mission) => {
                                const mSteps = steps.filter((s) => s.mission_id === mission.id);
                                const done = mSteps.filter((s) => s.status === "completed").length;
                                const pct = mSteps.length > 0 ? (done / mSteps.length) * 100 : 0;

                                return (
                                    <motion.div
                                        key={mission.id}
                                        layout
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 15 }}
                                    >
                                        <Link href={`/dashboard/missions/${mission.id}`}>
                                            <div className="p-4 bg-bg-primary/50 rounded-xl border border-border-secondary hover:border-accent-blue/20 transition-all cursor-pointer group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm text-text-primary font-medium group-hover:text-accent-blue transition-colors truncate max-w-[70%]">
                                                        {mission.request_text}
                                                    </p>
                                                    <span
                                                        className={cn(
                                                            "status-badge text-[10px]",
                                                            getStatusBg(mission.status),
                                                            getStatusColor(mission.status)
                                                        )}
                                                    >
                                                        {mission.status === "running" && (
                                                            <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                                                        )}
                                                        {mission.status.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between mt-2 text-[10px] text-text-muted">
                                                    <span>{done}/{mSteps.length} steps completed</span>
                                                    <span>{timeAgo(mission.created_at)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {missions.length === 0 && (
                            <div className="text-center py-10">
                                <Bot className="w-10 h-10 text-text-muted mx-auto mb-3" />
                                <p className="text-sm text-text-secondary">No missions yet</p>
                                <p className="text-xs text-text-muted mt-1">
                                    Use the Quick Trigger above to launch your first procurement mission
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agent Activity */}
                <div className="glass-card p-6">
                    <h2 className="font-bold text-text-primary flex items-center gap-2 mb-4">
                        <Bot className="w-4 h-4 text-accent-cyan" />
                        Agent Activity
                    </h2>
                    <div className="space-y-3">
                        {agentActivity.length > 0 ? (
                            agentActivity.slice(0, 8).map((activity, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start gap-3 py-2 px-3 bg-bg-primary/40 rounded-lg border border-border-secondary"
                                >
                                    <div
                                        className={cn(
                                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                            activity.agent === "orchestrator" && "bg-indigo-400",
                                            activity.agent === "sourcing_scout" && "bg-cyan-400",
                                            activity.agent === "compliance_officer" && "bg-emerald-400",
                                            activity.agent === "document_drafter" && "bg-amber-400",
                                            activity.agent === "hitl_bridge" && "bg-purple-400"
                                        )}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-text-primary truncate">{activity.message}</p>
                                        <p className="text-[10px] text-text-muted mt-0.5 capitalize">
                                            {activity.agent.replace("_", " ")}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <Activity className="w-6 h-6 text-text-muted mx-auto mb-2" />
                                <p className="text-xs text-text-muted">
                                    Agent activity will appear here during missions
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
