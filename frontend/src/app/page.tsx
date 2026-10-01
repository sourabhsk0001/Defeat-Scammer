"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardView } from "@/components/DashboardView";
import { ScamShieldView } from "@/components/ScamShieldView";
import { TransactionsView } from "@/components/TransactionsView";
import { BudgetProfileView } from "@/components/BudgetProfileView";
import { AIAssistantView } from "@/components/AIAssistantView";
import { SafetyCenterView } from "@/components/SafetyCenterView";
import { MoneyTrailView } from "@/components/MoneyTrailView";
import { EmergencySOSModal } from "@/components/EmergencySOSModal";
import { api, UserProfile, Transaction, BudgetSummary } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // Core Data State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [pData, tData, bData] = await Promise.all([
        api.getProfile(),
        api.getTransactions(),
        api.getBudgets(),
      ]);
      setProfile(pData);
      setTransactions(tData);
      setBudgets(bData);
      setBackendOnline(true);
    } catch (err) {
      console.warn("Backend offline or unreachable:", err);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSOS={() => setIsSOSOpen(true)}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-400">Initializing Cyber-Fraud Guardian Defense...</div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                profile={profile}
                transactions={transactions}
                budgets={budgets}
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenSOS={() => setIsSOSOpen(true)}
              />
            )}
            {activeTab === "scam-shield" && <ScamShieldView />}
            {activeTab === "transactions" && (
              <TransactionsView
                transactions={transactions}
                onRefresh={fetchData}
              />
            )}
            {activeTab === "budget" && (
              <BudgetProfileView
                profile={profile}
                budgets={budgets}
                onRefresh={fetchData}
              />
            )}
            {activeTab === "ai-assistant" && <AIAssistantView />}
            {activeTab === "safety-center" && <SafetyCenterView />}
            {activeTab === "money-trail" && <MoneyTrailView />}
          </>
        )}
      </main>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Defeat Scammer AI & Financial Sentinel</span>
            <span>• Built for Citizen Cybersecurity & Anti-Fraud Protection</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Helpline: <strong className="text-emerald-400 font-mono">1930 / cybercrime.gov.in</strong></span>
            <span>Next.js 15 + FastAPI + Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
