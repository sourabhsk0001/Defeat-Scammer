"use client";

import React from "react";
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Lock, 
  AlertTriangle, 
  Bot, 
  TrendingUp, 
  Eye, 
  CheckCircle2, 
  Flame,
  LifeBuoy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LandingPageProps {
  onOpenSignUp: () => void;
  onOpenLogin: () => void;
  onQuickDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenSignUp,
  onOpenLogin,
  onQuickDemo,
}) => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              FINACCESS-AI
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenLogin}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-900 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onOpenSignUp}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-cyan-600/30 transition-transform active:scale-95"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-20">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-inner">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Autonomous Financial Cyber-Defense & Anti-Scam Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Stop Scammers Before They Touch Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Hard-Earned Money
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Powered by Google Gemini AI, pgvector knowledge retrieval, and machine learning anomaly detection. Real-time protection against digital arrests, fake electricity bills, and malicious money trails.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenSignUp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <span>Get Protected Now — Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onQuickDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Instant Live Demo</span>
            </button>
          </div>
        </div>

        {/* Live Threat Bar */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-400">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Active Threat Interception Network</div>
              <div className="text-xs text-slate-400">3,420 cyber extortion vectors neutralized across 12 banking institutions today</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" /> 99.8% Scam Intercept Rate
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-semibold">1930 Cyber Helpline Connected</span>
          </div>
        </div>

        {/* Feature Grid: 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800/90 space-y-3">
            <div className="p-3 w-fit rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">AI Scam Shield</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-channel detector inspecting SMS, WhatsApp, voice calls, fake receipt screenshots, and phishing URLs in seconds.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800/90 space-y-3">
            <div className="p-3 w-fit rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">ML Risk Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unsupervised anomaly algorithms detecting carding tests, off-peak velocity spikes, and high-risk offshore gateways.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800/90 space-y-3">
            <div className="p-3 w-fit rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Emergency SOS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              1-Click Golden Hour panic freeze protocol, direct 1930 cyber reporting, and auto-generated zero-liability bank dispute letters.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800/90 space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Family Circle Shield</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Shared guardian protection shielding elderly parents and student dependents from social engineering extortion calls.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">FinAccess-AI Sentinel</span>
            <span>• Next-Gen Anti-Scam Security for Digital Banking</span>
          </div>
          <div>
            <span>Official Cyber Crime Helpline: <strong className="text-emerald-400 font-mono">1930</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
