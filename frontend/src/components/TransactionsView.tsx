"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  RefreshCw, 
  Search, 
  DollarSign, 
  ArrowDownRight, 
  ArrowUpRight,
  Filter,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Transaction, api } from "@/lib/api";

interface TransactionsViewProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onRefresh
}) => {
  const [filterType, setFilterType] = useState<"all" | "anomalies" | "safe">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("debit");
  const [category, setCategory] = useState("Transfers");
  const [merchant, setMerchant] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = transactions.filter((tx) => {
    if (filterType === "anomalies" && !tx.is_anomaly) return false;
    if (filterType === "safe" && tx.is_anomaly) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.merchant.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    setIsSubmitting(true);
    try {
      await api.addTransaction({
        title,
        amount: parseFloat(amount),
        type,
        category,
        merchant: merchant || title
      });
      setShowAddModal(false);
      setTitle("");
      setAmount("");
      setMerchant("");
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchScan = async () => {
    setIsScanning(true);
    try {
      await api.reScanTransactions();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const anomalyCount = transactions.filter(t => t.is_anomaly).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-cyan-400" />
            <span>Transaction Ledger & ML Risk Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Statistical deviation, velocity tracking, and high-risk merchant anomaly detection
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleBatchScan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin text-cyan-400" : ""}`} />
            <span>Re-Scan ML Baseline</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Simulate / Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === "all" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType("anomalies")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === "anomalies" 
                ? "bg-rose-600 text-white" 
                : "text-rose-400 hover:bg-rose-950/40"
            }`}
          >
            Flagged Anomalies ({anomalyCount})
          </button>
          <button
            onClick={() => setFilterType("safe")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === "safe" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Safe Transactions
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant or category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactions match your search filter.
            </div>
          ) : (
            filtered.map((tx) => (
              <div 
                key={tx.id} 
                className={`p-4 transition-colors hover:bg-slate-900/50 ${
                  tx.is_anomaly ? "bg-rose-950/15" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2.5 rounded-xl border mt-0.5 ${
                      tx.is_anomaly
                        ? "bg-rose-950/60 border-rose-500/50 text-rose-400"
                        : tx.type === "credit"
                        ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}>
                      {tx.is_anomaly ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : tx.type === "credit" ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : (
                        <DollarSign className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{tx.title}</span>
                        {tx.is_anomaly ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                            RISK {tx.risk_score}% • ANOMALY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            VERIFIED (Risk {tx.risk_score}%)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Merchant: <strong className="text-slate-300 font-medium">{tx.merchant}</strong></span>
                        <span>Date: {tx.date}</span>
                        <span>Category: <strong className="text-slate-300 font-medium">{tx.category}</strong></span>
                        <span>Location: {tx.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                    <div className={`text-base font-black font-mono ${
                      tx.type === "credit" ? "text-emerald-400" : "text-white"
                    }`}>
                      {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">
                      ID: {tx.id}
                    </div>
                  </div>
                </div>

                {/* Risk Flags Breakdown if Anomaly */}
                {tx.risk_flags && tx.risk_flags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rose-950/60 bg-rose-950/20 rounded-lg p-2.5">
                    <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Machine Learning Risk Factors Triggered:</span>
                    </div>
                    <ul className="space-y-0.5 text-xs text-rose-300/90 pl-4 list-disc">
                      {tx.risk_flags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Simulate / Log Transaction</h3>
            <p className="text-xs text-slate-400 mb-4">The risk engine will evaluate anomaly score automatically upon creation.</p>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title / Memo</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wire Transfer to Crypto Exchange"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="2500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="debit">Debit (Expense)</option>
                    <option value="credit">Credit (Deposit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Merchant / Beneficiary</label>
                <input
                  type="text"
                  placeholder="e.g. Offshore Card Depot LLC"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Transfers">Transfers & Wires</option>
                  <option value="Shopping">Shopping & Vouchers</option>
                  <option value="Groceries">Groceries & Food</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Software">Software & Tech</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-semibold shadow-md shadow-cyan-600/20"
                >
                  {isSubmitting ? "Scoring..." : "Run ML & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
