"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Bot,
  Search,
  ShieldCheck,
  FileText,
  UserCheck,
  ArrowRight,
  ChevronRight,
  Mic,
  Brain,
  Sparkles,
  Globe,
  Lock,
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle2,
  Play,
  Star,
  Shield,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const agents = [
  {
    name: "Lead Orchestrator",
    subtitle: "The Brain",
    description: "Interprets natural language requests and decomposes them into intelligent multi-step procurement workflows.",
    icon: Brain,
    color: "from-indigo-500 to-blue-600",
    textColor: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    features: ["Natural language understanding", "Task decomposition", "Workflow orchestration"],
  },
  {
    name: "Sourcing Scout",
    subtitle: "Agent A",
    description: "Searches vendor databases to find the best prices, availability, and shipping options with self-healing capabilities.",
    icon: Search,
    color: "from-cyan-500 to-teal-600",
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    features: ["Multi-vendor search", "Price comparison", "Self-healing on failures"],
  },
  {
    name: "Compliance Officer",
    subtitle: "Agent B",
    description: "Validates every decision against your internal policies, budgets, and vendor whitelists with full citation.",
    icon: ShieldCheck,
    color: "from-emerald-500 to-green-600",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    features: ["Policy enforcement", "Budget validation", "Deep-link citations"],
  },
  {
    name: "Document Drafter",
    subtitle: "Agent C",
    description: "Generates professional RFQs, Purchase Orders, and contract summaries automatically using AI.",
    icon: FileText,
    color: "from-amber-500 to-orange-600",
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    features: ["PDF generation", "RFQs & POs", "Contract summaries"],
  },
  {
    name: "HITL Bridge",
    subtitle: "Agent D",
    description: "Pauses workflows to request human approval before any financial action, keeping humans in control.",
    icon: UserCheck,
    color: "from-purple-500 to-violet-600",
    textColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    features: ["Approval workflows", "Spend thresholds", "Audit trail"],
  },
];

