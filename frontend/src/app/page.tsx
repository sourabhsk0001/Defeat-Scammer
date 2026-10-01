"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LandingPage } from "@/components/LandingPage";
import { AuthModal } from "@/components/AuthModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { DashboardView } from "@/components/DashboardView";
import { ScamShieldView } from "@/components/ScamShieldView";
import { TransactionsView } from "@/components/TransactionsView";
import { BudgetProfileView } from "@/components/BudgetProfileView";
import { AIAssistantView } from "@/components/AIAssistantView";
import { SafetyCenterView } from "@/components/SafetyCenterView";
import { MoneyTrailView } from "@/components/MoneyTrailView";
import { FinancialChartsView } from "@/components/FinancialChartsView";
import { RiskEngineView } from "@/components/RiskEngineView";
import { MLAnomalyView } from "@/components/MLAnomalyView";
import { EmergencySOSModal } from "@/components/EmergencySOSModal";
import { api, UserProfile, Transaction, BudgetSummary } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  // Navigation & View Flow State: 'landing' | 'dashboard'
  const [viewState, setViewState] = useState<"landing" | "dashboard">("landing");
  
  // Auth & Onboarding Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("signup");
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Tab State within Dashboard
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

  // Auth Handlers
  const handleOpenSignUp = () => {
    setAuthModalMode("signup");
    setAuthModalOpen(true);
  };

  const handleOpenLogin = () => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
  };

  const handleQuickDemo = async () => {
    try {
      const res = await api.login({ email: "alex.morgan@guardian.io", password: "password123" });
      setProfile(res.user);
      setViewState("dashboard");
    } catch (err) {
      console.error(err);
      setViewState("dashboard");
    }
  };

  const handleAuthSuccess = (user: UserProfile, requiresOnboarding: boolean) => {
    setProfile(user);
    setAuthModalOpen(false);

    if (requiresOnboarding) {
      setOnboardingOpen(true);
    } else {
      setViewState("dashboard");
    }
  };

  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setOnboardingOpen(false);
    setViewState("dashboard");
    fetchData();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setViewState("landing");
  };

  // If on Landing Page, render the high-impact Landing Page
  if (viewState === "landing") {
    return (
      <>
        <LandingPage
          onOpenSignUp={handleOpenSignUp}
          onOpenLogin={handleOpenLogin}
          onQuickDemo={handleQuickDemo}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
        <OnboardingModal
          isOpen={onboardingOpen}
          user={profile}
          onComplete={handleOnboardingComplete}
        />
      </>
    );
  }

  // Dashboard View (Authenticated State)
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSOS={() => setIsSOSOpen(true)}
        backendOnline={backendOnline}
        userName={profile?.name}
        onLogout={handleLogout}
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
            {activeTab === "visualizations" && <FinancialChartsView />}
            {activeTab === "risk-engine" && <RiskEngineView />}
            {activeTab === "ml-anomaly" && <MLAnomalyView />}
            {activeTab === "scam-shield" && <ScamShieldView />}
            {activeTab === "transactions" && (
              <TransactionsView
                transactions={transactions}
                onRefresh={fetchData}
                onNavigate={(tab) => setActiveTab(tab)}
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

      {/* Onboarding Modal in case triggered */}
      <OnboardingModal
        isOpen={onboardingOpen}
        user={profile}
        onComplete={handleOnboardingComplete}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">FinAccess-AI Sentinel</span>
            <span>• Built for Citizen Cybersecurity & Anti-Fraud Protection</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Helpline: <strong className="text-emerald-400 font-mono">1930 / cybercrime.gov.in</strong></span>
            <span>Next.js 15 + FastAPI + Supabase + Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
