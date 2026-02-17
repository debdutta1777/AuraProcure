"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import {
    Zap,
    Target,
    ShieldCheck,
    FileText,
    BarChart3,
    MessageSquare,
    ClipboardList,
    Settings,
    Package,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Command Center", icon: Zap },
    { href: "/dashboard/missions", label: "Mission Log", icon: Target },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/inventory", label: "Inventory Monitor", icon: Package },
    { href: "/dashboard/chat", label: "Agent Chat", icon: MessageSquare },
    { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck },
    { href: "/dashboard/documents", label: "Document Vault", icon: FileText },
    { href: "/dashboard/audit", label: "Audit Trail", icon: ClipboardList },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar-desktop w-64 h-screen sticky top-0 bg-bg-secondary/80 backdrop-blur-xl border-r border-border-secondary flex flex-col transition-colors duration-300">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-border-secondary">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-text-primary tracking-tight">
                            Aura<span className="gradient-text">Procure</span>
                        </h1>
                        <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">
                            AI Procurement
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                    Platform
                </p>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "nav-active text-accent-blue"
                                            : "text-text-secondary hover:text-text-primary hover:bg-bg-card/50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 w-[3px] h-5 bg-accent-blue rounded-r-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-6 px-3">
                    <p className="mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                        Settings
                    </p>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card/50 transition-all"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                </div>
            </nav>

            {/* Bottom actions */}
            <div className="px-4 py-4 border-t border-border-secondary space-y-3">
                <div className="flex items-center justify-between px-1">
                    <ThemeToggle />
                    <NotificationBell />
                </div>
                <div className="flex items-center gap-3 px-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-xs font-bold">
                        PM
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                            Proc. Manager
                        </p>
                        <p className="text-[10px] text-text-muted">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
