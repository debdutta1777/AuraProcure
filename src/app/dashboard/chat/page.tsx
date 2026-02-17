"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
    MessageSquare,
    Send,
    Bot,
    User,
    Loader2,
    Zap,
    Sparkles,
    RefreshCw,
} from "lucide-react";

interface ChatMessage {
    id: string;
    role: "user" | "agent";
    content: string;
    agent?: string;
    timestamp: string;
    loading?: boolean;
}

const SUGGESTIONS = [
    "Find me 50 laptops under $1200 each for the engineering team",
    "What's the cheapest option for 200 office chairs?",
    "Compare vendors for bulk paper and toner supplies",
    "Draft an RFQ for 100 monitors with USB-C",
    "Check if ordering $80,000 of servers complies with our policies",
];

export default function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "agent",
            content: "Hello! I'm the AuraProcure AI Assistant, powered by your team of specialized agents. I can help you:\n\n• **Find and compare** vendor quotes\n• **Check compliance** against your policies\n• **Draft documents** like POs and RFQs\n• **Analyze spending** patterns\n\nJust describe what you need in plain language!",
            agent: "orchestrator",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { policies, vendors } = useAppStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        const loadingMessage: ChatMessage = {
            id: `loading_${Date.now()}`,
            role: "agent",
            content: "",
            agent: "orchestrator",
            timestamp: new Date().toISOString(),
            loading: true,
        };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/agents/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: messages.filter((m) => !m.loading).map((m) => ({
                        role: m.role === "user" ? "user" : "model",
                        content: m.content,
                    })),
                    policies: policies.filter((p) => p.is_active),
                    vendors: vendors.map((v) => v.name),
                }),
            });

            const data = await res.json();

            setMessages((prev) =>
                prev.map((m) =>
                    m.loading
                        ? {
                            ...m,
                            content: data.response || "I encountered an issue processing your request. Please try again.",
                            loading: false,
                            agent: data.agent || "orchestrator",
                        }
                        : m
                )
            );
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.loading
                        ? {
                            ...m,
                            content: "Sorry, I couldn't process your request. Please check your connection and try again.",
                            loading: false,
                        }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] p-4 md:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <MessageSquare className="w-7 h-7 text-accent-blue" />
                        Agent Chat
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Converse with your procurement AI agents
                    </p>
                </div>
                <button
                    onClick={() =>
                        setMessages([
                            {
                                id: "welcome",
                                role: "agent",
                                content: "Chat cleared! How can I help you with procurement today?",
                                agent: "orchestrator",
                                timestamp: new Date().toISOString(),
                            },
                        ])
                    }
                    className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary rounded-lg border border-border-secondary hover:border-accent-blue/30 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New Chat
                </button>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "agent" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[75%] px-4 py-3 ${msg.role === "user"
                                        ? "chat-bubble-user"
                                        : "chat-bubble-agent"
                                    }`}
                            >
                                {msg.loading ? (
                                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-accent-blue" />
                                        <span>Thinking</span>
                                        <span className="animate-blink">...</span>
                                    </div>
                                ) : (
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {msg.content.split("**").map((part, i) =>
                                            i % 2 === 1 ? (
                                                <strong key={i} className="font-semibold">{part}</strong>
                                            ) : (
                                                <span key={i}>{part}</span>
                                            )
                                        )}
                                    </div>
                                )}
                                {msg.role === "agent" && !msg.loading && msg.agent && (
                                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-text-muted">
                                        <Sparkles className="w-3 h-3" />
                                        <span className={`agent-${msg.agent} font-medium`}>{msg.agent.replace("_", " ")}</span>
                                    </div>
                                )}
                            </div>
                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-rose flex items-center justify-center flex-shrink-0 mt-1">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 mb-3"
                >
                    {SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setInput(s);
                                inputRef.current?.focus();
                            }}
                            className="text-xs px-3 py-1.5 rounded-full border border-border-secondary text-text-secondary hover:text-accent-blue hover:border-accent-blue/30 transition-all"
                        >
                            {s.length > 45 ? s.slice(0, 45) + "..." : s}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Input */}
            <div className="glass-card p-3 flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent-blue flex-shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask your procurement AI agents anything..."
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                    disabled={isLoading}
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 rounded-xl bg-accent-blue hover:bg-accent-blue/80 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4 text-white" />
                </button>
            </div>
        </div>
    );
}
