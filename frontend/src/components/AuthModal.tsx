"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Loader2, 
  Zap, 
  AlertCircle 
} from "lucide-react";
import { api } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  initialMode: "login" | "signup";
  onClose: () => void;
  onSuccess: (user: any, requiresOnboarding: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await api.signUp({
          full_name: fullName,
          email,
          password
        });
        if (res.status === "success") {
          onSuccess(res.user, true); // New user always requires onboarding
        } else {
          setErrorMsg(res.detail || "Sign up failed. Please try again.");
        }
      } else {
        const res = await api.login({ email, password });
        if (res.status === "success") {
          onSuccess(res.user, res.requires_onboarding);
        } else {
          setErrorMsg(res.detail || "Invalid login credentials.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Authentication error. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      const res = await api.login({ email: "alex.morgan@guardian.io", password: "password123" });
      onSuccess(res.user, false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center mb-3">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-black text-white">
            {mode === "signup" ? "Create Your Sentinel Account" : "Access FinAccess-AI Sentinel"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "signup"
              ? "Join the multi-layer fraud defense network"
              : "Verify your credentials to view your financial security dashboard"}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span>{mode === "signup" ? "Create Account & Proceed" : "Sign In to Sentinel"}</span>
          </button>
        </form>

        {/* Demo Quick Login */}
        <div className="mt-4 pt-4 border-t border-slate-900">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Instant Demo Login (Alex Morgan)</span>
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {mode === "signup" ? (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Log In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
