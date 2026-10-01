"use client";

import React from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  CreditCard, 
  PieChart, 
  Bot, 
  Users, 
  GitFork, 
  LifeBuoy
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSOS: () => void;
  backendOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSOS,
  backendOnline
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "scam-shield", label: "Scam Shield", icon: ShieldCheck },
    { id: "transactions", label: "Transactions & ML", icon: CreditCard },
    { id: "budget", label: "Budget & Health", icon: PieChart },
    { id: "ai-assistant", label: "AI Sentinel", icon: Bot },
    { id: "safety-center", label: "Threats & Family", icon: Users },
    { id: "money-trail", label: "Money Trail", icon: GitFork },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                DEFEAT SCAMMER
              </span>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                <span className={`inline-block h-2 w-2 rounded-full ${backendOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`}></span>
                <span>{backendOnline ? "AI & Risk Engine Online" : "Backend Offline"}</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action button: EMERGENCY SOS */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-600/30 animate-pulse transition-transform active:scale-95"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>EMERGENCY SOS</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav row */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-900 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs whitespace-nowrap ${
                  isActive
                    ? "bg-slate-800 text-cyan-400 font-medium"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
