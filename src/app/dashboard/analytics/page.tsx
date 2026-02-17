"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Clock,
    ShieldCheck,
    ArrowUpRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import { useMemo } from "react";

const COLORS = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e", "#a855f7"];

// Generate monthly spending data from missions
function generateMonthlyData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, i) => ({
        month,
        spending: Math.round(15000 + Math.random() * 35000),
        savings: Math.round(2000 + Math.random() * 8000),
        forecast: i > 8 ? Math.round(20000 + Math.random() * 25000) : undefined,
    }));
}

export default function AnalyticsPage() {
    const { missions, quotes, policies, documents, vendors } = useAppStore();

    const monthlyData = useMemo(() => generateMonthlyData(), []);

    const categoryData = useMemo(() => [
        { name: "IT Hardware", value: 45, amount: 125000 },
        { name: "Software", value: 20, amount: 55000 },
        { name: "Office Supplies", value: 15, amount: 42000 },
        { name: "Services", value: 12, amount: 33000 },
        { name: "Furniture", value: 8, amount: 22000 },
    ], []);

    const vendorPerformance = useMemo(() =>
        vendors.slice(0, 5).map((v) => ({
            name: v.name.split(" ").slice(0, 2).join(" "),
            orders: Math.floor(Math.random() * 30) + 5,
            onTime: Math.floor(Math.random() * 20) + 80,
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            avgSaving: Math.floor(Math.random() * 15) + 5,
        })), [vendors]);

    const totalSpending = monthlyData.reduce((sum, d) => sum + d.spending, 0);
    const totalSavings = monthlyData.reduce((sum, d) => sum + d.savings, 0);
    const complianceRate = Math.round(
        (missions.filter((m) => m.status === "completed").length / Math.max(missions.length, 1)) * 100
    );

    const kpis = [
        { label: "Total Spending", value: `$${(totalSpending / 1000).toFixed(0)}K`, change: "+12%", trend: "up", icon: DollarSign, color: "text-accent-blue" },
        { label: "Total Savings", value: `$${(totalSavings / 1000).toFixed(0)}K`, change: "+23%", trend: "up", icon: TrendingUp, color: "text-accent-emerald" },
        { label: "Missions", value: missions.length, change: `${documents.length} docs`, trend: "up", icon: Package, color: "text-accent-cyan" },
        { label: "Compliance Rate", value: `${complianceRate}%`, change: `${policies.filter(p => p.is_active).length} policies`, trend: "up", icon: ShieldCheck, color: "text-accent-amber" },
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <BarChart3 className="w-7 h-7 text-accent-blue" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Spending insights, vendor performance, and budget forecasting
                    </p>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 kpi-grid">
                {kpis.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                            <span className="flex items-center gap-1 text-xs text-accent-emerald">
                                {kpi.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {kpi.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-text-primary">{kpi.value}</p>
                        <p className="text-xs text-text-muted mt-1">{kpi.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spending Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 chart-container"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-accent-blue" />
                            Spending Trends & Forecast
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-blue" /> Spending</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-emerald" /> Savings</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-amber opacity-50" /> Forecast</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                            <Tooltip
                                contentStyle={{ background: "rgba(26,31,53,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", color: "#f1f5f9" }}
                                formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`]}
                            />
                            <Area type="monotone" dataKey="spending" stroke="#6366f1" fill="url(#colorSpending)" strokeWidth={2} />
                            <Area type="monotone" dataKey="savings" stroke="#10b981" fill="url(#colorSavings)" strokeWidth={2} />
                            <Area type="monotone" dataKey="forecast" stroke="#f59e0b" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="chart-container"
                >
                    <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                        <Package className="w-4 h-4 text-accent-cyan" />
                        By Category
                    </h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {categoryData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: "rgba(26,31,53,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", color: "#f1f5f9" }}
                                formatter={(value: unknown, name: unknown) => [`${value}%`, String(name)]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                        {categoryData.map((cat, i) => (
                            <div key={cat.name} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 text-text-secondary">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                                    {cat.name}
                                </span>
                                <span className="text-text-primary font-medium">${(cat.amount / 1000).toFixed(0)}K</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vendor Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="chart-container"
                >
                    <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                        <BarChart3 className="w-4 h-4 text-accent-purple" />
                        Vendor Performance
                    </h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={vendorPerformance} barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: "rgba(26,31,53,0.95)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px", color: "#f1f5f9" }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} name="Orders" />
                            <Bar dataKey="onTime" fill="#10b981" radius={[4, 4, 0, 0]} name="On-Time %" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Vendor Ratings Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="chart-container"
                >
                    <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-accent-amber" />
                        Vendor Ratings & Savings
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-text-muted text-xs border-b border-border-secondary">
                                    <th className="text-left py-2 px-2 font-medium">Vendor</th>
                                    <th className="text-center py-2 px-2 font-medium">Rating</th>
                                    <th className="text-center py-2 px-2 font-medium">Orders</th>
                                    <th className="text-center py-2 px-2 font-medium">On-Time</th>
                                    <th className="text-right py-2 px-2 font-medium">Avg Saving</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendorPerformance.map((v) => (
                                    <tr key={v.name} className="border-b border-border-secondary/50 hover:bg-bg-card/50 transition-colors">
                                        <td className="py-3 px-2 text-text-primary font-medium">{v.name}</td>
                                        <td className="py-3 px-2 text-center">
                                            <span className="text-accent-amber">{"★".repeat(Math.round(parseFloat(v.rating)))}</span>
                                            <span className="text-text-muted ml-1 text-xs">{v.rating}</span>
                                        </td>
                                        <td className="py-3 px-2 text-center text-text-secondary">{v.orders}</td>
                                        <td className="py-3 px-2 text-center">
                                            <span className={v.onTime >= 90 ? "text-accent-emerald" : "text-accent-amber"}>{v.onTime}%</span>
                                        </td>
                                        <td className="py-3 px-2 text-right text-accent-emerald font-medium">{v.avgSaving}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
