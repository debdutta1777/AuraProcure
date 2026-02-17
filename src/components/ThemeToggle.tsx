"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl border border-border-secondary hover:border-accent-blue/30 bg-bg-primary/50 transition-all group"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait">
                {theme === "dark" ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="w-4 h-4 text-accent-amber" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="w-4 h-4 text-accent-blue" />
                    </motion.div>
                )}
            </AnimatePresence>
            {!compact && (
                <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                    {theme === "dark" ? "Light" : "Dark"}
                </span>
            )}
        </button>
    );
}
