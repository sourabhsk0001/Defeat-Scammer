"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  MessageSquare, 
  Image as ImageIcon, 
  Mic, 
  CheckCircle2, 
  AlertOctagon, 
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { 
  api, 
  MessageAnalysisResult, 
  URLAnalysisResult, 
  ScreenshotAnalysisResult, 
  VoiceAnalysisResult 
} from "@/lib/api";

export const ScamShieldView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"message" | "url" | "screenshot" | "voice">("message");

  // Message Scanner state
  const [messageInput, setMessageInput] = useState("");
  const [channelInput, setChannelInput] = useState("SMS");
  const [messageResult, setMessageResult] = useState<MessageAnalysisResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  // URL Scanner state
  const [urlInput, setUrlInput] = useState("");
  const [urlResult, setUrlResult] = useState<URLAnalysisResult | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  // Screenshot Scanner state
  const [screenshotScenario, setScreenshotScenario] = useState("fake_receipt");
  const [screenshotCustomText, setScreenshotCustomText] = useState("");
  const [screenshotResult, setScreenshotResult] = useState<ScreenshotAnalysisResult | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);

  // Voice Scanner state
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [callerClaim, setCallerClaim] = useState("CBI / Cyber Police Officer");
  const [voiceResult, setVoiceResult] = useState<VoiceAnalysisResult | null>(null);
  const [loadingVoice, setLoadingVoice] = useState(false);

  // Quick Templates
  const handleLoadMessageTemplate = (type: string) => {
    if (type === "digital_arrest") {
      setMessageInput("This is Senior Officer Deshmukh from Cyber Crime HQ. A courier in your name with 5 fake passports and narcotic contraband was seized at the airport. Stay on this WhatsApp call or you will be arrested under section 420. Do not disclose this to anyone.");
      setChannelInput("WhatsApp");
    } else if (type === "electricity") {
      setMessageInput("Dear Consumer, Your electricity power supply will be disconnected tonight at 09:30 PM because your previous month bill was not updated. Please immediately call Electricity Officer at 98112-99881.");
      setChannelInput("SMS");
    } else if (type === "part_time") {
      setMessageInput("Hello! We noticed your profile on LinkedIn. Earn $150-$300 daily working from home just by rating 5-star hotel reviews and liking YouTube videos. Join our official Telegram manager @VIP_Task_Rewards to start.");
      setChannelInput("Telegram");
    } else if (type === "upi_qr") {
      setMessageInput("I am buying your sofa on OLX. I have sent you a payment QR code. Please scan the QR code and enter your 6-digit UPI PIN to immediately receive the $400 advance into your bank account.");
      setChannelInput("WhatsApp");
    }
  };

  const handleScanMessage = async () => {
    if (!messageInput.trim()) return;
    setLoadingMessage(true);
    try {
      const res = await api.analyzeMessage(messageInput, channelInput);
      setMessageResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleScanURL = async () => {
    if (!urlInput.trim()) return;
    setLoadingUrl(true);
    try {
      const res = await api.analyzeURL(urlInput);
      setUrlResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleScanScreenshot = async () => {
    setLoadingScreenshot(true);
    try {
      const res = await api.analyzeScreenshot(
        screenshotScenario, 
        screenshotCustomText || "Payment of $1,450.00 to Alex Morgan SUCCESSFUL. UTR: 0000987654. Verify at bit.ly/claim-funds"
      );
      setScreenshotResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScreenshot(false);
    }
  };

  const handleScanVoice = async () => {
    if (!voiceTranscript.trim()) return;
    setLoadingVoice(true);
    try {
      const res = await api.analyzeVoice(voiceTranscript, callerClaim);
      setVoiceResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVoice(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Subtab Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        {[
          { id: "message", label: "Message / SMS Scanner", icon: MessageSquare },
          { id: "url", label: "URL & Phishing Hunter", icon: Globe },
          { id: "screenshot", label: "Receipt & Screenshot OCR", icon: ImageIcon },
          { id: "voice", label: "Voice Call & Deepfake", icon: Mic },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. MESSAGE SCANNER SUBTAB */}
      {activeSubTab === "message" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                <span>Scam Message & SMS Analyzer</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Evaluates social engineering triggers, urgency coercion, and RAG fraud signatures.
              </p>
            </div>

            {/* Quick Templates */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Test Known Attack Signatures:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLoadMessageTemplate("digital_arrest")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  Digital Arrest
                </button>
                <button
                  onClick={() => handleLoadMessageTemplate("electricity")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  Electricity Cutoff
                </button>
                <button
                  onClick={() => handleLoadMessageTemplate("part_time")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  YouTube Task Scam
                </button>
                <button
                  onClick={() => handleLoadMessageTemplate("upi_qr")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  UPI PIN to Receive
                </button>
              </div>
            </div>

            {/* Input Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <label>Message Content</label>
                <select
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Email">Email</option>
                </select>
              </div>
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Paste the suspicious text, SMS, or message here..."
                rows={5}
                className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <button
              onClick={handleScanMessage}
              disabled={loadingMessage || !messageInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loadingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{loadingMessage ? "Analyzing Fraud Vectors..." : "Scan Message Now"}</span>
            </button>
          </div>

          {/* Results Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            {messageResult ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    {messageResult.is_scam ? (
                      <AlertOctagon className="h-6 w-6 text-rose-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {messageResult.is_scam ? "SCAM DETECTED" : "VERIFIED LOW RISK"}
                      </h3>
                      <p className="text-xs text-slate-400">{messageResult.scam_category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black ${
                      messageResult.risk_score >= 70 ? "text-rose-500" : messageResult.risk_score >= 40 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {messageResult.risk_score}%
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {messageResult.threat_level} THREAT
                    </div>
                  </div>
                </div>

                {/* Evidence & Triggers */}
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detected Indicators</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {messageResult.detected_patterns.map((p, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                    {messageResult.psychological_triggers.map((t, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-amber-300">
                        <span className="mt-0.5">⚠️</span>
                        <span>Psychological Trigger: {t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Actionable Countermeasures</div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {messageResult.recommended_actions.map((act, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reporting */}
                <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  💡 <span className="font-semibold text-slate-300">Reporting Advice:</span> {messageResult.reporting_advice}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <ShieldCheck className="h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">Awaiting Message Input</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Paste any suspicious SMS, WhatsApp message, or test a known attack signature above to evaluate threat vectors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. URL SCANNER SUBTAB */}
      {activeSubTab === "url" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Globe className="h-5 w-5 text-indigo-400" />
                <span>URL Risk & Phishing Hunter</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Detects typosquatting, brand impersonation, high-abuse TLDs, and fake credential portals.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Test Suspicious URLs:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setUrlInput("http://sbi-online-kyc-update.xyz/login.php")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  SBI Phishing (.xyz)
                </button>
                <button
                  onClick={() => setUrlInput("http://192.168.1.100/paypal-security/claim")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  Raw IP + Brand
                </button>
                <button
                  onClick={() => setUrlInput("https://netflix-billing-renew.top/secure")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  Netflix Spoof (.top)
                </button>
                <button
                  onClick={() => setUrlInput("https://www.paypal.com")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  Legitimate Domain
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Target Web Address (URL)</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="e.g. http://secure-bank-login.xyz/update"
                className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              onClick={handleScanURL}
              disabled={loadingUrl || !urlInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loadingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              <span>{loadingUrl ? "Inspecting Domain & Certificates..." : "Analyze URL Safety"}</span>
            </button>
          </div>

          {/* URL Result Box */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            {urlResult ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    {urlResult.is_phishing ? (
                      <AlertOctagon className="h-6 w-6 text-rose-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {urlResult.is_phishing ? "PHISHING URL DETECTED" : "DOMAIN APPEARS REPUTABLE"}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">{urlResult.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black ${
                      urlResult.risk_score >= 60 ? "text-rose-500" : "text-emerald-400"
                    }`}>
                      {urlResult.risk_score}%
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {urlResult.threat_level} THREAT
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">Domain Reputation:</span>
                    <span className="font-semibold text-slate-200">{urlResult.domain_reputation}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">SSL / Encryption:</span>
                    <span className={`font-semibold ${urlResult.ssl_status.includes("Missing") ? "text-rose-400" : "text-emerald-400"}`}>
                      {urlResult.ssl_status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tactical Indicators</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {urlResult.detected_tricks.map((trick, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{trick}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="font-bold text-slate-200 mb-1">Defense Advisory:</div>
                  <ul className="space-y-1 text-slate-300">
                    {urlResult.recommended_actions.map((act, i) => (
                      <li key={i}>• {act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Globe className="h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">Awaiting URL Submission</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Submit any link sent via SMS, email, or chat to test against malicious domain lists and typosquatting heuristics.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SCREENSHOT SCANNER SUBTAB */}
      {activeSubTab === "screenshot" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <ImageIcon className="h-5 w-5 text-emerald-400" />
                <span>Screenshot & Payment Receipt Inspector</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Inspects forged payment confirmations (Fake Paytm/GPay/Zelle apps), spoofed SMS alerts, and forged font artifacts.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold">Select Simulated Scenario:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setScreenshotScenario("fake_receipt");
                    setScreenshotCustomText("Payment of $1,450.00 to Alex Morgan SUCCESSFUL. Reference UTR: 0000123456789. Demo Generated Receipt. Verify at spoof.me");
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    screenshotScenario === "fake_receipt"
                      ? "bg-emerald-950/40 border-emerald-500/50 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-bold">Fake Payment Receipt</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Generated via spoof app with mock UTR</div>
                </button>
                <button
                  onClick={() => {
                    setScreenshotScenario("fake_bank_sms");
                    setScreenshotCustomText("ALERT: Your Bank Account is BLOCKED due to expired PAN card. Click link http://pan-update.apk to reactivate immediately within 24 hours.");
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    screenshotScenario === "fake_bank_sms"
                      ? "bg-emerald-950/40 border-emerald-500/50 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="font-bold">Fake Bank SMS Screenshot</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Includes malware APK download link</div>
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">OCR Extracted Text Preview / Custom Input</label>
                <textarea
                  value={screenshotCustomText}
                  onChange={(e) => setScreenshotCustomText(e.target.value)}
                  placeholder="Paste or edit screenshot OCR text..."
                  rows={4}
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                onClick={handleScanScreenshot}
                disabled={loadingScreenshot}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2"
              >
                {loadingScreenshot ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                <span>{loadingScreenshot ? "Running OCR & Fraud Heuristics..." : "Analyze Screenshot Integrity"}</span>
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            {screenshotResult ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    {screenshotResult.is_fraudulent ? (
                      <AlertOctagon className="h-6 w-6 text-rose-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    )}
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {screenshotResult.is_fraudulent ? "FRAUDULENT RECEIPT / NOTICE" : "LEGITIMATE DOCUMENT"}
                      </h3>
                      <p className="text-xs text-slate-400">Integrity analysis complete</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black ${screenshotResult.risk_score >= 60 ? "text-rose-500" : "text-emerald-400"}`}>
                      {screenshotResult.risk_score}%
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      {screenshotResult.threat_level}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detected Forgery Attributes</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {screenshotResult.detected_manipulations.map((m, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-rose-400">
                        <span>•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                    {screenshotResult.fraud_indicators.map((ind, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-amber-300">
                        <span>•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="font-bold text-cyan-400 mb-1">Protective Instructions:</div>
                  <ul className="space-y-1 text-slate-300">
                    {screenshotResult.action_plan.map((act, idx) => (
                      <li key={idx}>• {act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <ImageIcon className="h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">No Image Analysis Executed</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Select a fake receipt or phishing SMS scenario to test forensic verification.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. VOICE CALL & DEEPFAKE SCANNER SUBTAB */}
      {activeSubTab === "voice" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Mic className="h-5 w-5 text-rose-400" />
                <span>Voice Call & AI Deepfake Scanner</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Analyzes live or recorded call transcripts for coercion tactics, fake police interrogation, and AI-cloned distress voices.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Simulated Live Call Audio Transcripts:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setCallerClaim("CBI Chief Inspector");
                    setVoiceTranscript("Listen to me very carefully. Your national identity number has been flagged in a money laundering case involving 45 bank accounts. We have an arrest warrant ready. You must not disconnect this call or talk to your family. Transfer 300,000 to our reserve verification escrow account now.");
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  CBI Video/Audio Coercion
                </button>
                <button
                  onClick={() => {
                    setCallerClaim("Grandson in Distress");
                    setVoiceTranscript("Grandma, it's me! I'm in terrible trouble. I got into a car accident and the police have arrested me. My lawyer says I need $5,000 cash for bail right now. Please don't call my mom, she will be furious. Help me please!");
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                >
                  AI Voice Clone / Grandchild
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Caller Identity Claimed</label>
              <input
                type="text"
                value={callerClaim}
                onChange={(e) => setCallerClaim(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Live Call Transcription (Audio-to-Text)</label>
              <textarea
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="Transcribe or paste the caller's spoken dialogue..."
                rows={4}
                className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>

            <button
              onClick={handleScanVoice}
              disabled={loadingVoice || !voiceTranscript.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loadingVoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              <span>{loadingVoice ? "Evaluating Acoustic Stress & Coercion..." : "Scan Voice Call Risk"}</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            {voiceResult ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <AlertOctagon className="h-6 w-6 text-rose-500 animate-pulse" />
                    <div>
                      <h3 className="text-base font-bold text-white">
                        EXTORTION CALL DETECTED
                      </h3>
                      <p className="text-xs text-rose-400 font-medium">Impersonating: {voiceResult.impersonation_target}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-rose-500">{voiceResult.risk_score}%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">{voiceResult.threat_level} THREAT</div>
                  </div>
                </div>

                {voiceResult.is_deepfake_or_ai_voice_suspected && (
                  <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Deepfake Audio Alert: Voice synthesis artifacts and unnatural frequency compression detected. Call the relative directly on their known regular phone number!</span>
                  </div>
                )}

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                    Emergency Call Instruction:
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    {voiceResult.immediate_instruction}
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-indigo-300">Recommended Defense Script to Recite:</div>
                  <div className="italic text-slate-200">{voiceResult.defense_script}</div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Mic className="h-12 w-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">Awaiting Call Transcription</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Select a live phone call simulation above to test real-time intimidation detection and AI deepfake defense scripts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
