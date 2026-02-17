"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Plus,
    X,
    ToggleLeft,
    ToggleRight,
    Trash2,
    Building2,
    Star,
    Globe,
    Mail,
    Check,
    AlertTriangle,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Policy, Vendor } from "@/lib/agents/types";

export default function CompliancePage() {
    const { policies, addPolicy, removePolicy, updatePolicy, vendors, addVendor, removeVendor, updateVendor } = useAppStore();
    const [showPolicyForm, setShowPolicyForm] = useState(false);
    const [showVendorForm, setShowVendorForm] = useState(false);
    const [activeTab, setActiveTab] = useState<"policies" | "vendors">("policies");

    // Policy form state
    const [policyName, setPolicyName] = useState("");
    const [policyDesc, setPolicyDesc] = useState("");
    const [policyCategory, setPolicyCategory] = useState("general");
    const [policyRule, setPolicyRule] = useState("");
    const [policyThreshold, setPolicyThreshold] = useState("");

    // Vendor form state
    const [vendorName, setVendorName] = useState("");
    const [vendorWebsite, setVendorWebsite] = useState("");
    const [vendorCategory, setVendorCategory] = useState("IT Hardware");
    const [vendorEmail, setVendorEmail] = useState("");

    function handleAddPolicy() {
        if (!policyName || !policyRule) return;
        addPolicy({
            id: generateId(),
            name: policyName,
            description: policyDesc,
            category: policyCategory,
            rule_text: policyRule,
            threshold_amount: policyThreshold ? parseFloat(policyThreshold) : null,
            is_active: true,
            created_at: new Date().toISOString(),
        });
        setPolicyName(""); setPolicyDesc(""); setPolicyRule(""); setPolicyThreshold("");
        setShowPolicyForm(false);
    }

    function handleAddVendor() {
        if (!vendorName) return;
        addVendor({
            id: generateId(),
            name: vendorName,
            website: vendorWebsite,
            category: vendorCategory,
            is_whitelisted: true,
            rating: 4.0,
            contact_email: vendorEmail || null,
            notes: null,
            created_at: new Date().toISOString(),
        });
        setVendorName(""); setVendorWebsite(""); setVendorEmail("");
        setShowVendorForm(false);
    }

    const categories = [
        { value: "sourcing", label: "Sourcing" },
        { value: "budget", label: "Budget" },
        { value: "vendor", label: "Vendor" },
        { value: "sustainability", label: "Sustainability" },
        { value: "logistics", label: "Logistics" },
        { value: "general", label: "General" },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-accent-emerald" />
                    <span className="text-sm text-text-muted">Compliance & Governance</span>
                </div>
                <h1 className="text-3xl font-bold text-text-primary">Policy Manager</h1>
                <p className="text-text-secondary mt-1">
                    Define guardrails and manage the vendor whitelist for your AI agents
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {(["policies", "vendors"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                            activeTab === tab
                                ? "bg-accent-blue/15 border-accent-blue/30 text-accent-blue"
                                : "bg-bg-card border-border-secondary text-text-muted hover:text-text-secondary"
                        )}
                    >
                        {tab === "policies" ? `📜 Policies (${policies.length})` : `🏢 Vendors (${vendors.length})`}
                    </button>
                ))}
            </div>

            {/* Policies Tab */}
            {activeTab === "policies" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Procurement Guardrails</h2>
                        <button
                            onClick={() => setShowPolicyForm(!showPolicyForm)}
                            className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-accent-blue/20 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Rule
                        </button>
                    </div>

                    {/* Add Policy Form */}
                    <AnimatePresence>
                        {showPolicyForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-card p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">New Compliance Rule</h3>
                                        <button onClick={() => setShowPolicyForm(false)}>
                                            <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Rule Name</label>
                                            <input
                                                value={policyName}
                                                onChange={(e) => setPolicyName(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                                placeholder="e.g., Maximum Single Purchase"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Category</label>
                                            <select
                                                value={policyCategory}
                                                onChange={(e) => setPolicyCategory(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                            >
                                                {categories.map((c) => (
                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-text-muted block mb-1">Description</label>
                                        <input
                                            value={policyDesc}
                                            onChange={(e) => setPolicyDesc(e.target.value)}
                                            className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                            placeholder="Brief description of this rule"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-xs text-text-muted block mb-1">Rule Text</label>
                                            <textarea
                                                value={policyRule}
                                                onChange={(e) => setPolicyRule(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary h-20 resize-none"
                                                placeholder="e.g., Total procurement must not exceed $100,000"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Threshold ($)</label>
                                            <input
                                                type="number"
                                                value={policyThreshold}
                                                onChange={(e) => setPolicyThreshold(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                                placeholder="e.g., 50000"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddPolicy}
                                        disabled={!policyName || !policyRule}
                                        className="px-6 py-2.5 bg-accent-emerald rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                        Save Rule
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Policy List */}
                    <div className="space-y-3">
                        {policies.map((policy, i) => (
                            <motion.div
                                key={policy.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase",
                                                    policy.category === "budget"
                                                        ? "bg-accent-amber/10 text-accent-amber"
                                                        : policy.category === "sourcing"
                                                            ? "bg-accent-cyan/10 text-accent-cyan"
                                                            : policy.category === "vendor"
                                                                ? "bg-accent-purple/10 text-accent-purple"
                                                                : "bg-accent-blue/10 text-accent-blue"
                                                )}
                                            >
                                                {policy.category}
                                            </span>
                                            {policy.threshold_amount && (
                                                <span className="text-[10px] text-text-muted">
                                                    Threshold: ${policy.threshold_amount.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-text-primary">{policy.name}</p>
                                        <p className="text-xs text-text-secondary mt-1">{policy.rule_text}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => updatePolicy(policy.id, { is_active: !policy.is_active })}
                                            className="transition-colors"
                                            title={policy.is_active ? "Disable" : "Enable"}
                                        >
                                            {policy.is_active ? (
                                                <ToggleRight className="w-7 h-7 text-accent-emerald" />
                                            ) : (
                                                <ToggleLeft className="w-7 h-7 text-text-muted" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => removePolicy(policy.id)}
                                            className="text-text-muted hover:text-accent-rose transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vendors Tab */}
            {activeTab === "vendors" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Vendor Whitelist</h2>
                        <button
                            onClick={() => setShowVendorForm(!showVendorForm)}
                            className="px-4 py-2 bg-gradient-to-r from-accent-emerald to-accent-cyan rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Vendor
                        </button>
                    </div>

                    {/* Add Vendor Form */}
                    <AnimatePresence>
                        {showVendorForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="glass-card p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">Add New Vendor</h3>
                                        <button onClick={() => setShowVendorForm(false)}>
                                            <X className="w-4 h-4 text-text-muted hover:text-text-primary" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Vendor Name</label>
                                            <input
                                                value={vendorName}
                                                onChange={(e) => setVendorName(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                                placeholder="e.g., Acme Corp"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Category</label>
                                            <select
                                                value={vendorCategory}
                                                onChange={(e) => setVendorCategory(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                            >
                                                {["IT Hardware", "Office Supplies", "Software", "Networking", "Office Furniture", "General"].map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Website</label>
                                            <input
                                                value={vendorWebsite}
                                                onChange={(e) => setVendorWebsite(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Contact Email</label>
                                            <input
                                                value={vendorEmail}
                                                onChange={(e) => setVendorEmail(e.target.value)}
                                                className="w-full px-3 py-2 bg-bg-primary/50 border border-border-primary rounded-lg text-sm text-text-primary"
                                                placeholder="sales@vendor.com"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddVendor}
                                        disabled={!vendorName}
                                        className="px-6 py-2.5 bg-accent-emerald rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-40 transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                        Add Vendor
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Vendor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendors.map((vendor, i) => (
                            <motion.div
                                key={vendor.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-cyan/10 flex items-center justify-center border border-accent-blue/20">
                                            <Building2 className="w-5 h-5 text-accent-blue" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-primary">{vendor.name}</p>
                                            <p className="text-xs text-text-muted">{vendor.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                updateVendor(vendor.id, {
                                                    is_whitelisted: !vendor.is_whitelisted,
                                                })
                                            }
                                            className={cn(
                                                "text-[10px] px-2 py-1 rounded-full font-bold border transition-all",
                                                vendor.is_whitelisted
                                                    ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald"
                                                    : "bg-accent-amber/10 border-accent-amber/30 text-accent-amber"
                                            )}
                                        >
                                            {vendor.is_whitelisted ? "✓ Approved" : "⚠ Pending"}
                                        </button>
                                        <button
                                            onClick={() => removeVendor(vendor.id)}
                                            className="text-text-muted hover:text-accent-rose transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-text-muted">
                                    {vendor.website && (
                                        <span className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {vendor.website.replace("https://", "")}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-accent-amber" />
                                        {vendor.rating}
                                    </span>
                                    {vendor.contact_email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {vendor.contact_email}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
