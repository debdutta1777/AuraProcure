"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Download,
    Eye,
    X,
    Clock,
    Link2,
    FileSpreadsheet,
    FileCheck,
    FileBadge,
    FileSignature,
    Search,
} from "lucide-react";
import { cn, formatDate, timeAgo } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { DocumentType } from "@/lib/agents/types";

const typeConfig: Record<
    DocumentType,
    { label: string; icon: React.ElementType; color: string; bg: string }
> = {
    rfq: {
        label: "RFQ",
        icon: FileSpreadsheet,
        color: "text-accent-cyan",
        bg: "bg-accent-cyan/10 border-accent-cyan/20",
    },
    purchase_order: {
        label: "Purchase Order",
        icon: FileCheck,
        color: "text-accent-emerald",
        bg: "bg-accent-emerald/10 border-accent-emerald/20",
    },
    invoice: {
        label: "Invoice",
        icon: FileBadge,
        color: "text-accent-amber",
        bg: "bg-accent-amber/10 border-accent-amber/20",
    },
    contract_summary: {
        label: "Contract Summary",
        icon: FileSignature,
        color: "text-accent-purple",
        bg: "bg-accent-purple/10 border-accent-purple/20",
    },
};

export default function DocumentsPage() {
    const { documents, missions } = useAppStore();
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>("all");
    const [search, setSearch] = useState("");

    const activeDoc = documents.find((d) => d.id === selectedDoc);

    const filteredDocs = documents
        .filter((d) => filterType === "all" || d.type === filterType)
        .filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));

    const typeFilters = [
        { label: "All", value: "all", count: documents.length },
        { label: "RFQ", value: "rfq", count: documents.filter((d) => d.type === "rfq").length },
        { label: "PO", value: "purchase_order", count: documents.filter((d) => d.type === "purchase_order").length },
        { label: "Contract", value: "contract_summary", count: documents.filter((d) => d.type === "contract_summary").length },
        { label: "Invoice", value: "invoice", count: documents.filter((d) => d.type === "invoice").length },
    ];

    function handleDownload(content: string, title: string) {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="animate-slide-up">
                <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-accent-amber" />
                    <span className="text-sm text-text-muted">Auto-Generated Documents</span>
                </div>
                <h1 className="text-3xl font-bold text-text-primary">Document Vault</h1>
                <p className="text-text-secondary mt-1">
                    Professional procurement documents with full audit trails
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
                        placeholder="Search documents..."
                        className="w-full pl-11 pr-4 py-2.5 bg-bg-card border border-border-primary rounded-xl text-sm text-text-primary placeholder:text-text-muted"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {typeFilters.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilterType(f.value)}
                            className={cn(
                                "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                                filterType === f.value
                                    ? "bg-accent-blue/15 border-accent-blue/30 text-accent-blue"
                                    : "bg-bg-card border-border-secondary text-text-muted hover:text-text-secondary"
                            )}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map((doc, i) => {
                    const config = typeConfig[doc.type];
                    const Icon = config.icon;
                    const mission = missions.find((m) => m.id === doc.mission_id);

                    return (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-5 cursor-pointer hover:border-accent-blue/30 transition-all group"
                            onClick={() => setSelectedDoc(doc.id)}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                                        config.bg
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", config.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span
                                        className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border",
                                            config.bg,
                                            config.color
                                        )}
                                    >
                                        {config.label}
                                    </span>
                                    <p className="font-medium text-text-primary mt-1.5 text-sm truncate group-hover:text-accent-blue transition-colors">
                                        {doc.title}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-secondary">
                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                    <Clock className="w-3 h-3" />
                                    {timeAgo(doc.created_at)}
                                </div>
                                {mission && (
                                    <div className="flex items-center gap-1 text-xs text-text-muted">
                                        <Link2 className="w-3 h-3" />
                                        Mission
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filteredDocs.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <p className="text-text-secondary">No documents found</p>
                    <p className="text-xs text-text-muted mt-1">
                        Documents are automatically generated when missions complete
                    </p>
                </div>
            )}

            {/* Document Preview Modal */}
            <AnimatePresence>
                {activeDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                        onClick={() => setSelectedDoc(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-bg-secondary border border-border-primary rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-border-secondary">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const config = typeConfig[activeDoc.type];
                                        const DocIcon = config.icon;
                                        return (
                                            <>
                                                <div
                                                    className={cn(
                                                        "w-9 h-9 rounded-lg flex items-center justify-center border",
                                                        config.bg
                                                    )}
                                                >
                                                    <DocIcon className={cn("w-4 h-4", config.color)} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-text-primary text-sm">
                                                        {activeDoc.title}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        {formatDate(activeDoc.created_at)}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(activeDoc.content, activeDoc.title)}
                                        className="px-3 py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-accent-blue text-xs font-semibold flex items-center gap-1 hover:bg-accent-blue/20 transition-all"
                                    >
                                        <Download className="w-3 h-3" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => setSelectedDoc(null)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-text-muted" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                                <pre className="whitespace-pre-wrap text-sm text-text-secondary font-mono leading-relaxed">
                                    {activeDoc.content}
                                </pre>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
