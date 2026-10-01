"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  ExternalLink,
  DollarSign,
  PieChart,
  GraduationCap,
  Compass,
  Layers,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  FileText,
  Database,
  Search,
  Building2,
  Calculator,
  ShieldAlert,
  ListChecks,
  Zap,
  CheckSquare,
  Activity
} from "lucide-react";
import { 
  api, 
  AIChatResponse,
  FinancialExplanationResponse,
  ScamExplanationResponse,
  BudgetRecommendationResponse,
  FinancialEducationResponse,
  PersonalizedGuidanceResponse,
  RAGQueryResponse,
  OfficialDocumentMetadata,
  RAGSourceCitation,
  AIAssistantUnifiedResponse
} from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  advisory?: string;
}

export const AIAssistantView: React.FC = () => {
  // Navigation Modes: Phase 13 Unified Assistant + RAG Knowledge Base + 5 Canonical Responsibilities + General Chat
  const [activeMode, setActiveMode] = useState<
    "assistant" | "chat" | "rag" | "finances" | "scam" | "budget" | "education" | "guidance"
  >("assistant");

  // 0. Phase 13: Unified AI Assistant (Financial Calc + RAG + Safety Engine -> Gemini)
  const [unifiedQuery, setUnifiedQuery] = useState("I received a message saying my KYC will expire. Is it safe?");
  const [unifiedChannel, setUnifiedChannel] = useState("sms");
  const [unifiedResult, setUnifiedResult] = useState<AIAssistantUnifiedResponse | null>(null);
  const [loadingUnified, setLoadingUnified] = useState(false);

  // 1. Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your **Defeat Scammer AI Assistant**, uniting our Financial Calculator, pgvector RAG Knowledge Base, and Safety Engine through Google Gemini. Ask me about suspicious KYC messages, phishing links, or financial math like loan EMIs and budget allocations.",
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  // 2. Financial Explanation State
  const [financeIncome, setFinanceIncome] = useState(30000);
  const [financeExpenses, setFinanceExpenses] = useState(21500);
  const [financeQuery, setFinanceQuery] = useState("Assess my burn rate and emergency buffer safety.");
  const [financeResult, setFinanceResult] = useState<FinancialExplanationResponse | null>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

  // 3. Scam Explanation State
  const [scamContent, setScamContent] = useState("Dear Consumer, Your electricity power supply will be disconnected tonight at 09:30 PM because your previous month bill was not updated. Please immediately update your bill payment via link: http://ebill-update.xyz or call Electricity Officer at 98112-99881.");
  const [scamChannel, setScamChannel] = useState("SMS");
  const [scamCategory, setScamCategory] = useState("Electricity Bill Fraud");
  const [scamResult, setScamResult] = useState<ScamExplanationResponse | null>(null);
  const [loadingScam, setLoadingScam] = useState(false);

  // 4. Budget Recommendations State
  const [budgetIncome, setBudgetIncome] = useState(30000);
  const [budgetResult, setBudgetResult] = useState<BudgetRecommendationResponse | null>(null);
  const [loadingBudget, setLoadingBudget] = useState(false);

  // 5. Financial Education State
  const [eduTopic, setEduTopic] = useState("compound_interest");
  const [eduResult, setEduResult] = useState<FinancialEducationResponse | null>(null);
  const [loadingEdu, setLoadingEdu] = useState(false);

  // 6. Personalized Guidance State
  const [guidanceName, setGuidanceName] = useState("Alex Morgan");
  const [guidanceGoal, setGuidanceGoal] = useState("Build 6-Month Emergency Cushion & Buy First Home");
  const [guidanceIncome, setGuidanceIncome] = useState(6500);
  const [guidanceExpenses, setGuidanceExpenses] = useState(4250);
  const [guidanceResult, setGuidanceResult] = useState<PersonalizedGuidanceResponse | null>(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  // 7. Phase 12: RAG Knowledge Base State
  const [ragQuery, setRagQuery] = useState("What is the Golden Hour protocol for Helpline 1930 and how does fund freezing work?");
  const [ragCategoryFilter, setRagCategoryFilter] = useState<string>("All");
  const [ragResult, setRagResult] = useState<RAGQueryResponse | null>(null);
  const [loadingRAG, setLoadingRAG] = useState(false);
  const [officialDocs, setOfficialDocs] = useState<OfficialDocumentMetadata[]>([]);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Phase 13 Unified Assistant Presets
  const unifiedPresets = [
    {
      title: "KYC Expiry (Canonical Example)",
      query: "I received a message saying my KYC will expire. Is it safe?",
      channel: "sms"
    },
    {
      title: "Phishing URL & Account Freeze",
      query: "URGENT: Your SBI account suspended tonight. Update KYC at http://sbi-kyc-verify.xyz/login immediately or card blocked.",
      channel: "sms"
    },
    {
      title: "Loan EMI Calculation",
      query: "What is the loan EMI of 500000 at 8.5% for 5 years?",
      channel: "sms"
    },
    {
      title: "Digital Arrest Extortion Threat",
      query: "Police officer on WhatsApp video claims digital arrest for money laundering in my name.",
      channel: "whatsapp"
    }
  ];

  // Quick Chat Prompts
  const quickPrompts = [
    "What is a Digital Arrest scam and how do I react?",
    "Someone on WhatsApp asks me to scan a QR code to receive a refund.",
    "Explain the 50/30/20 budget framework in simple terms.",
    "A caller wants me to download AnyDesk to fix a pending payment."
  ];

  const handleRunUnifiedAssistant = async (queryToRun?: string, channelToRun?: string) => {
    const q = (queryToRun !== undefined ? queryToRun : unifiedQuery).trim();
    if (!q) return;
    const ch = channelToRun || unifiedChannel;
    setLoadingUnified(true);
    try {
      const res = await api.assistUnified({
        query: q,
        channel: ch
      });
      setUnifiedResult(res);
      setUnifiedQuery(q);
      setUnifiedChannel(ch);
    } catch (err) {
      console.error("Unified assistant failed:", err);
    } finally {
      setLoadingUnified(false);
    }
  };

  // Handlers
  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loadingChat) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoadingChat(true);

    try {
      const res: AIChatResponse = await api.chatAI(text);
      const assistantMsg: Message = {
        role: "assistant",
        content: res.reply,
        sources: res.rag_sources,
        advisory: res.safety_advisory
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered a temporary connection issue. Please verify backend connectivity.",
        }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleRunFinanceExplanation = async () => {
    setLoadingFinance(true);
    try {
      const savings = financeIncome - financeExpenses;
      const rate = (savings / financeIncome) * 100;
      const res = await api.explainFinances({
        income: financeIncome,
        expenses: financeExpenses,
        savings: savings,
        savings_rate: rate,
        categories: { "Living": financeExpenses * 0.55, "Groceries": financeExpenses * 0.25, "Discretionary": financeExpenses * 0.20 },
        anomalies_count: 2,
        query: financeQuery
      });
      setFinanceResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFinance(false);
    }
  };

  const handleRunScamExplanation = async () => {
    setLoadingScam(true);
    try {
      const res = await api.explainScam({
        content: scamContent,
        channel: scamChannel,
        scam_category: scamCategory,
        threat_level: "CRITICAL",
        indicators: ["Artificial Urgency", "Coercive Disconnection Threat", "Unverified Mobile Contact"]
      });
      setScamResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScam(false);
    }
  };

  const handleRunBudgetRecommendations = async () => {
    setLoadingBudget(true);
    try {
      const res = await api.recommendBudget({
        income: budgetIncome,
        expenses: [
          { category: "Housing", amount: budgetIncome * 0.30 },
          { category: "Groceries", amount: budgetIncome * 0.15 },
          { category: "Transport", amount: budgetIncome * 0.05 },
          { category: "Dining", amount: budgetIncome * 0.15 }
        ]
      });
      setBudgetResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBudget(false);
    }
  };

  const handleRunEducation = async (topicToRun?: string) => {
    const topic = topicToRun || eduTopic;
    setLoadingEdu(true);
    try {
      const res = await api.getFinancialEducation({
        topic: topic,
        difficulty_level: "beginner"
      });
      setEduResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEdu(false);
    }
  };

  const handleRunPersonalizedGuidance = async () => {
    setLoadingGuidance(true);
    try {
      const res = await api.getPersonalizedGuidance({
        name: guidanceName,
        age_range: "26-35",
        occupation: "Product Designer / Engineer",
        monthly_income: guidanceIncome,
        monthly_expenses: guidanceExpenses,
        financial_goal: guidanceGoal,
        risk_alerts_count: 1
      });
      setGuidanceResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGuidance(false);
    }
  };

  const handleRunRAGQuery = async (queryToRun?: string, categoryFilter?: string) => {
    const q = (queryToRun || ragQuery).trim();
    if (!q) return;
    setLoadingRAG(true);
    try {
      const cat = categoryFilter !== undefined ? categoryFilter : (ragCategoryFilter !== "All" ? ragCategoryFilter : undefined);
      const res = await api.queryRAG({
        query: q,
        top_k: 3,
        category_filter: cat
      });
      setRagResult(res);
      setRagQuery(q);
    } catch (err) {
      console.error("RAG Query failed:", err);
    } finally {
      setLoadingRAG(false);
    }
  };

  const handleFetchOfficialDocs = async () => {
    try {
      const docs = await api.getOfficialDocuments();
      setOfficialDocs(docs);
    } catch (err) {
      console.error("Fetching official documents failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER & PHASE 13 ARCHITECTURE FLOW BANNER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>AI ASSISTANT</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  PHASE 13 (UNIFIED SENTINEL)
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial Calculator • Official Knowledge (RAG) • Safety Engine ➔ Gemini ➔ Answer + Sources
              </p>
            </div>
          </div>
        </div>

        {/* Phase 13 Pipeline Architecture Badge */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300">
          <span className="text-indigo-400 font-bold">Analyze Message</span>
          <span className="text-slate-600">→</span>
          <span className="text-sky-400 font-bold">Extract URL</span>
          <span className="text-slate-600">→</span>
          <span className="text-rose-400 font-bold">Check Indicators</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-400 font-bold">Retrieve Guidance</span>
          <span className="text-slate-600">→</span>
          <span className="text-cyan-400 font-bold">Gemini</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400 font-bold">Action Steps</span>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CANONICAL NAVIGATION TABS (PHASE 13 + RAG + 5 RESPONSIBILITIES)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <button
          onClick={() => {
            setActiveMode("assistant");
            if (!unifiedResult) handleRunUnifiedAssistant();
          }}
          className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
            activeMode === "assistant" 
              ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400/50" 
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          <span>AI Assistant (Unified Sentinel)</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("rag");
            if (!ragResult) handleRunRAGQuery();
            if (officialDocs.length === 0) handleFetchOfficialDocs();
          }}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "rag" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="h-3.5 w-3.5 text-amber-400" />
          <span>Official Knowledge Base (RAG)</span>
        </button>

        <button
          onClick={() => setActiveMode("chat")}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "chat" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          <span>Conversational Copilot</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("rag");
            if (!ragResult) handleRunRAGQuery();
            if (officialDocs.length === 0) handleFetchOfficialDocs();
          }}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "rag" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <Database className="h-3.5 w-3.5 text-amber-400" />
          <span>Official Knowledge Base (RAG)</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("finances");
            if (!financeResult) handleRunFinanceExplanation();
          }}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "finances" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Financial Explanation</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("scam");
            if (!scamResult) handleRunScamExplanation();
          }}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "scam" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <Flame className="h-3.5 w-3.5 text-rose-400" />
          <span>Scam Explanation</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("budget");
            if (!budgetResult) handleRunBudgetRecommendations();
          }}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "budget" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <PieChart className="h-3.5 w-3.5" />
          <span>Budget Recommendations</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("education");
            if (!eduResult) handleRunEducation("compound_interest");
          }}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "education" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Financial Education</span>
        </button>

        <button
          onClick={() => {
            setActiveMode("guidance");
            if (!guidanceResult) handleRunPersonalizedGuidance();
          }}
          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
            activeMode === "guidance" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Personalized Guidance</span>
        </button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 0: PHASE 13 — AI ASSISTANT (UNIFIED SENTINEL)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "assistant" && (
        <div className="space-y-6">
          {/* Architecture Banner */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Phase 13 AI Assistant Architecture
                  </h2>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Connects the <strong className="text-emerald-400">Financial Calculator</strong>, <strong className="text-amber-400">RAG Knowledge Base (8 Official Domains)</strong>, and <strong className="text-rose-400">Safety Engine</strong> through <strong className="text-cyan-400">Google Gemini</strong> to deliver verified answers, threat indicators, and immediate action steps.
                </p>
              </div>

              {/* 3 Pillars Flow Diagram Badge */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono shrink-0">
                <div className="text-center font-bold text-cyan-300 pb-1 mb-1 border-b border-slate-800">
                  AI ASSISTANT
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold">Financial Calc</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-semibold">RAG Knowledge</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-semibold">Safety Engine</span>
                </div>
                <div className="text-center text-slate-500 pt-1 text-[9px]">
                  ↓ Convergence into Gemini → Answer + Sources
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Canonical Test Scenarios & Presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unifiedPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunUnifiedAssistant(preset.query, preset.channel)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                    unifiedQuery === preset.query
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Box & Channel Selector */}
          <div className="glass-panel p-4 md:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Search className="h-3.5 w-3.5 text-cyan-400" />
                <span>Ask Question or Paste Suspicious Message</span>
              </label>

              {/* Channel Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Channel:</span>
                <select
                  value={unifiedChannel}
                  onChange={(e) => setUnifiedChannel(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="url">URL Link</option>
                  <option value="payment">Payment / UPI</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={unifiedQuery}
                onChange={(e) => setUnifiedQuery(e.target.value)}
                placeholder="e.g. I received a message saying my KYC will expire. Is it safe?"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/60 transition-colors resize-none placeholder:text-slate-600"
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Protected by Scam Shield, pgvector Knowledge Base & Google Gemini</span>
              </div>

              <button
                onClick={() => handleRunUnifiedAssistant()}
                disabled={loadingUnified || !unifiedQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 font-bold text-xs text-white shadow-lg shadow-cyan-950/40 disabled:opacity-50 transition-all flex items-center space-x-2"
              >
                {loadingUnified ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Flow...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span>Run Sentinel Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {unifiedResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Flow Execution Badges */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Sentinel Pipeline Execution:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  {Object.entries(unifiedResult.pipeline_trace).map(([step, val], i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>{String(val)}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid: Safety Assessment + Financial Calculations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Safety Assessment Card */}
                <div className={`glass-panel p-5 rounded-2xl border ${
                  unifiedResult.safety_assessment.risk_level === "CRITICAL" || unifiedResult.safety_assessment.risk_level === "HIGH"
                    ? "border-rose-500/30 bg-rose-950/10"
                    : unifiedResult.safety_assessment.risk_level === "MODERATE"
                    ? "border-amber-500/30 bg-amber-950/10"
                    : "border-emerald-500/30 bg-emerald-950/10"
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className={`h-5 w-5 ${
                        unifiedResult.safety_assessment.risk_level === "CRITICAL" || unifiedResult.safety_assessment.risk_level === "HIGH"
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }`} />
                      <h3 className="font-bold text-sm text-white">Safety Engine Assessment</h3>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                      unifiedResult.safety_assessment.risk_level === "CRITICAL" || unifiedResult.safety_assessment.risk_level === "HIGH"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : unifiedResult.safety_assessment.risk_level === "MODERATE"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}>
                      {unifiedResult.safety_assessment.risk_level} (Score: {unifiedResult.safety_assessment.risk_score}/100)
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400">Identified Category: </span>
                    <strong className="text-white">{unifiedResult.safety_assessment.scam_category}</strong>
                  </div>

                  {/* Indicators Detected */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Threat Indicators Checked:
                    </div>
                    {unifiedResult.safety_assessment.detected_indicators.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {unifiedResult.safety_assessment.detected_indicators.map((ind, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-1"
                          >
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>{ind}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>No malicious triggers or urgency coercion detected.</span>
                      </div>
                    )}
                  </div>

                  {/* Extracted URLs */}
                  {unifiedResult.safety_assessment.extracted_urls.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Extracted Link(s):
                      </div>
                      <div className="flex flex-col gap-1">
                        {unifiedResult.safety_assessment.extracted_urls.map((u, i) => (
                          <div key={i} className="text-xs font-mono text-cyan-300 truncate bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {u}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Financial Calculator Card */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-bold text-sm text-white">Financial Calculator</h3>
                    </div>
                    {unifiedResult.financial_calculations ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {unifiedResult.financial_calculations.calculation_type.replace("_", " ").toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Standby</span>
                    )}
                  </div>

                  {unifiedResult.financial_calculations ? (
                    <div className="space-y-2 text-xs">
                      {unifiedResult.financial_calculations.calculation_type === "emi_calculation" && (
                        <div className="grid grid-cols-2 gap-2 text-slate-300">
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Monthly EMI</div>
                            <div className="text-lg font-black text-emerald-400">
                              ₹{Number(unifiedResult.financial_calculations.details.monthly_emi).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                            <div className="text-[10px] text-slate-400 uppercase">Total Interest</div>
                            <div className="text-lg font-black text-amber-400">
                              ₹{Number(unifiedResult.financial_calculations.details.total_interest).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] col-span-2">
                            Principal: ₹{Number(unifiedResult.financial_calculations.details.principal).toLocaleString()} • Rate: {unifiedResult.financial_calculations.details.annual_rate_pct}% • Tenure: {unifiedResult.financial_calculations.details.tenure_months} months
                          </div>
                        </div>
                      )}

                      {unifiedResult.financial_calculations.calculation_type === "budget_allocation" && (
                        <div className="grid grid-cols-3 gap-2 text-slate-300">
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                            <div className="text-[10px] text-slate-400">Needs (50%)</div>
                            <div className="text-sm font-bold text-sky-400">
                              ₹{Number(unifiedResult.financial_calculations.details.needs_50).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                            <div className="text-[10px] text-slate-400">Wants (30%)</div>
                            <div className="text-sm font-bold text-amber-400">
                              ₹{Number(unifiedResult.financial_calculations.details.wants_30).toLocaleString()}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                            <div className="text-[10px] text-slate-400">Savings (20%)</div>
                            <div className="text-sm font-bold text-emerald-400">
                              ₹{Number(unifiedResult.financial_calculations.details.savings_20).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {unifiedResult.financial_calculations.calculation_type === "emergency_fund" && (
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                          <div className="text-[10px] text-slate-400 uppercase">Recommended 6-Month Emergency Target</div>
                          <div className="text-xl font-black text-emerald-400">
                            ₹{Number(unifiedResult.financial_calculations.details.recommended_target).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            3-Month Minimum Cushion: ₹{Number(unifiedResult.financial_calculations.details.minimum_target_3_months).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-xs text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-300">Mathematical Engine Idle</div>
                      <p>
                        No numeric loan, budgeting, or investment calculations were detected in this inquiry. Ask for an EMI, 50/30/20 split, or SIP growth to activate real-time formulas.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Gemini Synthesis Explanation */}
              <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Gemini Unified Synthesis</h3>
                    <p className="text-[11px] text-slate-400">Grounded in Safety Engine detections, pgvector citations, and verified formulas</p>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {unifiedResult.answer}
                </div>
              </div>

              {/* Action Steps & Authoritative Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Immediate Action Steps */}
                <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3">
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">Recommended Action Steps</h3>
                  </div>

                  <div className="space-y-2">
                    {unifiedResult.action_steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start space-x-2.5"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-snug">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authoritative Sources (RAG) */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-amber-400" />
                      <h3 className="font-bold text-sm text-white">Authoritative Citations (RAG)</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {unifiedResult.sources.length} Verified Ref(s)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {unifiedResult.sources.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white truncate">{s.title}</span>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-slate-900 text-cyan-400 hover:text-cyan-300 shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                          <span className="text-cyan-400 font-semibold">{s.source}</span>
                          <span>•</span>
                          <span className="text-amber-400">{s.document_type}</span>
                          <span>•</span>
                          <span>{s.jurisdiction}</span>
                        </div>

                        <p className="text-[11px] text-slate-300 line-clamp-2 italic">
                          "{s.excerpt}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 1: UNIFIED CONVERSATIONAL CHAT
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "chat" && (
        <div className="space-y-4">
          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(prompt)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors flex items-center space-x-1.5"
              >
                <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Chat Box */}
          <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[520px] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-3"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {m.sources && m.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="text-[11px] font-bold text-cyan-400 flex items-center space-x-1 uppercase tracking-wider">
                          <BookOpen className="h-3 w-3" />
                          <span>RAG Knowledge Base Citations</span>
                        </div>
                        {m.sources.map((s, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                            <strong className="text-slate-300 font-semibold">{s.title}</strong>: {s.content.substring(0, 110)}...
                          </div>
                        ))}
                      </div>
                    )}

                    {m.advisory && (
                      <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg">
                        {m.advisory}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loadingChat && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    <span>Gemini AI is analyzing financial context...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 md:p-4 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Gemini about financial diagnosis, scam warnings, or safety strategies..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={loadingChat || !input.trim()}
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-md shadow-cyan-600/30 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PHASE 12 TAB: RAG OFFICIAL KNOWLEDGE BASE & PGVECTOR
          Official Documents ➔ Document Loader ➔ Chunking ➔ Embeddings ➔
          Supabase pgvector ➔ Retriever ➔ Gemini ➔ Answer + Sources
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "rag" && (
        <div className="space-y-6">

          {/* 5-STEP RAG PIPELINE BANNER */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center space-x-2">
                <Database className="h-3.5 w-3.5 text-amber-400" />
                <span>Phase 12 — RAG Knowledge Base Architecture:</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">Supabase pgvector (768-dim) • Gemini RAG Grounding</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-mono font-bold">STEP 1</span>
                <div className="font-bold text-white">Official Docs</div>
                <div className="text-[10px] text-slate-500">8 Domains</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-indigo-400 font-mono font-bold">STEP 2</span>
                <div className="font-bold text-white">Doc Loader</div>
                <div className="text-[10px] text-slate-500">Metadata Ingest</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-sky-400 font-mono font-bold">STEP 3</span>
                <div className="font-bold text-white">Chunking</div>
                <div className="text-[10px] text-slate-500">550 chars</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-purple-400 font-mono font-bold">STEP 4</span>
                <div className="font-bold text-white">Embeddings</div>
                <div className="text-[10px] text-slate-500">768-dim Space</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 font-mono font-bold">STEP 5</span>
                <div className="font-bold text-white">pgvector</div>
                <div className="text-[10px] text-slate-500">Cosine (&lt;=&gt;)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-mono font-bold">STEP 6</span>
                <div className="font-bold text-white">Gemini + RAG</div>
                <div className="text-[10px] text-slate-500">Answer + Sources</div>
              </div>
            </div>
          </div>

          {/* DOMAIN CATEGORY CHIPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Building2 className="h-3 w-3 text-cyan-400" />
                <span>Filter by Authoritative Domain:</span>
              </span>
              <button
                onClick={() => {
                  setShowDocsModal(!showDocsModal);
                  if (officialDocs.length === 0) handleFetchOfficialDocs();
                }}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>{showDocsModal ? "Hide Registry" : "Browse All 8 Official Documents"}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                "All",
                "Financial literacy",
                "UPI safety",
                "Cyber safety",
                "Banking basics",
                "Loan terminology",
                "Insurance basics",
                "Government schemes",
                "Official fraud-reporting guidance"
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setRagCategoryFilter(cat);
                    handleRunRAGQuery(undefined, cat !== "All" ? cat : undefined);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    ragCategoryFilter === cat
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ALL DOCUMENTS DIRECTORY MODAL/DRAWER */}
          {showDocsModal && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Authoritative Official Documents Registry ({officialDocs.length || 8})</span>
                <span className="text-[10px] text-slate-500 font-mono">RBI • NPCI • CERT-In • I4C • IRDAI • MHA</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {(officialDocs.length > 0 ? officialDocs : [
                  { title: "NSFE 2020-2025: 5Cs Framework", source: "Reserve Bank of India (RBI)", category: "Financial literacy", document_type: "Policy Framework", url: "https://rbi.org.in" },
                  { title: "UPI Security Guidelines", source: "National Payments Corporation of India (NPCI)", category: "UPI safety", document_type: "Operating Standard", url: "https://npci.org.in" },
                  { title: "Citizen Cyber Defense Advisory", source: "CERT-In & I4C", category: "Cyber safety", document_type: "National Advisory", url: "https://cert-in.org.in" },
                  { title: "Charter of Customer Rights", source: "Reserve Bank of India (RBI)", category: "Banking basics", document_type: "Master Direction", url: "https://rbi.org.in" },
                  { title: "Digital Lending & KFS Guidelines", source: "Reserve Bank of India (RBI)", category: "Loan terminology", document_type: "Master Circular", url: "https://rbi.org.in" },
                  { title: "Policyholders' Interests Norms", source: "IRDAI", category: "Insurance basics", document_type: "Master Circular", url: "https://irdai.gov.in" },
                  { title: "PMJDY, PMJJBY, PMSBY Schemes", source: "Ministry of Finance", category: "Government schemes", document_type: "Statutory Charter", url: "https://financialservices.gov.in" },
                  { title: "CFCFRMS Helpline 1930 SOP", source: "Ministry of Home Affairs & I4C", category: "Official fraud-reporting guidance", document_type: "SOP", url: "https://cybercrime.gov.in" }
                ]).map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-200 line-clamp-1">{doc.title}</span>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 ml-2">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="text-[11px] text-cyan-400 font-medium">{doc.source}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Category: {doc.category} • {doc.document_type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUICK PROMPT PILLS */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Recommended Statutory Queries:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { title: "UPI PIN Golden Rule (NPCI)", q: "What is the NPCI golden rule regarding UPI PINs and QR code scanning?" },
                { title: "Helpline 1930 Golden Hour (MHA)", q: "What is the Golden Hour protocol for Helpline 1930 and how does fund freezing work?" },
                { title: "RBI Customer Charter Rights", q: "What protections do I have under the RBI Charter of Customer Rights regarding confidential credentials?" },
                { title: "IRDAI 30-Day Free-Look Period", q: "What are the rules for the 30-day Free-Look period and claims settlement timelines under IRDAI?" },
                { title: "Digital Lending KFS Mandate", q: "What is the Key Fact Statement (KFS) mandate under RBI digital lending guidelines?" },
                { title: "PMJDY Social Security (Govt)", q: "What are the core features and accidental insurance covers of Pradhan Mantri Jan Dhan Yojana (PMJDY)?" }
              ].map((pr, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setRagQuery(pr.q);
                    handleRunRAGQuery(pr.q);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    ragQuery === pr.q
                      ? "bg-cyan-500/10 border-cyan-500/50 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-white truncate">{pr.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{pr.q}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH INPUT */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Search className="h-3.5 w-3.5 text-cyan-400" />
                <span>Search Official Knowledge Base:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">pgvector Cosine Similarity Search</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="Ask any question about RBI, NPCI, CERT-In, IRDAI, or government schemes..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleRunRAGQuery()}
                disabled={loadingRAG}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {loadingRAG ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4 text-amber-300" />}
                <span>Execute RAG Query</span>
              </button>
            </div>
          </div>

          {/* RAG RESULT: ANSWER + SOURCES */}
          {ragResult && (
            <div className="space-y-6">

              {/* ANSWER CARD */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      GEMINI SYNTHESIS
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      Grounded in {ragResult.total_sources_cited} Official Regulatory Documents
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Supabase pgvector (cosine)
                  </div>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                  {ragResult.answer}
                </div>
              </div>

              {/* OFFICIAL SOURCES CITATIONS GRID */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Authoritative Sources Cited ({ragResult.sources.length}):</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ragResult.sources.map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {s.source}
                          </span>
                          <h3 className="font-bold text-sm text-white mt-1 line-clamp-1">{s.title}</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-300 shrink-0">
                          {s.relevance_score}% Match
                        </span>
                      </div>

                      {/* Metadata Strip */}
                      <div className="grid grid-cols-2 gap-1.5 py-1.5 border-y border-slate-800/80 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500">Date:</span> <span className="text-slate-300">{s.publication_date}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Jurisdiction:</span> <span className="text-slate-300">{s.jurisdiction}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Doc Type:</span> <span className="text-slate-300">{s.document_type}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Category:</span> <span className="text-cyan-400">{s.category}</span>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        "{s.excerpt}"
                      </p>

                      {/* Official Link Button */}
                      <div className="pt-1 flex justify-end">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                        >
                          <span>Official Portal Reference</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 2: RESPONSIBILITY 1 — FINANCIAL EXPLANATION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "finances" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  <span>Executive Financial Health Diagnosis</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gemini analyzes cash flow burn rates, savings efficiency, and anomalies across your ledger.
                </p>
              </div>
              <button
                onClick={handleRunFinanceExplanation}
                disabled={loadingFinance}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-600/25"
              >
                {loadingFinance ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Generate CFP Analysis</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Monthly Income (₹ / $)</label>
                <input
                  type="number"
                  value={financeIncome}
                  onChange={(e) => setFinanceIncome(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-cyan-300"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Monthly Expenses (₹ / $)</label>
                <input
                  type="number"
                  value={financeExpenses}
                  onChange={(e) => setFinanceExpenses(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-rose-300"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Net Savings & Rate</label>
                <div className="p-2 text-sm font-mono font-bold text-emerald-400">
                  ${(financeIncome - financeExpenses).toLocaleString()} (
                  {financeIncome > 0 ? (((financeIncome - financeExpenses) / financeIncome) * 100).toFixed(1) : 0}%)
                </div>
              </div>
            </div>
          </div>

          {financeResult && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                    financeResult.health_tier === "EXCELLENT" || financeResult.health_tier === "HEALTHY"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {financeResult.health_tier} POSTURE
                  </span>
                  <span className="text-xs text-slate-300">{financeResult.health_summary}</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {financeResult.explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 3: RESPONSIBILITY 2 — SCAM EXPLANATION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "scam" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-rose-400" />
                  <span>Cyber-Fraud Vector Deconstruction</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gemini breaks down deceptive payloads, social engineering psychology, and defensive protocols.
                </p>
              </div>
              <button
                onClick={handleRunScamExplanation}
                disabled={loadingScam}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-rose-600/25"
              >
                {loadingScam ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Deconstruct Threat</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Suspicious Text Payload</label>
                <textarea
                  rows={3}
                  value={scamContent}
                  onChange={(e) => setScamContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Attack Channel</label>
                  <select
                    value={scamChannel}
                    onChange={(e) => setScamChannel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="SMS">SMS / Text Message</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Email">Email Phishing</option>
                    <option value="Call">Coercive Phone Call</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target Category</label>
                  <input
                    type="text"
                    value={scamCategory}
                    onChange={(e) => setScamCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {scamResult && (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-500/20">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    THREAT: {scamResult.threat_level}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">{scamResult.category}</span>
                </div>
                <div className="text-xs text-emerald-400 font-mono font-bold">
                  {scamResult.reporting_helpline}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-300 font-medium">
                {scamResult.golden_rule}
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {scamResult.scam_explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 4: RESPONSIBILITY 3 — BUDGET RECOMMENDATIONS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "budget" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-indigo-400" />
                  <span>50/30/20 Strategic Budget Optimizer</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mathematical capital partitioning into Needs, Wants, and Wealth-Building reserves.
                </p>
              </div>
              <button
                onClick={handleRunBudgetRecommendations}
                disabled={loadingBudget}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/25"
              >
                {loadingBudget ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Calculate Allocation</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Monthly Take-Home Income</label>
                <input
                  type="number"
                  value={budgetIncome}
                  onChange={(e) => setBudgetIncome(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-cyan-300"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Annual Accumulation Potential</span>
                  <strong className="text-lg font-mono text-emerald-400">
                    ${(budgetIncome * 0.20 * 12).toLocaleString()} / year
                  </strong>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400/30" />
              </div>
            </div>
          </div>

          {budgetResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-cyan-400 font-bold uppercase">Needs (50%)</span>
                  <div className="text-xl font-bold font-mono text-white">
                    ${budgetResult.target_allocations.needs_50_pct.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">Rent, groceries, utilities, transit</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-amber-400 font-bold uppercase">Wants (30%)</span>
                  <div className="text-xl font-bold font-mono text-white">
                    ${budgetResult.target_allocations.wants_30_pct.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">Dining, entertainment, shopping</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-emerald-400 font-bold uppercase">Savings / Wealth (20%)</span>
                  <div className="text-xl font-bold font-mono text-white">
                    ${budgetResult.target_allocations.savings_investments_20_pct.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">Emergency fund, index funds, debt payoff</div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                  {budgetResult.recommendations}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 5: RESPONSIBILITY 4 — FINANCIAL EDUCATION
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "education" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-sky-400" />
                  <span>Financial Literacy Masterclasses</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clear, zero-jargon lessons on wealth compounding, asset protection, and investment mechanics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "compound_interest", label: "Compound Interest & Rule of 72" },
                { id: "sip_mutual_funds", label: "SIPs & Index Funds" },
                { id: "emergency_fund", label: "Emergency Reserve Formula" },
                { id: "inflation_hedge", label: "Beating Inflation & Real Returns" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setEduTopic(t.id);
                    handleRunEducation(t.id);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all text-xs ${
                    eduTopic === t.id
                      ? "bg-sky-500/10 border-sky-500/50 text-white shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-white">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {loadingEdu && (
            <div className="p-8 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-sky-400 mx-auto" />
              <div className="text-xs text-slate-400">Loading lesson from Gemini financial tutor...</div>
            </div>
          )}

          {eduResult && !loadingEdu && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Topic: {eduResult.topic.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-xs text-slate-500">Read Time: {eduResult.estimated_read_time}</span>
              </div>
              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {eduResult.lesson}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 6: RESPONSIBILITY 5 — PERSONALIZED GUIDANCE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMode === "guidance" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-amber-400" />
                  <span>Personalized Wealth & Defense Roadmap</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tailored financial roadmap synthesized from your unique occupation, income, and targets.
                </p>
              </div>
              <button
                onClick={handleRunPersonalizedGuidance}
                disabled={loadingGuidance}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-amber-600/25"
              >
                {loadingGuidance ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Generate Personal Roadmap</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">User Name</label>
                <input
                  type="text"
                  value={guidanceName}
                  onChange={(e) => setGuidanceName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Monthly Income ($)</label>
                <input
                  type="number"
                  value={guidanceIncome}
                  onChange={(e) => setGuidanceIncome(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">Monthly Expenses ($)</label>
                <input
                  type="number"
                  value={guidanceExpenses}
                  onChange={(e) => setGuidanceExpenses(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-[11px] text-slate-400 block mb-1">Primary Financial Goal</label>
              <input
                type="text"
                value={guidanceGoal}
                onChange={(e) => setGuidanceGoal(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold"
              />
            </div>
          </div>

          {guidanceResult && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-sm font-bold text-white">Roadmap for {guidanceResult.name}</span>
                  <div className="text-xs text-amber-300 font-medium">Goal: {guidanceResult.goal}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Monthly Free Cash Flow</span>
                  <strong className="text-base font-mono text-emerald-400">
                    +${guidanceResult.monthly_surplus.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="flex gap-2">
                {guidanceResult.action_phases.map((ph, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Phase {i + 1}: {ph}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {guidanceResult.guidance_roadmap}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
