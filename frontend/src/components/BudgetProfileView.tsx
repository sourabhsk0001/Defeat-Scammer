"use client";

import React, { useState } from "react";
import { 
  PieChart, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  Save, 
  SlidersHorizontal 
} from "lucide-react";
import { UserProfile, BudgetSummary, api } from "@/lib/api";

interface BudgetProfileViewProps {
  profile: UserProfile | null;
  budgets: BudgetSummary | null;
  onRefresh: () => void;
}

export const BudgetProfileView: React.FC<BudgetProfileViewProps> = ({
  profile,
  budgets,
  onRefresh
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [income, setIncome] = useState(profile?.monthly_income?.toString() || "6500");
  const [riskAppetite, setRiskAppetite] = useState(profile?.risk_appetite || "Moderate");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        name,
        monthly_income: parseFloat(income),
        risk_appetite: riskAppetite
      });
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <PieChart className="h-6 w-6 text-indigo-400" />
            <span>Financial Profile & Budget Allocation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track income sources, monthly spending thresholds, and financial resilience metrics.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-400" />
          <span>{isEditing ? "Cancel Editing" : "Configure Profile"}</span>
        </button>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <User className="h-4 w-4 text-cyan-400" />
            <span>Update Financial Parameters</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Account Holder Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Monthly Inflow / Income ($)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Investment Risk Appetite</label>
              <select
                value={riskAppetite}
                onChange={(e) => setRiskAppetite(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Conservative">Conservative (High Fraud Shield)</option>
                <option value="Moderate">Moderate (Standard)</option>
                <option value="Aggressive">Aggressive (High Frequency)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-600/25 flex items-center space-x-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : "Save Parameters"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monthly Inflow</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ${profile?.monthly_income?.toFixed(2) || "6,500.00"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified Net Payroll</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Outflow This Month</span>
            <TrendingUp className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            ${budgets?.total_spent?.toFixed(2) || "4,982.84"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Remaining Budget: <strong className="text-slate-200">${budgets?.remaining?.toFixed(2)}</strong>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Savings Ratio</span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">
            {budgets?.savings_rate || 23.3}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Status: <span className="text-emerald-400 font-semibold">Resilient Reserve</span>
          </p>
        </div>
      </div>

      {/* Advisory Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Automated Financial Health Assessment</div>
          <div className="text-xs text-slate-300 mt-0.5">{budgets?.health_advice}</div>
        </div>
      </div>

      {/* Detailed Categories Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Expense Tracking by Category</h2>
        <div className="space-y-4">
          {budgets?.categories.map((cat, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200 text-sm">{cat.category}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    cat.status === "Exceeded" 
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" 
                      : cat.status === "Warning" 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}>
                    {cat.status}
                  </span>
                </div>
                <div className="text-slate-300 font-mono">
                  ${cat.spent.toFixed(2)} / ${cat.budgeted.toFixed(2)} ({cat.percentage}%)
                </div>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-700 ${
                    cat.status === "Exceeded" ? "bg-rose-500" : cat.status === "Warning" ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                />
              </div>

              {cat.status === "Exceeded" && (
                <div className="text-[11px] text-rose-400/90 flex items-center space-x-1.5 pt-1">
                  <span>⚠️ Unplanned spending spike of ${(cat.spent - cat.budgeted).toFixed(2)} detected in this bucket.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
