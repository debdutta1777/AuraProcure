"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import {
    Settings,
    Sun,
    Moon,
    Key,
    Bell,
    Globe,
    Shield,
    Database,
    Palette,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState("en");
    const [autoApproveLimit, setAutoApproveLimit] = useState("5000");

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                    <Settings className="w-7 h-7 text-accent-blue" />
                    Settings
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                    Configure your AuraProcure platform
                </p>
            </motion.div>

            {/* Appearance */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
            >
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                    <Palette className="w-4 h-4 text-accent-purple" />
                    Appearance
                </h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-text-secondary mb-3">Choose your theme</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setTheme("dark")}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === "dark"
                                        ? "border-accent-blue bg-accent-blue/10"
                                        : "border-border-secondary hover:border-border-primary"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Moon className="w-5 h-5 text-accent-blue" />
                                    <span className="text-sm font-medium text-text-primary">Dark Mode</span>
                                </div>
                                <div className="w-full h-16 rounded-lg bg-[#0a0e1a] border border-[#1a1f35] flex items-end p-2 gap-1">
                                    <div className="w-1/4 h-full rounded bg-[#1a1f35]" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-2 rounded bg-[#222845] w-3/4" />
                                        <div className="h-2 rounded bg-[#222845] w-1/2" />
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => setTheme("light")}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all ${theme === "light"
                                        ? "border-accent-blue bg-accent-blue/10"
                                        : "border-border-secondary hover:border-border-primary"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Sun className="w-5 h-5 text-accent-amber" />
                                    <span className="text-sm font-medium text-text-primary">Light Mode</span>
                                </div>
                                <div className="w-full h-16 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] flex items-end p-2 gap-1">
                                    <div className="w-1/4 h-full rounded bg-[#f1f5f9]" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-2 rounded bg-[#e2e8f0] w-3/4" />
                                        <div className="h-2 rounded bg-[#e2e8f0] w-1/2" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* API Configuration */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
            >
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-accent-amber" />
                    API Configuration
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-text-secondary block mb-2">Gemini API Key</label>
                        <input
                            type="password"
                            value="••••••••••••••••"
                            readOnly
                            className="w-full bg-bg-input text-sm text-text-primary px-3 py-2.5 rounded-xl border border-border-secondary"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Configured via .env.local — restart server after changes
                        </p>
                    </div>
                    <div>
                        <label className="text-sm text-text-secondary block mb-2">Supabase URL</label>
                        <input
                            type="text"
                            value="Not configured"
                            readOnly
                            className="w-full bg-bg-input text-sm text-text-muted px-3 py-2.5 rounded-xl border border-border-secondary"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Procurement Settings */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
            >
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-accent-emerald" />
                    Procurement Settings
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-text-secondary block mb-2">Auto-Approve Limit ($)</label>
                        <input
                            type="number"
                            value={autoApproveLimit}
                            onChange={(e) => setAutoApproveLimit(e.target.value)}
                            className="w-full bg-bg-input text-sm text-text-primary px-3 py-2.5 rounded-xl border border-border-secondary"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Orders below this amount are auto-approved without human review
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-primary">Email Notifications</p>
                            <p className="text-xs text-text-muted">Get notified on new approvals</p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-11 h-6 rounded-full transition-all relative ${notifications ? "bg-accent-blue" : "bg-bg-card"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${notifications ? "left-5.5" : "left-0.5"
                                    }`}
                                style={{ left: notifications ? "22px" : "2px" }}
                            />
                        </button>
                    </div>
                    <div>
                        <label className="text-sm text-text-secondary block mb-2">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-bg-input text-sm text-text-primary px-3 py-2.5 rounded-xl border border-border-secondary"
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="ja">Japanese</option>
                            <option value="zh">Chinese</option>
                        </select>
                        <p className="text-xs text-text-muted mt-1">
                            Gemini AI agents support multilingual procurement requests
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
            >
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                    <Database className="w-4 h-4 text-accent-cyan" />
                    Data Management
                </h2>
                <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-border-secondary hover:border-accent-blue/30 transition-all text-sm">
                        <span className="text-text-primary font-medium">Export All Data (CSV)</span>
                        <p className="text-xs text-text-muted mt-0.5">Download missions, quotes, and documents</p>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-border-secondary hover:border-accent-blue/30 transition-all text-sm">
                        <span className="text-text-primary font-medium">Import Procurement Requests (CSV)</span>
                        <p className="text-xs text-text-muted mt-0.5">Bulk upload procurement requests</p>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl border border-accent-rose/30 hover:border-accent-rose/50 transition-all text-sm">
                        <span className="text-accent-rose font-medium">Reset Demo Data</span>
                        <p className="text-xs text-text-muted mt-0.5">Clear all missions and restore seed data</p>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
