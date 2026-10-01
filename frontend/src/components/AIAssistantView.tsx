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
  FileText
} from "lucide-react";
import { 
  api, 
  AIChatResponse,
  FinancialExplanationResponse,
  ScamExplanationResponse,
  BudgetRecommendationResponse,
  FinancialEducationResponse,
  PersonalizedGuidanceResponse
} from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  advisory?: string;
}

export const AIAssistantView: React.FC = () => {
  // Navigation Modes: 5 Canonical Responsibilities + General Chat
  const [activeMode, setActiveMode] = useState<
    "chat" | "finances" | "scam" | "budget" | "education" | "guidance"
  >("chat");

  // 1. Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your **Defeat Scammer AI Engine**, powered by Google Gemini and our verified cyber-fraud RAG knowledge base. Select any specialized responsibility above or ask me about suspicious messages, deceptive phone calls, unfamiliar investment proposals, or how to freeze accounts safely.",
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

  // Quick Chat Prompts
  const quickPrompts = [
    "What is a Digital Arrest scam and how do I react?",
    "Someone on WhatsApp asks me to scan a QR code to receive a refund.",
    "Explain the 50/30/20 budget framework in simple terms.",
    "A caller wants me to download AnyDesk to fix a pending payment."
  ];

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER & ARCHITECTURE FLOW BANNER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>AI ENGINE</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  PHASE 11 (GEMINI)
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Core Cognitive Intelligence: Financial Explanation • Scam Deconstruction • Budgeting • Education • Personalized Guidance
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Architecture Badge */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-1.5 text-[11px] font-mono text-slate-300">
          <span className="text-cyan-400 font-bold">User</span>
          <span className="text-slate-600">→</span>
          <span className="text-indigo-400 font-bold">FastAPI</span>
          <span className="text-slate-600">→</span>
          <span className="text-sky-400 font-bold">AI Service</span>
          <span className="text-slate-600">→</span>
          <span className="text-amber-400 font-bold">Gemini</span>
          <span className="text-slate-600">→</span>
          <span className="text-emerald-400 font-bold">Response</span>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5 CANONICAL RESPONSIBILITY NAVIGATION TABS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
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
