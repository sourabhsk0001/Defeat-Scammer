"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  MessageSquare, 
  Mail,
  CreditCard,
  MessageCircle,
  Image as ImageIcon, 
  Mic, 
  CheckCircle2, 
  AlertOctagon, 
  Loader2,
  Sparkles,
  ArrowRight,
  Layers,
  Copy,
  ExternalLink,
  Info,
  PhoneCall,
  Flame,
  FileWarning,
  Search,
  Server,
  Hash,
  Radar,
  Lock,
  Unlock,
  ShieldAlert
} from "lucide-react";
import { 
  api, 
  ScamShieldScanRequest, 
  ScamShieldScanResult,
  URLAnalysisResult,
  ScreenshotAnalysisResult, 
  VoiceAnalysisResult 
} from "@/lib/api";

export const ScamShieldView: React.FC = () => {
  // Main Navigation: Unified Scam Shield (Primary) vs URL Analyzer vs Advanced Modalities
  const [activeTab, setActiveTab] = useState<"unified" | "url" | "screenshot" | "voice">("unified");

  // Input Channels: SMS | WhatsApp | Email | URL | Payment
  const [inputChannel, setInputChannel] = useState<"sms" | "whatsapp" | "email" | "url" | "payment">("sms");
  const [contentInput, setContentInput] = useState<string>("");
  const [senderInfo, setSenderInfo] = useState<string>("VM-POWERDEPT");
  const [subjectInfo, setSubjectInfo] = useState<string>("");

  // Scan Results & Loading
  const [scanResult, setScanResult] = useState<ScamShieldScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Phase 10: URL Analyzer State
  const [targetURL, setTargetURL] = useState<string>("https://sbi-banking-kyc-update.xyz/login?account=confirm");
  const [urlAnalysisResult, setUrlAnalysisResult] = useState<URLAnalysisResult | null>(null);
  const [loadingURL, setLoadingURL] = useState<boolean>(false);

  // Advanced Modality States
  const [screenshotScenario, setScreenshotScenario] = useState("fake_receipt");
  const [screenshotResult, setScreenshotResult] = useState<ScreenshotAnalysisResult | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);

  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceResult, setVoiceResult] = useState<VoiceAnalysisResult | null>(null);
  const [loadingVoice, setLoadingVoice] = useState(false);

  // Pre-load default template on mount
  useEffect(() => {
    loadPreset("sms_electricity");
  }, []);

  const loadPreset = (preset: "sms_electricity" | "whatsapp_digital_arrest" | "email_kyc" | "url_phishing" | "payment_upi_pin") => {
    if (preset === "sms_electricity") {
      setInputChannel("sms");
      setSenderInfo("VM-POWERCUT");
      setContentInput("Dear Consumer, Your electricity power supply will be disconnected tonight at 09:30 PM because your previous month bill was not updated. Please immediately update your bill payment via link: http://ebill-update.xyz or call Electricity Officer at 98112-99881.");
      handleExecuteScan({
        input_type: "sms",
        sender_info: "VM-POWERCUT",
        content: "Dear Consumer, Your electricity power supply will be disconnected tonight at 09:30 PM because your previous month bill was not updated. Please immediately update your bill payment via link: http://ebill-update.xyz or call Electricity Officer at 98112-99881."
      });
    } else if (preset === "whatsapp_digital_arrest") {
      setInputChannel("whatsapp");
      setSenderInfo("+92-300-8849120");
      setContentInput("This is Senior Officer Deshmukh from Cyber Crime HQ CBI. A DHL courier in your name with 5 fake passports and narcotic contraband was seized at the airport. You are under Digital Arrest. Stay on WhatsApp call. Do not disclose this to anyone. Transfer verification bond or warrant executes within 2 hours.");
      handleExecuteScan({
        input_type: "whatsapp",
        sender_info: "+92-300-8849120",
        content: "This is Senior Officer Deshmukh from Cyber Crime HQ CBI. A DHL courier in your name with 5 fake passports and narcotic contraband was seized at the airport. You are under Digital Arrest. Stay on WhatsApp call. Do not disclose this to anyone. Transfer verification bond or warrant executes within 2 hours."
      });
    } else if (preset === "email_kyc") {
      setInputChannel("email");
      setSenderInfo("security-alert@sbi-online.auth-portal.xyz");
      setSubjectInfo("CRITICAL: Your NetBanking Account is Suspended - Action Required");
      setContentInput("Dear Customer, Your State Bank account access has been suspended due to pending KYC verification. Please click the secure link below to update your PAN and submit your NetBanking password & OTP to restore account: https://sbi-kyc-reactivate.xyz/login. Failure to update within 24 hours will lead to permanent deactivation.");
      handleExecuteScan({
        input_type: "email",
        sender_info: "security-alert@sbi-online.auth-portal.xyz",
        subject: "CRITICAL: Your NetBanking Account is Suspended - Action Required",
        content: "Dear Customer, Your State Bank account access has been suspended due to pending KYC verification. Please click the secure link below to update your PAN and submit your NetBanking password & OTP to restore account: https://sbi-kyc-reactivate.xyz/login. Failure to update within 24 hours will lead to permanent deactivation."
      });
    } else if (preset === "url_phishing") {
      setInputChannel("url");
      setSenderInfo("https://bit.ly/sbi-verify-kyc");
      setContentInput("http://sbi-banking-kyc-update.xyz/verify/login.php?session=secure_login&user=auth");
      handleExecuteScan({
        input_type: "url",
        content: "http://sbi-banking-kyc-update.xyz/verify/login.php?session=secure_login&user=auth"
      });
    } else if (preset === "payment_upi_pin") {
      setInputChannel("payment");
      setSenderInfo("OLX Buyer Payee");
      setContentInput("₹8,500 OLX Advance Refund Approved! Scan this UPI QR code and enter your 6-digit UPI PIN immediately to claim and receive payment into your bank account. Do not delay, link expires in 10 minutes.");
      handleExecuteScan({
        input_type: "payment",
        sender_info: "OLX Buyer Payee",
        content: "₹8,500 OLX Advance Refund Approved! Scan this UPI QR code and enter your 6-digit UPI PIN immediately to claim and receive payment into your bank account. Do not delay, link expires in 10 minutes."
      });
    }
  };

  const handleExecuteScan = async (override?: Partial<ScamShieldScanRequest>) => {
    const payload: ScamShieldScanRequest = {
      content: override?.content ?? contentInput,
      input_type: override?.input_type ?? inputChannel,
      sender_info: override?.sender_info ?? senderInfo,
      subject: override?.subject ?? subjectInfo
    };

    if (!payload.content.trim()) return;

    setLoading(true);
    try {
      const res = await api.scanScamShield(payload);
      setScanResult(res);
    } catch (err) {
      console.error("Scam shield scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!scanResult) return;
    const reportText = `${scanResult.verdict_banner}

Risk: ${scanResult.risk_level}

Indicators:
${scanResult.indicators.map(i => `• ${i}`).join("\n")}

Recommended action:
${scanResult.recommended_actions.map(a => a).join("\n")}

Category: ${scanResult.scam_category}
Helpline: 1930 / cybercrime.gov.in`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunURLAnalysis = async (urlToScan?: string) => {
    const raw = (urlToScan || targetURL).trim();
    if (!raw) return;
    setLoadingURL(true);
    try {
      const res = await api.analyzeURL(raw);
      setUrlAnalysisResult(res);
      setTargetURL(raw);
    } catch (err) {
      console.error("URL analysis failed:", err);
    } finally {
      setLoadingURL(false);
    }
  };

  const urlTestPresets = [
    {
      title: "SBI Banking KYC Phishing (.xyz)",
      url: "https://sbi-banking-kyc-update.xyz/login?account=confirm",
      desc: "Brand Impersonation + High-Abuse TLD"
    },
    {
      title: "@ Auth Redirection Spoof",
      url: "http://google.com@evil-phishing.top/verify-pan",
      desc: "Browser auth syntax cloaking destination"
    },
    {
      title: "Direct IP Host & Non-Standard Port",
      url: "http://192.168.1.100:8080/ebill-update.apk",
      desc: "Bypasses DNS domain reputation checks"
    },
    {
      title: "Algorithmic DGA Subdomain Nesting",
      url: "http://secure.login.update.account.x89zq7a2b91c.cam/wallet",
      desc: "High Shannon entropy (DGA) + 4-level nesting"
    },
    {
      title: "Official Bank Portal (Verified)",
      url: "https://www.onlinesbi.sbi/",
      desc: "Legitimate domain with valid SSL certificate"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <span>SCAM SHIELD</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  PHASE 9 & 10
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified Multi-Channel Fraud Defense • Phase 10 URL Threat Forensics Pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Modality Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("unified")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "unified"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Unified Scam Shield
          </button>
          <button
            onClick={() => {
              setActiveTab("url");
              if (!urlAnalysisResult) {
                handleRunURLAnalysis("https://sbi-banking-kyc-update.xyz/login?account=confirm");
              }
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === "url"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>URL Analyzer (Phase 10)</span>
          </button>
          <button
            onClick={() => setActiveTab("screenshot")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "screenshot"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Screenshot OCR
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "voice"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Voice Deepfake
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          UNIFIED SCAM SHIELD TAB
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "unified" && (
        <div className="space-y-6">

          {/* 6-STEP FLOW PIPELINE BANNER */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Scam Shield Unified Architecture Pipeline:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 font-mono font-bold">STEP 1</span>
                <div className="font-bold text-white">User Input</div>
                <div className="text-[10px] text-slate-500">5 Channels</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-indigo-400 font-mono font-bold">STEP 2</span>
                <div className="font-bold text-white">Text Extraction</div>
                <div className="text-[10px] text-slate-500">Normalization</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-sky-400 font-mono font-bold">STEP 3</span>
                <div className="font-bold text-white">URL Extraction</div>
                <div className="text-[10px] text-slate-500">Link Hunter</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-mono font-bold">STEP 4</span>
                <div className="font-bold text-white">Pattern Detect</div>
                <div className="text-[10px] text-slate-500">4 Heuristics</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-purple-400 font-mono font-bold">STEP 5</span>
                <div className="font-bold text-white">AI Analysis</div>
                <div className="text-[10px] text-slate-500">Gemini Sentinel</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1">
                <span className="text-[10px] text-rose-400 font-mono font-bold">STEP 6</span>
                <div className="font-bold text-white">Risk Engine</div>
                <div className="text-[10px] text-slate-500">Explanation</div>
              </div>
            </div>
          </div>

          {/* 5 INPUT CHANNELS TABS & ATTACK SIGNATURE PRESETS */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "sms", label: "SMS", icon: MessageSquare, preset: "sms_electricity" },
                { id: "whatsapp", label: "WhatsApp message", icon: MessageCircle, preset: "whatsapp_digital_arrest" },
                { id: "email", label: "Email", icon: Mail, preset: "email_kyc" },
                { id: "url", label: "Website URL", icon: Globe, preset: "url_phishing" },
                { id: "payment", label: "Payment message", icon: CreditCard, preset: "payment_upi_pin" },
              ].map((ch) => {
                const Icon = ch.icon;
                const isActive = inputChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setInputChannel(ch.id as any);
                      loadPreset(ch.preset as any);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30"
                        : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Test Presets Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 text-[11px] font-semibold">Test Signatures:</span>
              <button
                onClick={() => loadPreset("sms_electricity")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                Electricity Cutoff (SMS)
              </button>
              <button
                onClick={() => loadPreset("whatsapp_digital_arrest")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                Digital Arrest Warrant (WhatsApp)
              </button>
              <button
                onClick={() => loadPreset("email_kyc")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                NetBanking Suspended (Email)
              </button>
              <button
                onClick={() => loadPreset("url_phishing")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                Phishing Portal (Website URL)
              </button>
              <button
                onClick={() => loadPreset("payment_upi_pin")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                UPI PIN to Receive (Payment)
              </button>
            </div>
          </div>

          {/* MAIN TWO-COLUMN WORKSPACE: INPUT (LEFT) & OUTPUT (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: Input Area (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                      {inputChannel === "sms" && <MessageSquare className="h-4 w-4" />}
                      {inputChannel === "whatsapp" && <MessageCircle className="h-4 w-4" />}
                      {inputChannel === "email" && <Mail className="h-4 w-4" />}
                      {inputChannel === "url" && <Globe className="h-4 w-4" />}
                      {inputChannel === "payment" && <CreditCard className="h-4 w-4" />}
                    </span>
                    <h2 className="text-base font-bold text-white capitalize">
                      {inputChannel} Input
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    Step 1: Input Payload
                  </span>
                </div>

                {/* Sender Identifier */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Sender / Source Identifier
                  </label>
                  <input
                    type="text"
                    value={senderInfo}
                    onChange={(e) => setSenderInfo(e.target.value)}
                    placeholder={
                      inputChannel === "sms" ? "e.g. VM-HDFCBK, +91-9876543210" :
                      inputChannel === "whatsapp" ? "e.g. +92-300-1234567" :
                      inputChannel === "email" ? "e.g. support@sbi-verify.xyz" :
                      inputChannel === "url" ? "e.g. Host / Domain" :
                      "e.g. UPI Collect Requester"
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Email Subject if Email */}
                {inputChannel === "email" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email Subject Line</label>
                    <input
                      type="text"
                      value={subjectInfo}
                      onChange={(e) => setSubjectInfo(e.target.value)}
                      placeholder="e.g. URGENT: Account Suspension Notice"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {/* Content Textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {inputChannel === "url" ? "Target Website URL" : "Message Content / Raw Text"}
                  </label>
                  <textarea
                    rows={inputChannel === "url" ? 3 : 7}
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                    placeholder={
                      inputChannel === "url" 
                        ? "Paste URL (e.g. http://sbi-banking-kyc.xyz/login.php)..." 
                        : "Paste full SMS, WhatsApp message, email body, or payment request..."
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans placeholder-slate-500"
                  />
                </div>

                {/* Scan Button */}
                <button
                  onClick={() => handleExecuteScan()}
                  disabled={loading || !contentInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Executing 6-Step Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Analyze Threat with Scam Shield</span>
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* RIGHT: Output Area (7 Cols) — EXACT OUTPUT FORMAT */}
            <div className="lg:col-span-7 space-y-4">
              {scanResult ? (
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      EXACT OUTPUT SPECIFICATION FROM PROMPT:
                      ⚠️ Potential Scam
                      Risk: HIGH
                      Indicators:
                      • Urgent language
                      • Requests sensitive information
                      • Suspicious URL
                      • Account-threat language
                      Recommended action:
                      Do not click the link.
                      Do not share OTP/PIN.
                      Verify through the official channel.
                      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                  <div className={`p-6 rounded-2xl border transition-all ${
                    scanResult.risk_level === "CRITICAL"
                      ? "bg-rose-950/40 border-rose-500/60 shadow-xl shadow-rose-950/50"
                      : scanResult.risk_level === "HIGH"
                      ? "bg-amber-950/40 border-amber-500/60 shadow-xl shadow-amber-950/50"
                      : scanResult.risk_level === "MODERATE"
                      ? "bg-indigo-950/40 border-indigo-500/60"
                      : "bg-emerald-950/40 border-emerald-500/60"
                  }`}>
                    
                    {/* Header: ⚠️ Potential Scam & Risk Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <h2 className={`text-2xl font-black tracking-tight flex items-center space-x-2 ${
                          scanResult.risk_level === "CRITICAL" ? "text-rose-400" :
                          scanResult.risk_level === "HIGH" ? "text-amber-400" :
                          scanResult.risk_level === "MODERATE" ? "text-indigo-400" : "text-emerald-400"
                        }`}>
                          <span>{scanResult.verdict_banner}</span>
                        </h2>
                        <div className="text-xs text-slate-300 font-semibold mt-1">
                          Category: <span className="text-white">{scanResult.scam_category}</span>
                        </div>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <div className="text-xs text-slate-400 font-semibold">Threat Level</div>
                        <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                          scanResult.risk_level === "CRITICAL" ? "text-rose-400" :
                          scanResult.risk_level === "HIGH" ? "text-amber-400" :
                          scanResult.risk_level === "MODERATE" ? "text-indigo-400" : "text-emerald-400"
                        }`}>
                          Risk: {scanResult.risk_level}
                          <span className="text-xs font-mono text-slate-400 block sm:inline sm:ml-1">
                            ({scanResult.risk_score}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Indicators Section */}
                    <div className="py-4 border-b border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                        <Flame className="h-3.5 w-3.5 text-amber-400" />
                        <span>Indicators:</span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-slate-200 font-medium pl-1">
                        {scanResult.indicators.map((ind, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-rose-400 font-black">•</span>
                            <span>{ind}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Action Section */}
                    <div className="pt-4 space-y-2">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Recommended action:</span>
                      </div>
                      <ul className="space-y-1.5 text-sm text-slate-200 font-medium pl-1">
                        {scanResult.recommended_actions.map((act, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-black">✓</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick Action Button Bar */}
                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        Official Helpline: <strong className="text-emerald-400 font-mono">1930 / cybercrime.gov.in</strong>
                      </div>
                      <button
                        onClick={handleCopyReport}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center space-x-1.5 transition-all"
                      >
                        <Copy className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{copied ? "Report Copied!" : "Copy Report"}</span>
                      </button>
                    </div>

                  </div>

                  {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      DEEP FORENSIC BREAKDOWN (EXTRACTED URLS & PSYCHOLOGY)
                      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Extracted URLs Inspection */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <Globe className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Extracted Links ({scanResult.extracted_urls.length}):</span>
                      </div>
                      {scanResult.extracted_urls.length === 0 ? (
                        <div className="text-xs text-slate-500 py-2">
                          No embedded hyperlinks detected in payload.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {scanResult.extracted_urls.map((u, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                              <div className="flex items-center justify-between font-mono">
                                <span className="text-cyan-400 truncate max-w-[200px]">{u.url}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  u.is_phishing ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                                }`}>
                                  {u.threat_level}
                                </span>
                              </div>
                              {u.impersonated_brand && (
                                <div className="text-[11px] text-amber-300">
                                  Spoofing Brand: <strong>{u.impersonated_brand}</strong>
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  setTargetURL(u.url);
                                  setActiveTab("url");
                                  handleRunURLAnalysis(u.url);
                                }}
                                className="mt-1 pt-1 border-t border-slate-800/80 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                              >
                                <span>Inspect in URL Analyzer</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Psychological Triggers */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <FileWarning className="h-3.5 w-3.5 text-amber-400" />
                        <span>Psychological Triggers:</span>
                      </div>
                      {scanResult.psychological_triggers.length === 0 ? (
                        <div className="text-xs text-slate-500 py-2">
                          Zero coercive triggers identified.
                        </div>
                      ) : (
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {scanResult.psychological_triggers.map((trig, i) => (
                            <li key={i} className="flex items-start space-x-1.5 text-amber-300/90">
                              <span>⚠️</span>
                              <span>{trig}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                  </div>

                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-16 text-center text-slate-500 flex flex-col items-center justify-center">
                  <ShieldCheck className="h-12 w-12 text-slate-600 mb-3" />
                  <div className="text-sm font-semibold text-slate-400">Ready to Analyze</div>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select a channel (SMS, WhatsApp, Email, URL, Payment) or choose an attack preset to view the full 6-step breakdown.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PHASE 10 TAB: URL ANALYZER PIPELINE
          User URL ➔ URL Parser ➔ Domain Analysis ➔ Threat Intelligence* ➔ Risk Engine ➔ Result
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "url" && (
        <div className="space-y-6">

          {/* 5-STEP PIPELINE BANNER */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center space-x-2">
                <Radar className="h-3.5 w-3.5 text-cyan-400" />
                <span>Phase 10 — URL Forensic Engine Pipeline Architecture:</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">urllib • tldextract • regex • Threat Intelligence</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-400 font-mono font-bold">STEP 1</span>
                <div className="font-bold text-white">User URL</div>
                <div className="text-[10px] text-slate-500">Sanitization</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-indigo-400 font-mono font-bold">STEP 2</span>
                <div className="font-bold text-white">URL Parser</div>
                <div className="text-[10px] text-slate-500">urllib + regex</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-sky-400 font-mono font-bold">STEP 3</span>
                <div className="font-bold text-white">Domain Analysis</div>
                <div className="text-[10px] text-slate-500">tldextract + Entropy</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-mono font-bold">STEP 4</span>
                <div className="font-bold text-white">Threat Intel*</div>
                <div className="text-[10px] text-slate-500">Safe Browsing • VT • URLhaus</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-rose-400 font-mono font-bold">STEP 5</span>
                <div className="font-bold text-white">Risk Engine</div>
                <div className="text-[10px] text-slate-500">Multi-Factor Scoring</div>
              </div>
            </div>
          </div>

          {/* ATTACK VECTOR PRESETS */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Select Attack Vector Preset:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {urlTestPresets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTargetURL(p.url);
                    handleRunURLAnalysis(p.url);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    targetURL === p.url
                      ? "bg-cyan-500/10 border-cyan-500/50 text-white shadow-sm"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-white truncate">{p.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* INPUT FORM */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>Target Inspection URL:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">urllib • tldextract • shannon entropy</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={targetURL}
                onChange={(e) => setTargetURL(e.target.value)}
                placeholder="https://sbi-banking-kyc-update.xyz/login?account=confirm"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleRunURLAnalysis()}
                disabled={loadingURL}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {loadingURL ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                <span>Run Forensic URL Analysis</span>
              </button>
            </div>
          </div>

          {/* URL ANALYSIS FORENSIC REPORT */}
          {urlAnalysisResult && (
            <div className="space-y-6">

              {/* VERDICT BANNER */}
              <div className={`p-6 rounded-2xl border transition-all ${
                urlAnalysisResult.threat_level === "CRITICAL"
                  ? "bg-rose-950/40 border-rose-500/60 shadow-xl shadow-rose-950/50"
                  : urlAnalysisResult.threat_level === "HIGH"
                  ? "bg-amber-950/40 border-amber-500/60 shadow-xl shadow-amber-950/50"
                  : urlAnalysisResult.threat_level === "MEDIUM"
                  ? "bg-indigo-950/40 border-indigo-500/60"
                  : "bg-emerald-950/40 border-emerald-500/60"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider font-mono ${
                        urlAnalysisResult.threat_level === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                        urlAnalysisResult.threat_level === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                        urlAnalysisResult.threat_level === "MEDIUM" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" :
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {urlAnalysisResult.is_phishing ? "⚠️ MALICIOUS PHISHING TARGET" : "🛡️ CLEAN DOMAIN"}
                      </span>
                      {urlAnalysisResult.impersonated_brand && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          IMPERSONATING: {urlAnalysisResult.impersonated_brand}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 font-mono truncate max-w-xl">
                      {urlAnalysisResult.url}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      {urlAnalysisResult.verdict_summary}
                    </p>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className="text-xs text-slate-400 font-semibold">Threat Level</span>
                    <span className={`text-3xl font-black font-mono ${
                      urlAnalysisResult.threat_level === "CRITICAL" ? "text-rose-400" :
                      urlAnalysisResult.threat_level === "HIGH" ? "text-amber-400" :
                      urlAnalysisResult.threat_level === "MEDIUM" ? "text-indigo-400" : "text-emerald-400"
                    }`}>
                      {urlAnalysisResult.threat_level}
                      <span className="text-xs font-mono text-slate-400 ml-1">({urlAnalysisResult.risk_score}%)</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Domain Reputation</span>
                    <strong className="text-white">{urlAnalysisResult.domain_reputation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">SSL Certificate</span>
                    <strong className="text-white flex items-center space-x-1">
                      {urlAnalysisResult.ssl_status.includes("Valid") ? (
                        <Lock className="h-3 w-3 text-emerald-400 inline" />
                      ) : (
                        <Unlock className="h-3 w-3 text-rose-400 inline" />
                      )}
                      <span>{urlAnalysisResult.ssl_status}</span>
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Threat Intel Feeds</span>
                    <strong className="text-cyan-400">
                      {urlAnalysisResult.threat_intelligence?.positive_detections || 0} Positive Flags
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Protocol Scheme</span>
                    <strong className="text-indigo-300 font-mono">
                      {urlAnalysisResult.url_components?.scheme.toUpperCase() || "HTTPS"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* DEEP FORENSIC BREAKDOWN: 4 CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* STEP 2: URL PARSER (urllib + regex) */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <Server className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Stage 2: URL Parser (urllib + regex)</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">RFC 3986</span>
                  </div>

                  {urlAnalysisResult.url_components ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Scheme / Protocol:</span>
                        <span className="text-white">{urlAnalysisResult.url_components.scheme}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Parsed Hostname:</span>
                        <span className="text-cyan-300 font-bold">{urlAnalysisResult.url_components.hostname}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Port Designation:</span>
                        <span className={urlAnalysisResult.url_components.is_non_standard_port ? "text-rose-400 font-bold" : "text-white"}>
                          {urlAnalysisResult.url_components.port || (urlAnalysisResult.url_components.scheme === "https" ? "443 (Default)" : "80 (Default)")}
                          {urlAnalysisResult.url_components.is_non_standard_port && " ⚠️ Non-Standard"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Path Endpoint:</span>
                        <span className="text-slate-200 truncate max-w-[200px]">{urlAnalysisResult.url_components.path || "/"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Query String:</span>
                        <span className="text-slate-200 truncate max-w-[200px]">{urlAnalysisResult.url_components.query || "none"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">@ Redirection Trick:</span>
                        <span className={urlAnalysisResult.url_components.has_at_symbol ? "text-rose-400 font-bold" : "text-emerald-400"}>
                          {urlAnalysisResult.url_components.has_at_symbol ? "DETECTED (@)" : "Clean"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Stacked Protocol:</span>
                        <span className={urlAnalysisResult.url_components.has_stacked_protocol ? "text-rose-400 font-bold" : "text-emerald-400"}>
                          {urlAnalysisResult.url_components.has_stacked_protocol ? "DETECTED" : "None"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Parser telemetry not available.</div>
                  )}
                </div>

                {/* STEP 3: DOMAIN ANALYSIS (tldextract + Shannon Entropy) */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <Hash className="h-3.5 w-3.5 text-sky-400" />
                      <span>Stage 3: Domain Analysis (tldextract & Entropy)</span>
                    </span>
                    <span className="text-[10px] font-mono text-sky-400">Shannon H(X)</span>
                  </div>

                  {urlAnalysisResult.domain_analysis ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Registered Root Domain:</span>
                        <span className="text-white font-bold">{urlAnalysisResult.domain_analysis.registered_domain}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Public Suffix / TLD:</span>
                        <span className={urlAnalysisResult.domain_analysis.is_suspicious_tld ? "text-rose-400 font-bold" : "text-emerald-400"}>
                          .{urlAnalysisResult.domain_analysis.suffix}
                          {urlAnalysisResult.domain_analysis.is_suspicious_tld && " ⚠️ High-Abuse"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Shannon Entropy:</span>
                        <span className={urlAnalysisResult.domain_analysis.is_high_entropy_dga ? "text-amber-400 font-bold" : "text-slate-200"}>
                          {urlAnalysisResult.domain_analysis.domain_entropy} bits
                          {urlAnalysisResult.domain_analysis.is_high_entropy_dga && " (Algorithmic DGA)"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Subdomain Nesting Depth:</span>
                        <span className={urlAnalysisResult.domain_analysis.is_deep_subdomain ? "text-rose-400 font-bold" : "text-slate-200"}>
                          {urlAnalysisResult.domain_analysis.subdomain_depth} Levels ({urlAnalysisResult.domain_analysis.subdomain || "none"})
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Brand Spoofing / Typosquat:</span>
                        <span className={urlAnalysisResult.domain_analysis.is_brand_spoofing ? "text-rose-400 font-bold" : "text-emerald-400"}>
                          {urlAnalysisResult.domain_analysis.is_brand_spoofing ? `Impersonating ${urlAnalysisResult.domain_analysis.impersonated_brand}` : "None"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Punycode / IDN Homoglyph:</span>
                        <span className={urlAnalysisResult.domain_analysis.is_punycode ? "text-rose-400 font-bold" : "text-emerald-400"}>
                          {urlAnalysisResult.domain_analysis.is_punycode ? "DETECTED (xn--)" : "Clean ASCII"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Domain extraction telemetry not available.</div>
                  )}
                </div>

                {/* STEP 4: THREAT INTELLIGENCE AGGREGATOR */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <Radar className="h-3.5 w-3.5 text-amber-400" />
                      <span>Stage 4: Threat Intelligence* Aggregator</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">5 Feeds Aggregated</span>
                  </div>

                  {urlAnalysisResult.threat_intelligence ? (
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <div className="font-semibold text-slate-300">Google Safe Browsing:</div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          urlAnalysisResult.threat_intelligence.google_safe_browsing.includes("MALICIOUS")
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {urlAnalysisResult.threat_intelligence.google_safe_browsing}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <div className="font-semibold text-slate-300">VirusTotal Detection:</div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          urlAnalysisResult.threat_intelligence.virustotal_positives > 0
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {urlAnalysisResult.threat_intelligence.virustotal_summary}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <div className="font-semibold text-slate-300">PhishTank Feed:</div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          urlAnalysisResult.threat_intelligence.phishtank_status === "VERIFIED_PHISH"
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {urlAnalysisResult.threat_intelligence.phishtank_status}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                        <div className="font-semibold text-slate-300">URLhaus Malware Dropper:</div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          urlAnalysisResult.threat_intelligence.urlhaus_status.includes("MALWARE")
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}>
                          {urlAnalysisResult.threat_intelligence.urlhaus_status}
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] text-slate-400 block mb-1">Threat Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {urlAnalysisResult.threat_intelligence.threat_tags.map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Threat intelligence telemetry not available.</div>
                  )}
                </div>

                {/* STEP 5: RISK ENGINE & ACTIONABLE ADVICE */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                      <span>Stage 5: Risk Engine & Directives</span>
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">Scored {urlAnalysisResult.risk_score}/100</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Detected Deceptive Indicators:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {urlAnalysisResult.detected_tricks.map((trick: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{trick}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
                        Recommended Security Actions:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {urlAnalysisResult.recommended_actions.map((act: string, i: number) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECONDARY TAB: SCREENSHOT OCR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "screenshot" && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-cyan-400" />
              <span>Screenshot & Receipt OCR Analyzer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Deep visual forensics scanning fake payment receipts, forged transaction UTRs, and malicious APK prompts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: "fake_receipt", title: "Fake Payment Receipt", desc: "Forged Paytm/GPay confirmation screens" },
              { id: "fake_bank_sms", title: "Counterfeit Bank SMS", desc: "Forged credit notification without ledger delta" },
              { id: "apk_warning", title: "Malicious APK Prompt", desc: "Fake WhatsApp update / remote access trojan" },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setScreenshotScenario(sc.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  screenshotScenario === sc.id
                    ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-xs text-white">{sc.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{sc.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              setLoadingScreenshot(true);
              try {
                const res = await api.analyzeScreenshot(screenshotScenario);
                setScreenshotResult(res);
              } finally {
                setLoadingScreenshot(false);
              }
            }}
            disabled={loadingScreenshot}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2"
          >
            {loadingScreenshot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Run Forensic Vision OCR Analysis</span>
          </button>

          {screenshotResult && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{screenshotResult.scenario}</span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  Risk: {screenshotResult.risk_score}% ({screenshotResult.threat_level})
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1">
                {screenshotResult.fraud_indicators.map((ind: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-rose-400">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECONDARY TAB: VOICE CALL DEEPFAKE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "voice" && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Mic className="h-5 w-5 text-indigo-400" />
              <span>Voice Call & Audio Threat Intel</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Acoustic biometric and conversational duress analysis for voice cloning & coercive IVR extortion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Call Transcript Sample</label>
            <textarea
              rows={4}
              value={voiceTranscript || "Hello, this is Cyber Crime Officer Rahul from New Delhi Police. Your Aadhaar number was used to open 14 illegal SIM cards involved in terrorism funding. You must stay on this line immediately."}
              onChange={(e) => setVoiceTranscript(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <button
            onClick={async () => {
              setLoadingVoice(true);
              try {
                const res = await api.analyzeVoice(
                  voiceTranscript || "Digital arrest threat transcript",
                  "CBI Police Officer"
                );
                setVoiceResult(res);
              } finally {
                setLoadingVoice(false);
              }
            }}
            disabled={loadingVoice}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
          >
            {loadingVoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
            <span>Analyze Voice Threat Call</span>
          </button>

          {voiceResult && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">Threat Tier: {voiceResult.threat_level}</span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  Risk: {voiceResult.risk_score}%
                </span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1">
                {(voiceResult.voice_social_engineering_tactics || []).map((t: string, i: number) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-indigo-400">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
