"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  ExternalLink 
} from "lucide-react";
import { api, AIChatResponse } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  advisory?: string;
}

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your **Defeat Scammer AI Guardian**, powered by Gemini and our verified cyber-fraud RAG knowledge base. Ask me about suspicious messages, deceptive phone calls, unfamiliar investment proposals, or how to freeze accounts safely.",
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "What is a Digital Arrest scam and how do I react?",
    "Someone on WhatsApp asks me to scan a QR code to receive a refund.",
    "I received an SMS that my electricity power will be cut tonight at 9:30 PM.",
    "A caller wants me to download AnyDesk to fix a pending payment."
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res: AIChatResponse = await api.chatAI(text);
      const assistantMsg: Message = {
        role: "assistant",
        content: res.reply,
        sources: res.rag_sources,
        advisory: res.safety_advisory
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered a temporary connection issue. Please verify backend connectivity.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center space-x-2">
          <Bot className="h-6 w-6 text-cyan-400" />
          <span>AI Sentinel Financial Copilot</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Intelligent fraud defense powered by Google Gemini and real-time RAG cyber threat intelligence.
        </p>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-3"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Citations from RAG Knowledge Base */}
                {m.sources && m.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-cyan-400 flex items-center space-x-1 uppercase tracking-wider">
                      <BookOpen className="h-3 w-3" />
                      <span>RAG Knowledge Base Citations</span>
                    </div>
                    {m.sources.map((s, i) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                        <strong className="text-slate-300 font-semibold">{s.title}</strong>: {s.content.substring(0, 110)}...
                      </div>
                    ))}
                  </div>
                )}

                {/* Safety Advisory Banner */}
                {m.advisory && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg">
                    {m.advisory}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Consulting Gemini AI & Fraud Knowledge Base...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about an SMS, call, or suspicious request..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-md shadow-cyan-600/30 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
