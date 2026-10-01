"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Loader2, 
  DollarSign, 
  Briefcase, 
  Globe, 
  Target, 
  Calendar, 
  User as UserIcon,
  Sparkles
} from "lucide-react";
import { api, OnboardingPayload, UserProfile } from "@/lib/api";

interface OnboardingModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onComplete: (updatedProfile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  user,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // The 7 Required Fields
  const [name, setName] = useState(user?.name || "");
  const [ageRange, setAgeRange] = useState("26-35");
  const [occupation, setOccupation] = useState("Software & Tech");
  const [monthlyIncome, setMonthlyIncome] = useState("6500");
  const [monthlyExpenses, setMonthlyExpenses] = useState("3200");
  const [financialGoal, setFinancialGoal] = useState("Build Emergency Fraud Reserve");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const ageRanges = ["18-25", "26-35", "36-50", "51-65", "65+"];
  
  const occupations = [
    "Software & Tech",
    "Healthcare & Medicine",
    "Finance & Banking",
    "Education & Academics",
    "Business Owner / Enterprise",
    "Freelancer / Creative",
    "Student",
    "Retired",
    "Other"
  ];

  const financialGoals = [
    "Build Emergency Fraud Reserve",
    "Secure Retirement Nest Egg",
    "Aggressive Wealth Growth",
    "Debt Elimination & Freedom",
    "Protect Family & Elder Assets"
  ];

  const languages = [
    "English",
    "Spanish (Español)",
    "Hindi (हिंदी)",
    "French (Français)",
    "German (Deutsch)",
    "Mandarin (中文)"
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: OnboardingPayload = {
        name: name || user?.name || "Guardian User",
        age_range: ageRange,
        occupation,
        monthly_income: parseFloat(monthlyIncome) || 0,
        monthly_expenses: parseFloat(monthlyExpenses) || 0,
        financial_goal: financialGoal,
        preferred_language: preferredLanguage
      };
      const res = await api.completeOnboarding(payload);
      if (res.status === "success") {
        onComplete(res.user);
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const incomeVal = parseFloat(monthlyIncome) || 0;
  const expenseVal = parseFloat(monthlyExpenses) || 0;
  const netSavings = Math.max(0, incomeVal - expenseVal);
  const savingsPct = incomeVal > 0 ? Math.round((netSavings / incomeVal) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-slate-950 border border-cyan-500/30 p-6 md:p-8 shadow-2xl text-slate-100">
        
        {/* Header with Step Indicators */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Financial Guardian Onboarding</h2>
                <p className="text-[11px] text-slate-400">Calibrating your personal threat profile & baseline metrics</p>
              </div>
            </div>
            <div className="text-xs font-mono text-cyan-400 font-bold">
              STEP {step} OF 3
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Personal Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-cyan-400" />
              <span>Step 1: Identity & Demographics</span>
            </h3>

            {/* 1. Name */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* 2. Age Range */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">Age Range</label>
              <div className="grid grid-cols-5 gap-2">
                {ageRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAgeRange(range)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      ageRange === range
                        ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              {ageRange === "65+" && (
                <div className="text-[11px] text-amber-300 mt-1">
                  🛡️ Special high-priority Grandparent Scam & Voice Deepfake Defense will be activated automatically.
                </div>
              )}
            </div>

            {/* 3. Occupation */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">Primary Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            {/* 7. Preferred Language */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">Preferred Language for AI Assistant & Alerts</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-cyan-600/25 flex items-center space-x-1.5"
              >
                <span>Continue to Financial Baseline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Financial Baseline */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Step 2: Financial Parameters & Goals</span>
            </h3>

            {/* 4. Monthly Income & 5. Monthly Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Monthly Inflow / Income ($)</label>
                <input
                  type="number"
                  required
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="6500"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Monthly Expenses ($)</label>
                <input
                  type="number"
                  required
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  placeholder="3200"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* 6. Financial Goal */}
            <div>
              <label className="text-xs text-slate-300 block mb-1">Primary Financial Security Goal</label>
              <select
                value={financialGoal}
                onChange={(e) => setFinancialGoal(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {financialGoals.map((goal) => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <div className="text-slate-400 font-medium">Estimated Monthly Margin:</div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black font-mono text-emerald-400">+${netSavings.toFixed(2)}/mo</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {savingsPct}% Savings Ratio
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-semibold hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-cyan-600/25 flex items-center space-x-1.5"
              >
                <span>Calibrate Threat Shield</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Calibration Preview */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Step 3: Verification & Sentinel Activation</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Beneficiary Name:</span>
                  <span className="font-bold text-white">{name || "Guardian User"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Age Demographic:</span>
                  <span className="font-bold text-white">{ageRange} Years</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Occupation:</span>
                  <span className="font-bold text-white">{occupation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Interface Language:</span>
                  <span className="font-bold text-cyan-400">{preferredLanguage}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px]">Target Security Goal:</span>
                <span className="font-bold text-indigo-300">{financialGoal}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center space-x-3 text-xs text-emerald-300">
              <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-400" />
              <div>
                <strong className="text-white block font-semibold">Tier: {ageRange === "65+" ? "Elder Shield Ultra" : "Ultra Sentinel"} Active</strong>
                <span>AI Anomaly ML & RAG Scam Shield models configured for your profile.</span>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs font-semibold hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/25 flex items-center space-x-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>{loading ? "Activating Sentinel..." : "Launch Sentinel Dashboard"}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
