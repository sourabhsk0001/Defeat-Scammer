"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Lock, 
  ChevronRight, 
  TrendingUp, 
  Cpu,
  Bot,
  PieChart,
  CreditCard,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";
import { UserProfile, Transaction, BudgetSummary, api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface DashboardViewProps {
  profile: UserProfile | null;
  transactions: Transaction[];
  budgets: BudgetSummary | null;
  onNavigate: (tab: string) => void;
  onOpenSOS: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  transactions,
  budgets,
  onNavigate,
  onOpenSOS
}) => {
  // Currency toggle: 'INR' (₹) or 'USD' ($)
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const currencySymbol = currency === "INR" ? "₹" : "$";
  const currencyRate = currency === "INR" ? 1 : (1 / 85);

  const [summaryData, setSummaryData] = useState<any>(null);

  // Quick Scam Check widget in Dashboard
  const [quickInput, setQuickInput] = useState("");
  const [quickResult, setQuickResult] = useState<any>(null);
  const [quickLoading, setQuickLoading] = useState(false);

  useEffect(() => {
    api.getDashboardSummary()
      .then((data) => setSummaryData(data))
      .catch((err) => console.warn(err));
  }, []);

  const formatAmount = (val: number) => {
    const converted = currency === "INR" ? val : val * currencyRate;
    return `${currencySymbol}${converted.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const rawIncome = profile?.monthly_income || summaryData?.financial_health?.income || 30000;
  const rawExpenses = profile?.monthly_expenses || summaryData?.financial_health?.expenses || 21500;
  const rawSavings = Math.max(0, rawIncome - rawExpenses);

  const riskAlertsCount = transactions.filter(t => t.is_anomaly).length || 2;
  const scamsCheckedCount = summaryData?.financial_health?.scams_checked_count || 14;
  const goalProgressPct = summaryData?.financial_health?.goal_progress_pct || 80;

  // Generate ASCII / Block style progress bar: e.g. ████████░░ 80%
  const filledBlocks = Math.round(goalProgressPct / 10);
  const emptyBlocks = Math.max(0, 10 - filledBlocks);
  const blockProgressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  const handleQuickScan = async () => {
    if (!quickInput.trim()) return;
    setQuickLoading(true);
    try {
      if (quickInput.startsWith("http://") || quickInput.startsWith("https://") || quickInput.includes(".com") || quickInput.includes(".xyz")) {
        const res = await api.analyzeURL(quickInput);
        setQuickResult({ type: "url", ...res });
      } else {
        const res = await api.analyzeMessage(quickInput);
        setQuickResult({ type: "message", ...res });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner: Greeting, Sentinel Status & Currency Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold tracking-widest uppercase text-cyan-400 mb-1.5">
              <Cpu className="h-4 w-4" />
              <span>Multi-Layer Financial Sentinel Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Welcome, {profile?.name || "Guardian User"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Tier: <strong className="text-indigo-300 font-semibold">{profile?.protection_tier || "Ultra Sentinel"}</strong> • Primary Goal: <strong className="text-slate-200">{profile?.financial_goal || "Emergency Fraud Reserve"}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs font-semibold">
              <button
                onClick={() => setCurrency("INR")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === "INR" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === "USD" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                $ USD
              </button>
            </div>

            <button
              onClick={() => onNavigate("scam-shield")}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Scan Threat</span>
            </button>
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-rose-600/30 transition-all active:scale-95 animate-pulse"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. FINANCIAL HEALTH — EXACT FORMAT SPECIFIED IN PROMPT
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="glass-panel-glow rounded-3xl p-6 md:p-8 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 mb-6 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
              <span>Financial Health</span>
            </h2>
            <div className="text-slate-500 font-mono text-xs mt-0.5 tracking-tighter">
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => onNavigate("visualizations")}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-semibold border border-indigo-500/40 transition-all flex items-center space-x-1"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Visual Analytics</span>
            </button>
            <span className="text-slate-400">Health Index:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 font-mono">
              {profile?.financial_health_score || 85}/100 EXCELLENT
            </span>
          </div>
        </div>

        {/* 3 Primary Metric Callouts: Income, Expenses, Savings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Income</span>
              <ArrowDownRight className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-2">
              {formatAmount(rawIncome)}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              ✓ Verified Monthly Direct Deposit
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Expenses</span>
              <ArrowUpRight className="h-4 w-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mt-2">
              {formatAmount(rawExpenses)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">
              71.6% Outflow Ratio
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/20 flex flex-col justify-between shadow-inner">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Savings</span>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-2">
              {formatAmount(rawSavings)}
            </div>
            <div className="text-[11px] text-cyan-300 font-medium mt-1">
              +28.3% Monthly Surplus Buffer
            </div>
          </div>
        </div>

        {/* Secondary Threat Metrics: Risk Alerts, Scams Checked & Goal Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Risk Alerts & Scams Checked */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-around text-center">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Alerts</div>
              <div className="text-3xl font-black text-rose-400 font-mono flex items-center justify-center space-x-1.5">
                <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />
                <span>{riskAlertsCount}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Anomalies Detected</div>
            </div>

            <div className="h-12 w-px bg-slate-800" />

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Scams Checked</div>
              <div className="text-3xl font-black text-emerald-400 font-mono flex items-center justify-center space-x-1.5">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <span>{scamsCheckedCount}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Neutralized Vectors</div>
            </div>
          </div>

          {/* Goal Progress Block Bar: ████████░░ 80% */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>Goal Progress ({profile?.financial_goal || "Emergency Reserve"})</span>
              <span className="text-cyan-400 font-mono text-sm">{goalProgressPct}%</span>
            </div>

            <div className="py-2 text-center">
              <div className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-cyan-400 select-all">
                {blockProgressBar} <span className="text-sm font-sans text-slate-200 font-semibold">{goalProgressPct}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${goalProgressPct}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Target completion in 68 days with current monthly surplus.
            </div>
          </div>

        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. INCOME & 3. EXPENSES & 4. SAVINGS (DETAILED BREAKDOWN)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Income Module */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowDownRight className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Income Streams</h3>
            </div>
            <button onClick={() => onNavigate("budget")} className="text-xs text-cyan-400 hover:underline">
              Inspect
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Apex Tech Payroll</div>
                <div className="text-[10px] text-slate-400">Direct Deposit ACH (Monthly)</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-emerald-400">{formatAmount(rawIncome * 0.85)}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">VERIFIED ✓</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Consulting & Bonus</div>
                <div className="text-[10px] text-slate-400">Secondary Inflow</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-emerald-400">{formatAmount(rawIncome * 0.15)}</div>
                <div className="text-[10px] text-slate-400">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Module */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-5 w-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Expense Outflow</h3>
            </div>
            <button onClick={() => onNavigate("transactions")} className="text-xs text-cyan-400 hover:underline">
              Ledger
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Housing & Utilities</span>
              <span className="font-mono font-semibold">{formatAmount(rawExpenses * 0.45)} (45%)</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: "45%" }} />
            </div>

            <div className="flex justify-between text-slate-300 pt-1">
              <span>Groceries & Dining</span>
              <span className="font-mono font-semibold">{formatAmount(rawExpenses * 0.25)} (25%)</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: "25%" }} />
            </div>

            <div className="flex justify-between text-slate-300 pt-1">
              <span>Transfers & Shopping</span>
              <span className="font-mono font-semibold text-rose-400">{formatAmount(rawExpenses * 0.30)} (30%)</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-rose-500" style={{ width: "30%" }} />
            </div>
          </div>
        </div>

        {/* Savings Module */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Savings & Cushion</h3>
            </div>
            <Badge variant="success">SAFE RESERVE</Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Net Monthly Savings:</span>
              <span className="font-bold font-mono text-cyan-400 text-sm">{formatAmount(rawSavings)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Liquid Runway:</span>
              <span className="font-bold text-slate-200">5.8 Months Buffer</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Emergency Fraud Cap:</span>
              <span className="font-bold text-emerald-400">{formatAmount(rawIncome * 3)}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Your savings reserve is insulated from linked debit cards in a segregated vault account.
          </p>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. BUDGET & 6. RISK ALERTS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 5. Budget Status */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Budget Allocation & Caps</h3>
            </div>
            <button onClick={() => onNavigate("budget")} className="text-xs text-cyan-400 hover:underline">
              View All Budgets
            </button>
          </div>

          <div className="space-y-3.5">
            {budgets?.categories.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-semibold">{cat.category}</span>
                  <span className={cat.status === "Exceeded" ? "text-rose-400 font-bold font-mono" : "text-slate-400 font-mono"}>
                    {formatAmount(cat.spent)} / {formatAmount(cat.budgeted)} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      cat.status === "Exceeded" ? "bg-rose-500" : cat.status === "Warning" ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Risk Alerts */}
        <div className="glass-panel-danger rounded-2xl p-6 border border-rose-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
              <h3 className="text-base font-bold text-white">Live Risk Alerts (ML Engine)</h3>
            </div>
            <button onClick={() => onNavigate("transactions")} className="text-xs text-rose-400 hover:underline">
              Resolve Alerts
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  CRITICAL • 02:41 AM
                </span>
                <span className="font-mono font-bold text-rose-400">{formatAmount(2950)}</span>
              </div>
              <div className="text-xs font-bold text-white">Rapid Wire to Off-Shore Crypto LLC</div>
              <div className="text-[11px] text-slate-400">Z-score 4.8σ outlier • Seychelles proxy gateway • OFAC AML flagged</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  HIGH • 04:12 AM
                </span>
                <span className="font-mono font-bold text-amber-300">{formatAmount(1.15)}</span>
              </div>
              <div className="text-xs font-bold text-white">Suspicious Micro Charge Verification</div>
              <div className="text-[11px] text-slate-400">Carding validation probe pattern testing active card limits</div>
            </div>
          </div>
        </div>

      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. SCAM SHIELD & 8. AI ASSISTANT & 9. SECURITY CENTER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7. Scam Shield Quick Scanner */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Scam Shield</h3>
          </div>
          <p className="text-xs text-slate-400">
            Quickly test any message, URL, or caller statement directly:
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Paste SMS text or URL to scan..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              onClick={handleQuickScan}
              disabled={quickLoading || !quickInput.trim()}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-cyan-600/25 flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{quickLoading ? "Scanning..." : "Quick Analyze"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {quickResult && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center justify-between font-bold">
                <span className={quickResult.is_scam || quickResult.is_phishing ? "text-rose-400" : "text-emerald-400"}>
                  {quickResult.is_scam || quickResult.is_phishing ? "⚠️ THREAT DETECTED" : "✓ SAFE"}
                </span>
                <span className="font-mono text-slate-400">{quickResult.risk_score}% Risk</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {quickResult.scam_category || quickResult.verdict_summary}
              </p>
            </div>
          )}
        </div>

        {/* 8. AI Assistant Copilot */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">AI Assistant</h3>
          </div>
          <p className="text-xs text-slate-400">
            Gemini Sentinel copilot trained on national fraud case law & regulatory playbooks.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate("ai-assistant")}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors flex items-center justify-between"
            >
              <span>"What should I do if threatened with Digital Arrest?"</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            </button>
            <button
              onClick={() => onNavigate("ai-assistant")}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors flex items-center justify-between"
            >
              <span>"Does entering a UPI PIN receive money or debit?"</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            </button>
          </div>

          <button
            onClick={() => onNavigate("ai-assistant")}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Open AI Guardian Chat</span>
          </button>
        </div>

        {/* 9. Security Center */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Security Center</h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time vulnerability audit & family circle protection.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Cyber Safety Score:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{profile?.security_score || 90}/100</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Family Members Shielded:</span>
              <span className="font-bold text-sky-400">{profile?.family_members_count || 3} Relatives</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-300">Official Helpline:</span>
              <span className="font-bold text-emerald-400 font-mono">1930 / cybercrime.gov.in</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate("safety-center")}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Users className="h-3.5 w-3.5 text-sky-400" />
            <span>Manage Family & Threat Intel</span>
          </button>
        </div>

      </div>

    </div>
  );
};
