"use client";

import React from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  ExternalLink,
  Search,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import { UserProfile, Transaction, BudgetSummary } from "@/lib/api";

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
  const anomalies = transactions.filter(t => t.is_anomaly);
  const securityScore = profile?.security_score ?? 90;
  const healthScore = profile?.financial_health_score ?? 85;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner: Status & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-cyan-400 mb-1">
              <Cpu className="h-3.5 w-3.5" />
              <span>Multi-Layer Fraud Defense Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {profile?.name || "Guardian Agent"}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Your accounts are protected under the <span className="text-indigo-300 font-semibold">{profile?.protection_tier}</span> tier. AI anomaly scanning and scam shield are monitoring 24/7.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate("scam-shield")}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-600/25"
            >
              <Search className="h-4 w-4" />
              <span>Scan Message / URL</span>
            </button>
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-medium text-sm transition-all"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Emergency Help</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Security Score */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cyber Safety Score</span>
            <ShieldCheck className={`h-5 w-5 ${securityScore > 80 ? "text-emerald-400" : "text-amber-400"}`} />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{securityScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-700 ${
                securityScore > 80 ? "bg-emerald-400" : securityScore > 60 ? "bg-amber-400" : "bg-rose-500"
              }`} 
              style={{ width: `${securityScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {securityScore > 80 ? "Ultra-Low Risk Profile" : "Anomalous transfers flagged"}
          </p>
        </div>

        {/* Metric 2: Financial Health */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Financial Health</span>
            <TrendingUp className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{healthScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${healthScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Savings Rate: <span className="text-indigo-300 font-semibold">{budgets?.savings_rate ?? 0}%</span>
          </p>
        </div>

        {/* Metric 3: Active Anomalies */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Flagged Anomalies</span>
            <AlertTriangle className={`h-5 w-5 ${anomalies.length > 0 ? "text-rose-400 animate-pulse" : "text-slate-500"}`} />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${anomalies.length > 0 ? "text-rose-400" : "text-white"}`}>
              {anomalies.length}
            </span>
            <span className="text-xs text-slate-400">active alerts</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>High-Risk Transfers</span>
            <button 
              onClick={() => onNavigate("transactions")}
              className="text-cyan-400 hover:underline flex items-center"
            >
              Inspect <ChevronRight className="h-3 w-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Metric 4: Family Members Shield */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Family Shield</span>
            <Users className="h-5 w-5 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{profile?.family_members_count || 3}</span>
            <span className="text-xs text-slate-400">protected users</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>7 Scams Intercepted</span>
            <button 
              onClick={() => onNavigate("safety-center")}
              className="text-cyan-400 hover:underline flex items-center"
            >
              Manage <ChevronRight className="h-3 w-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Flagged Anomaly & Spending Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions & Anomalies (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Live Transaction Monitor & ML Flags</h2>
              <p className="text-xs text-slate-400">Real-time risk scoring using statistical anomaly detection</p>
            </div>
            <button
              onClick={() => onNavigate("transactions")}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl border ${
                    tx.is_anomaly 
                      ? "bg-rose-950/50 border-rose-500/40 text-rose-400" 
                      : tx.type === "credit"
                      ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-800/80 border-slate-700 text-slate-300"
                  }`}>
                    {tx.is_anomaly ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : tx.type === "credit" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                      <span>{tx.title}</span>
                      {tx.is_anomaly && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          ANOMALY ({tx.risk_score}%)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {tx.merchant} • {tx.date} • {tx.location}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold font-mono ${
                    tx.type === "credit" ? "text-emerald-400" : "text-slate-100"
                  }`}>
                    {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {tx.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget & Health Overview (1 col) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800/90 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Monthly Budget Status</h2>
            <p className="text-xs text-slate-400 mb-4">Total Spent vs Allocated Limit</p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Total Budget</span>
                <span className="font-semibold text-slate-200">${budgets?.total_budget?.toFixed(2) || "5,100.00"}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Total Spent</span>
                <span className="font-semibold text-rose-400">${budgets?.total_spent?.toFixed(2) || "4,982.84"}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-indigo-500" 
                  style={{ width: `${Math.min(100, ((budgets?.total_spent || 0) / (budgets?.total_budget || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {budgets?.categories.slice(0, 3).map((cat, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{cat.category}</span>
                    <span className={cat.status === "Exceeded" ? "text-rose-400 font-bold" : "text-slate-400"}>
                      ${cat.spent.toFixed(0)} / ${cat.budgeted.toFixed(0)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
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

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate("budget")}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Explore Budget & Savings Analysis</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
