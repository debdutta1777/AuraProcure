"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
    Package,
    AlertTriangle,
    CheckCircle,
    TrendingDown,
    Zap,
    RefreshCw,
    Play,
    Square,
    ArrowDown,
    ArrowUp,
    Clock,
    BarChart3,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts";
import { InventoryItem } from "@/lib/agents/types";

const STATUS_CONFIG = {
    critical: { color: "text-accent-rose", bg: "bg-accent-rose/10", border: "border-accent-rose/30", label: "CRITICAL", barColor: "#f43f5e" },
    low: { color: "text-accent-amber", bg: "bg-accent-amber/10", border: "border-accent-amber/30", label: "LOW", barColor: "#f59e0b" },
    healthy: { color: "text-accent-emerald", bg: "bg-accent-emerald/10", border: "border-accent-emerald/30", label: "HEALTHY", barColor: "#10b981" },
    overstock: { color: "text-accent-blue", bg: "bg-accent-blue/10", border: "border-accent-blue/30", label: "OVERSTOCK", barColor: "#6366f1" },
};

export default function InventoryPage() {
    const {
        inventory,
        drainStock,
        restockItem,
        isDemoMode,
        startDemoMode,
        stopDemoMode,
        addNotification,
        addAgentActivity,
        launchMission,
    } = useAppStore();

    const [filterStatus, setFilterStatus] = useState<string>("all");
    const triggeredRef = useRef<Set<string>>(new Set());
    const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Demo Mode: Auto Drain ---
    useEffect(() => {
        if (isDemoMode) {
            demoIntervalRef.current = setInterval(() => {
                inventory.forEach((item) => {
                    if (item.currentStock > 0) {
                        const drainAmount = Math.max(1, Math.round(item.burnRate * (0.5 + Math.random())));
                        drainStock(item.id, drainAmount);
                    }
                });
            }, 2000);
        } else {
            if (demoIntervalRef.current) {
                clearInterval(demoIntervalRef.current);
                demoIntervalRef.current = null;
            }
        }
        return () => {
            if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
        };
    }, [isDemoMode, inventory, drainStock]);

    // --- Auto-Trigger Missions on Critical Stock ---
    const triggerAutoReorder = useCallback(
        (item: InventoryItem) => {
            if (triggeredRef.current.has(item.id)) return;
            triggeredRef.current.add(item.id);

            addNotification({
                id: `notif_${Date.now()}_${item.id}`,
                type: "alert",
                title: `⚠️ Stock Critical: ${item.name}`,
                message: `Only ${item.currentStock} ${item.unit} remaining (threshold: ${item.threshold}). Auto-reorder mission launching...`,
                agent: "inventory_monitor",
                read: false,
                actionUrl: "/dashboard/missions",
                timestamp: new Date().toISOString(),
            });

            addAgentActivity({
                agent: "orchestrator",
                message: `📦 Auto-reorder triggered for ${item.name} (${item.currentStock}/${item.threshold} ${item.unit})`,
                timestamp: new Date().toISOString(),
            });

            launchMission(
                `URGENT AUTO-REORDER: Purchase ${item.maxStock - item.currentStock} ${item.unit} of ${item.name} (${item.category}). Current stock: ${item.currentStock}, threshold: ${item.threshold}. Priority: HIGH.`
            );
        },
        [addNotification, addAgentActivity, launchMission]
    );

    useEffect(() => {
        inventory.forEach((item) => {
            if (
                item.autoReorder &&
                item.status === "critical" &&
                item.currentStock <= item.threshold * 0.5 &&
                !triggeredRef.current.has(item.id)
            ) {
                triggerAutoReorder(item);
            }
        });
    }, [inventory, triggerAutoReorder]);

    // --- Stats ---
    const criticalCount = inventory.filter((i) => i.status === "critical").length;
    const lowCount = inventory.filter((i) => i.status === "low").length;
    const healthyCount = inventory.filter((i) => i.status === "healthy").length;
    const totalItems = inventory.length;

    const filtered = filterStatus === "all" ? inventory : inventory.filter((i) => i.status === filterStatus);

    // Chart data
    const chartData = inventory.map((item) => ({
        name: item.name.split(" ").slice(0, 2).join(" "),
        stock: item.currentStock,
        threshold: item.threshold,
        max: item.maxStock,
        status: item.status,
    }));

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <Package className="w-7 h-7 text-accent-blue" />
                        Inventory Monitor
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Real-time stock levels with autonomous reorder triggers
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            triggeredRef.current.clear();
                            inventory.forEach((item) => restockItem(item.id, item.maxStock));
                            addNotification({
                                id: `notif_restock_${Date.now()}`,
                                type: "success",
                                title: "🔄 All Stock Restored",
                                message: "Inventory reset to maximum levels",
                                agent: "inventory_monitor",
                                read: false,
                                timestamp: new Date().toISOString(),
                            });
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl border border-border-secondary hover:border-accent-emerald/30 text-text-secondary hover:text-accent-emerald transition-all"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Stock
                    </button>
                    <button
                        onClick={() => (isDemoMode ? stopDemoMode() : startDemoMode())}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all ${isDemoMode
                            ? "bg-accent-rose/20 text-accent-rose border border-accent-rose/30 hover:bg-accent-rose/30"
                            : "bg-accent-blue text-white hover:bg-accent-blue/80"
                            }`}
                    >
                        {isDemoMode ? (
                            <>
                                <Square className="w-3.5 h-3.5" />
                                Stop Simulation
                            </>
                        ) : (
                            <>
                                <Play className="w-3.5 h-3.5" />
                                Simulate Stock Drain
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Demo Mode Banner */}
            <AnimatePresence>
                {isDemoMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-accent-rose/30 bg-accent-rose/5 p-4 flex items-center gap-3"
                    >
                        <div className="w-3 h-3 rounded-full bg-accent-rose animate-pulse-dot" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-accent-rose">🔴 Live Simulation Active</p>
                            <p className="text-xs text-text-secondary">
                                Stock is draining at accelerated rates. Agents will auto-trigger reorder missions when items hit critical levels.
                            </p>
                        </div>
                        <Zap className="w-5 h-5 text-accent-rose animate-pulse" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Items", value: totalItems, icon: Package, color: "text-accent-blue" },
                    { label: "Critical", value: criticalCount, icon: AlertTriangle, color: "text-accent-rose" },
                    { label: "Low Stock", value: lowCount, icon: TrendingDown, color: "text-accent-amber" },
                    { label: "Healthy", value: healthyCount, icon: CheckCircle, color: "text-accent-emerald" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
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

            {/* Filter Bar */}
            <div className="flex items-center gap-2">
                {["all", "critical", "low", "healthy", "overstock"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all capitalize ${filterStatus === s
                            ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                            : "border-border-secondary text-text-muted hover:text-text-primary"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Stock Level Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="chart-container"
            >
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-accent-blue" />
                    Stock Levels vs Thresholds
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                        <Tooltip
                            contentStyle={{ background: "rgba(26,31,53,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", color: "#f1f5f9" }}
                        />
                        <Bar dataKey="stock" name="Current Stock" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.barColor || "#6366f1"} />
                            ))}
                        </Bar>
                        <Bar dataKey="threshold" name="Threshold" fill="rgba(244,63,94,0.3)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Inventory Heatmap / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {filtered.map((item, i) => {
                        const config = STATUS_CONFIG[item.status];
                        const fillPercent = Math.round((item.currentStock / item.maxStock) * 100);
                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.03 }}
                                className={`glass-card p-5 border ${config.border} relative overflow-hidden`}
                            >
                                {/* Status badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                        {config.label}
                                    </span>
                                    <span className="text-xs text-text-muted">{item.category}</span>
                                </div>

                                {/* Item name */}
                                <h3 className="text-sm font-semibold text-text-primary mb-3 truncate">{item.name}</h3>

                                {/* Stock bar */}
                                <div className="mb-3">
                                    <div className="flex items-end justify-between mb-1">
                                        <span className="text-2xl font-bold text-text-primary">{item.currentStock}</span>
                                        <span className="text-xs text-text-muted">/ {item.maxStock} {item.unit}</span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-bg-primary/50 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: config.barColor }}
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${fillPercent}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className={`text-[10px] ${config.color}`}>{fillPercent}% filled</span>
                                        <span className="text-[10px] text-text-muted">Threshold: {item.threshold}</span>
                                    </div>
                                </div>

                                {/* Meta info */}
                                <div className="flex items-center justify-between text-xs text-text-muted">
                                    <span className="flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3" />
                                        {item.burnRate}/day
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.daysUntilEmpty !== null ? `${item.daysUntilEmpty}d left` : "∞"}
                                    </span>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => drainStock(item.id, Math.max(1, Math.round(item.burnRate)))}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-lg border border-accent-rose/20 text-accent-rose hover:bg-accent-rose/10 transition-all"
                                    >
                                        <ArrowDown className="w-3 h-3" />
                                        Drain
                                    </button>
                                    <button
                                        onClick={() => restockItem(item.id, Math.round(item.maxStock * 0.5))}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-lg border border-accent-emerald/20 text-accent-emerald hover:bg-accent-emerald/10 transition-all"
                                    >
                                        <ArrowUp className="w-3 h-3" />
                                        Restock
                                    </button>
                                </div>

                                {/* Auto-reorder indicator */}
                                {item.autoReorder && (
                                    <div className="absolute top-3 right-3" title="Auto-reorder enabled">
                                        <Zap className={`w-3 h-3 ${item.status === "critical" ? "text-accent-rose animate-pulse" : "text-text-muted"}`} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