const features = [
  {
    icon: Mic,
    title: "Voice-to-Procurement",
    description: "Speak your request naturally. Our Whisper-powered voice AI handles the rest.",
    gradient: "from-rose-500/20 to-pink-500/10",
  },
  {
    icon: Shield,
    title: "Self-Healing Workflows",
    description: "If a vendor API goes down, agents automatically retry alternative sources without crashing.",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Live KPIs showing savings generated, cycle times, and agent success rates.",
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: Lock,
    title: "Enterprise Compliance",
    description: "Every decision is traced, cited, and validated against your internal policies.",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  {
    icon: Globe,
    title: "Multi-Vendor Intelligence",
    description: "Compare prices across multiple vendors with automated scoring and ranking.",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: Cpu,
    title: "Powered by GPT-4o",
    description: "Cutting-edge LLM reasoning for document generation, NLP parsing, and decision-making.",
    gradient: "from-purple-500/20 to-violet-500/10",
  },
];

const stats = [
  { label: "Faster Procurement", value: "10x", suffix: "" },
  { label: "Cost Savings", value: "35", suffix: "%" },
  { label: "Compliance Rate", value: "100", suffix: "%" },
  { label: "Documents Generated", value: "24/7", suffix: "" },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden">
      {/* Navbar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-bg-primary/80 backdrop-blur-xl border-b border-border-secondary shadow-lg shadow-black/10"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center glow-blue">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AuraProcure</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Agents</a>
            <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#architecture" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Architecture</a>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-xl text-white text-sm font-semibold hover:shadow-lg hover:shadow-accent-blue/25 transition-all flex items-center gap-2"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-cyan/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-purple/3 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Powered by Multi-Agent AI Architecture
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
          >
            Procurement on{" "}
            <span className="gradient-text">Autopilot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            AuraProcure deploys a team of specialized AI agents to source vendors,
            enforce compliance, draft documents, and manage approvals — all from a single
            natural language command.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-2xl text-white font-bold text-lg hover:shadow-xl hover:shadow-accent-blue/25 transition-all flex items-center gap-3 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Launch Command Center
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#agents"
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-text-secondary font-semibold text-lg hover:bg-white/10 hover:text-text-primary transition-all flex items-center gap-2"
            >
              <Bot className="w-5 h-5" />
              Meet the Agents
            </a>
          </motion.div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="glass-card p-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs text-text-muted">AuraProcure — Command Center</span>
              </div>
              <div className="bg-bg-primary/80 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-5 h-5 text-text-muted" />
                  <span className="text-text-secondary">
                    &quot;We need 50 high-end laptops for the dev team by Friday&quot;
                  </span>
                  <Mic className="w-5 h-5 text-accent-rose ml-auto" />
                </div>
                <div className="space-y-2">
                  {[
                    { agent: "Orchestrator", action: "Parsed: 50x High-End Laptop, IT Hardware", color: "text-indigo-400", done: true },
                    { agent: "Sourcing Scout", action: "Found 4 quotes — Best: TechDirect Pro @ $1,330/unit", color: "text-cyan-400", done: true },
                    { agent: "Compliance", action: "5/5 policies passed ✅", color: "text-emerald-400", done: true },
                    { agent: "HITL Bridge", action: "Approved by VP Engineering", color: "text-purple-400", done: true },
                    { agent: "Doc Drafter", action: "PO-2026-0214 generated → Document Vault", color: "text-amber-400", done: true },
                  ].map((step, i) => (
                    <motion.div
                      key={step.agent}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.2 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className={cn("w-4 h-4", step.color)} />
                      <span className={cn("font-semibold w-28", step.color)}>{step.agent}</span>
                      <span className="text-text-secondary text-xs">{step.action}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-accent-blue/10 via-accent-cyan/5 to-accent-purple/10 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 border-y border-border-secondary bg-bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl font-extrabold gradient-text">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-sm text-text-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Meet the Agents */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-accent-blue font-semibold uppercase tracking-wider">
              The Agent Team
            </span>
            <h2 className="text-4xl font-bold mt-3 mb-4">
              Five Specialized AI Agents
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Each agent has a unique role in the procurement pipeline. They communicate,
              collaborate, and self-heal — all orchestrated by the Lead Brain.
            </p>
          </motion.div>

          {/* Agent Architecture Visualization */}
          <div id="architecture" className="mb-16">
            <div className="flex flex-col items-center gap-4">
              {/* Orchestrator at top */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass-card p-6 max-w-md w-full text-center border-indigo-500/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-3 glow-blue">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-indigo-400">Lead Orchestrator</h3>
                <p className="text-xs text-text-muted mt-1">Interprets requests & manages all agents</p>
              </motion.div>

              {/* Connection lines */}
              <div className="flex items-center gap-2">
                <div className="w-px h-8 bg-gradient-to-b from-indigo-500/50 to-transparent" />
              </div>
              <div className="w-[70%] h-px bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />

              {/* Sub-agents row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
                {agents.slice(1).map((agent, i) => {
                  const Icon = agent.icon;
                  return (
                    <motion.div
                      key={agent.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className={cn("glass-card p-5 text-center", agent.borderColor)}
                    >
                      <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3", agent.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className={cn("font-bold text-sm", agent.textColor)}>{agent.name}</h4>
                      <p className="text-[11px] text-text-muted mt-1">{agent.subtitle}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Agent Detail Cards */}
          <div className="space-y-6">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={cn("glass-card p-6 flex flex-col md:flex-row items-start gap-6", agent.borderColor)}
                >
                  <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0", agent.color)}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={cn("text-xl font-bold", agent.textColor)}>{agent.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10">
                        {agent.subtitle}
                      </span>
                    </div>
                    <p className="text-text-secondary text-sm mb-4">{agent.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.features.map((f) => (
                        <span
                          key={f}
                          className={cn("text-xs px-3 py-1 rounded-lg border", agent.bgColor, agent.borderColor, agent.textColor)}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-accent-emerald font-semibold uppercase tracking-wider">
              Capabilities
            </span>
            <h2 className="text-4xl font-bold mt-3 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Built for scale, security, and speed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-6 group hover:border-accent-blue/30 transition-all"
                >
                  <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4", feature.gradient)}>
                    <Icon className="w-6 h-6 text-text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-accent-blue transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm text-accent-amber font-semibold uppercase tracking-wider">
              2026 Standard
            </span>
            <h2 className="text-4xl font-bold mt-3 mb-4">Modern Tech Stack</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Next.js 16", desc: "React Framework", icon: "⚡" },
              { name: "GPT-4o", desc: "LLM Reasoning", icon: "🧠" },
              { name: "Supabase", desc: "Postgres + Vector", icon: "🗄️" },
              { name: "TypeScript", desc: "Type Safety", icon: "📘" },
              { name: "Tailwind v4", desc: "Styling", icon: "🎨" },
              { name: "Zustand", desc: "State Management", icon: "📦" },
              { name: "Framer Motion", desc: "Animations", icon: "✨" },
              { name: "Whisper API", desc: "Voice Input", icon: "🎤" },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 text-center hover:border-accent-blue/30 transition-all"
              >
                <span className="text-2xl">{tech.icon}</span>
                <p className="font-semibold text-sm mt-2">{tech.name}</p>
                <p className="text-xs text-text-muted">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Transform Procurement?
              </h2>
              <p className="text-text-secondary mb-8 max-w-xl mx-auto">
                Deploy your AI agent team and go from request to purchase order in minutes, not weeks.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-accent-blue to-accent-cyan rounded-2xl text-white font-bold text-lg hover:shadow-xl hover:shadow-accent-blue/25 transition-all group"
              >
                <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Enter the Command Center
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border-secondary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-semibold gradient-text">AuraProcure</span>
            <span className="text-xs text-text-muted">© 2026</span>
          </div>
          <p className="text-xs text-text-muted">
            Agentic Universal Resource Automation — Built with Next.js, GPT-4o, and Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
