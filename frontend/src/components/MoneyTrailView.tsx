"use client";

import React, { useState, useEffect } from "react";
import { 
  GitFork, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  Layers, 
  RefreshCw,
  Coins,
  Building,
  User,
  Zap
} from "lucide-react";
import { api, MoneyTrailData } from "@/lib/api";

export const MoneyTrailView: React.FC = () => {
  const [data, setData] = useState<MoneyTrailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    api.getMoneyTrail()
      .then((res) => {
        setData(res);
        if (res.nodes && res.nodes.length > 0) {
          setSelectedNode(res.nodes[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "victim":
        return User;
      case "mule_account":
        return Building;
      case "crypto_bridge":
        return Coins;
      case "scammer_hub":
        return Zap;
      case "cash_out":
        return AlertTriangle;
      default:
        return Building;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <GitFork className="h-6 w-6 text-cyan-400" />
            <span>Money Trail & Laundering Graph Visualizer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Graph analysis showing multi-hop layering, mule accounts, and real-time bank freeze points.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5">
            <Lock className="h-3.5 w-3.5" />
            <span>{data?.frozen_nodes_count || 2} Accounts Frozen by Bank CIRT</span>
          </div>
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Stolen Tracked</span>
          <span className="text-2xl font-black text-rose-500 font-mono">
            ${data?.total_stolen_tracked?.toFixed(2) || "2,950.00"}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Split across 2 mule layers</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Recovery Probability</span>
          <span className="text-sm font-bold text-emerald-400 block mt-1">
            {data?.recovery_probability || "78% (High)"}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Dispatched within Golden Hour</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Graph Traversal Hops</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            {data?.links?.length || 6} Hops Tracked
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Graph Neural Net Pattern Matched</span>
        </div>
      </div>

      {/* Visual Graph Canvas / Card Layout */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span>Multi-Hop Laundering Topology (Hop 1 to Hop 4)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any node along the money flow to inspect ledger balance and freeze status.
          </p>
        </div>

        {/* Node Flow Sequence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.nodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const isSelected = selectedNode?.id === node.id;
            const isFrozen = node.id === "n2" || node.id === "n3";

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/60"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <Icon className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isFrozen 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : node.risk_level === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : "bg-slate-800 text-slate-300"
                  }`}>
                    {isFrozen ? "FROZEN 🔒" : node.risk_level}
                  </span>
                </div>

                <div className="text-sm font-bold text-white">{node.label}</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Balance: <strong className="text-slate-200">${node.balance.toFixed(2)}</strong>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 capitalize">
                  Topology Class: {node.type.replace("_", " ")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Box */}
        {selectedNode && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Node Forensics: {selectedNode.label}
              </span>
              <span className="font-mono text-slate-400">Node ID: {selectedNode.id}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {selectedNode.type === "victim"
                ? "Origin node of the disputed funds. Outgoing transfer of $2,950 initiated at 02:41 AM."
                : selectedNode.type === "mule_account"
                ? "First-layer mule account. Notice issued to clearinghouse; account temporarily restricted from outward RTGS/NEFT transfers."
                : selectedNode.type === "crypto_bridge"
                ? "Offshore bridge address flagged across global anti-money laundering (AML) monitoring databases."
                : "Layering intermediate wallet used for splitting transaction amounts into smaller micro-transfers."}
            </p>
          </div>
        )}

        {/* Hops Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tracked Transaction Hops</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Hop ID</th>
                  <th className="p-3">Source Node</th>
                  <th className="p-3">Target Node</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950">
                {data?.links.map((link, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono text-slate-400">HOP-0{idx + 1}</td>
                    <td className="p-3 font-mono text-cyan-400">{link.source}</td>
                    <td className="p-3 font-mono text-indigo-400">{link.target}</td>
                    <td className="p-3 font-mono text-slate-400">{link.timestamp}</td>
                    <td className="p-3 font-bold font-mono text-rose-400">${link.amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        FLAGGED ILLEGAL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
