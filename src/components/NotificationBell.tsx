"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Bell, Check, X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

const ICON_MAP = {
    alert: AlertTriangle,
    success: CheckCircle,
    info: Info,
    warning: AlertCircle,
};

const COLOR_MAP = {
    alert: "text-accent-rose",
    success: "text-accent-emerald",
    info: "text-accent-blue",
    warning: "text-accent-amber",
};

export default function NotificationBell() {
    const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppStore();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-bg-card transition-colors"
                title="Notifications"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-accent-amber" : "text-text-muted"}`} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-auto rounded-2xl border border-border-secondary bg-bg-surface shadow-xl z-50"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-bg-surface border-b border-border-secondary p-3 flex items-center justify-between z-10">
                            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllNotificationsRead}
                                        className="text-[10px] text-accent-blue hover:underline px-2 py-1"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => { clearNotifications(); setOpen(false); }}
                                        className="p-1 rounded hover:bg-bg-card transition-colors"
                                        title="Clear all"
                                    >
                                        <X className="w-3.5 h-3.5 text-text-muted" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-text-muted text-xs">
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-border-secondary/50">
                                {notifications.slice(0, 20).map((n) => {
                                    const Icon = ICON_MAP[n.type];
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => markNotificationRead(n.id)}
                                            className={`p-3 flex gap-3 cursor-pointer hover:bg-bg-card/50 transition-colors ${!n.read ? "bg-accent-blue/5" : ""
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${COLOR_MAP[n.type]}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium ${n.read ? "text-text-secondary" : "text-text-primary"}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {n.agent && (
                                                        <span className="text-[9px] text-accent-blue px-1.5 py-0.5 rounded bg-accent-blue/10">
                                                            {typeof n.agent === "string" ? n.agent.replace("_", " ") : n.agent}
                                                        </span>
                                                    )}
                                                    <span className="text-[9px] text-text-muted">
                                                        {new Date(n.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {!n.read && (
                                                <span className="w-2 h-2 rounded-full bg-accent-blue shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
