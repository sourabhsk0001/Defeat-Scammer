"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, 
  AreaChart, Area, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Activity, 
  CheckCircle2, 
  Layers, 
  Calendar 
} from "lucide-react";
import { api } from "@/lib/api";

const PIE_COLORS = ["#06b6d4", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export const FinancialChartsView: React.FC = () => {
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const currencySymbol = currency === "INR" ? "₹" : "$";
  const rate = currency === "INR" ? 1 : (1 / 85);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    api.getFinancialAnalytics()
      .then((data) => setAnalyticsData(data))
      .catch((err) => console.warn("Analytics fetch failed:", err));
  }, []);

  const formatCurrency = (val: number) => {
    const num = currency === "INR" ? val : val * rate;
    return `${currencySymbol}${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  // 1. Income vs Expense Data
  const incomeVsExpenseData = [
    { month: "May", income: 28000, expenses: 19500 },
    { month: "Jun", income: 29000, expenses: 20400 },
    { month: "Jul", income: 30000, expenses: 21800 },
    { month: "Aug", income: 30000, expenses: 20100 },
    { month: "Sep", income: 30000, expenses: 21500 },
    { month: "Oct (Proj)", income: 35000, expenses: 22000 },
  ].map(d => ({
    ...d,
    incomeDisp: currency === "INR" ? d.income : Math.round(d.income * rate),
    expenseDisp: currency === "INR" ? d.expenses : Math.round(d.expenses * rate)
  }));

  // 2. Monthly Spending Trend
  const monthlySpendingData = [
    { month: "May", spending: 19500 },
    { month: "Jun", spending: 20400 },
    { month: "Jul", spending: 21800 },
    { month: "Aug", spending: 20100 },
    { month: "Sep", spending: 21500 },
    { month: "Oct", spending: 17800 },
  ].map(d => ({
    ...d,
    spendingDisp: currency === "INR" ? d.spending : Math.round(d.spending * rate)
  }));

  // 3. Expense Categories Data (Donut Chart)
  const categoryData = (analyticsData?.category_spending && analyticsData.category_spending.length > 0)
    ? analyticsData.category_spending.map((c: any) => ({
        name: c.category,
        value: currency === "INR" ? c.total_spent : Math.round(c.total_spent * rate),
        percentage: c.percentage_of_total
      }))
    : [
        { name: "Housing & Utilities", value: currency === "INR" ? 9675 : Math.round(9675 * rate), percentage: 45.0 },
        { name: "Groceries & Dining", value: currency === "INR" ? 5375 : Math.round(5375 * rate), percentage: 25.0 },
        { name: "Transfers & Discretionary", value: currency === "INR" ? 4300 : Math.round(4300 * rate), percentage: 20.0 },
        { name: "Software & Tech", value: currency === "INR" ? 2150 : Math.round(2150 * rate), percentage: 10.0 }
      ];

  // 4. Savings Trend Data
  const savingsTrendData = [
    { month: "May", cumulativeSavings: 8500, monthlySavings: 8500 },
    { month: "Jun", cumulativeSavings: 17100, monthlySavings: 8600 },
    { month: "Jul", cumulativeSavings: 25300, monthlySavings: 8200 },
    { month: "Aug", cumulativeSavings: 35200, monthlySavings: 9900 },
    { month: "Sep", cumulativeSavings: 43700, monthlySavings: 8500 },
    { month: "Oct (Est)", cumulativeSavings: 56700, monthlySavings: 13000 },
  ].map(d => ({
    ...d,
    cumDisp: currency === "INR" ? d.cumulativeSavings : Math.round(d.cumulativeSavings * rate),
    monDisp: currency === "INR" ? d.monthlySavings : Math.round(d.monthlySavings * rate)
  }));

  // 5. Budget Utilization Data
  const budgetUtilizationData = [
    { category: "Housing", budgeted: 12000, spent: 11200, utilization: 93.3 },
    { category: "Groceries", budgeted: 6500, spent: 5375, utilization: 82.7 },
    { category: "Transfers", budgeted: 4000, spent: 4300, utilization: 107.5 },
    { category: "Utilities", budgeted: 2500, spent: 2150, utilization: 86.0 },
    { category: "Software", budgeted: 1500, spent: 980, utilization: 65.3 },
  ].map(d => ({
    ...d,
    budgetedDisp: currency === "INR" ? d.budgeted : Math.round(d.budgeted * rate),
    spentDisp: currency === "INR" ? d.spent : Math.round(d.spent * rate)
  }));

  // 6. Goal Progress Data
  const goalsList = [
    {
      title: "Emergency Fraud Reserve",
      current: 40000,
      target: 50000,
      percentage: 80,
      deadline: "Dec 2026",
      status: "On Track"
    },
    {
      title: "Elder Care Shield Fund",
      current: 12500,
      target: 20000,
      percentage: 62.5,
      deadline: "Mar 2027",
      status: "Healthy"
    },
    {
      title: "High-Yield Certificate Ladder",
      current: 32000,
      target: 80000,
      percentage: 40.0,
      deadline: "Sep 2027",
      status: "Active"
    }
  ];

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2.5">
            <Activity className="h-7 w-7 text-cyan-400" />
            <span>Phase 6: Recharts Financial Visualizations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Interactive multi-dimensional financial charts powered by Recharts, Pandas, and NumPy.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setCurrency("INR")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currency === "INR" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            ₹ INR
          </button>
          <button
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currency === "USD" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            $ USD
          </button>
        </div>
      </div>

      {/* Grid of 6 Recharts Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* -------------------------------------------------------------
            CHART 1: Income vs Expense (BarChart)
            ------------------------------------------------------------- */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <ArrowDownRight className="h-5 w-5 text-emerald-400" />
                <span>1. Income vs Expense</span>
              </h2>
              <p className="text-xs text-slate-400">Monthly Inflow (Emerald) vs Outflow (Rose)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-emerald-400 font-semibold">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 mr-1.5" /> Income
              </span>
              <span className="flex items-center text-rose-400 font-semibold">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500 mr-1.5" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} 
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, ""]}
                />
                <Bar dataKey="incomeDisp" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenseDisp" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CHART 2: Monthly Spending (AreaChart)
            ------------------------------------------------------------- */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <ArrowUpRight className="h-5 w-5 text-cyan-400" />
                <span>2. Monthly Spending</span>
              </h2>
              <p className="text-xs text-slate-400">Time-series expenditure trajectory across billing cycles</p>
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              Avg: {formatCurrency(20180)}/mo
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }} 
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Total Outflow"]}
                />
                <Area type="monotone" dataKey="spendingDisp" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#spendingGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CHART 3: Expense Categories (PieChart / Donut)
            ------------------------------------------------------------- */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <PieIcon className="h-5 w-5 text-indigo-400" />
                <span>3. Expense Categories</span>
              </h2>
              <p className="text-xs text-slate-400">Proportional distribution by budget bucket</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Amount"]}
                  />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {categoryData.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="font-medium text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-200">
                    {formatCurrency(item.value)} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CHART 4: Savings Trend (LineChart)
            ------------------------------------------------------------- */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span>4. Savings Trend</span>
              </h2>
              <p className="text-xs text-slate-400">Cumulative wealth retention trajectory</p>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              Current: {formatCurrency(43700)}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Cumulative"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumDisp" 
                  name="Cumulative Savings" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#10b981" }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CHART 5: Budget Utilization (BarChart)
            ------------------------------------------------------------- */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                <span>5. Budget Utilization</span>
              </h2>
              <p className="text-xs text-slate-400">Allocated Budget Cap (Indigo) vs Realized Spend (Cyan/Rose)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-indigo-400 font-semibold">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500 mr-1.5" /> Budgeted
              </span>
              <span className="flex items-center text-cyan-400 font-semibold">
                <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500 mr-1.5" /> Actual Spent
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetUtilizationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val: any) => [`${currencySymbol}${Number(val).toLocaleString()}`, ""]}
                />
                <Bar dataKey="budgetedDisp" name="Budgeted" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spentDisp" name="Spent" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* -------------------------------------------------------------
            CHART 6: Goal Progress (Visual Radial & Progress Cards)
            ------------------------------------------------------------- */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Target className="h-5 w-5 text-amber-400" />
                <span>6. Goal Progress</span>
              </h2>
              <p className="text-xs text-slate-400">Milestone accumulation & completion forecasting</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              3 ACTIVE GOALS
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {goalsList.map((g: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{g.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    {g.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Current: <strong className="text-slate-200">{formatCurrency(g.current)}</strong></span>
                  <span>Target: <strong className="text-cyan-400">{formatCurrency(g.target)}</strong></span>
                  <span className="text-amber-400 font-bold">{g.percentage}%</span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>Target Date: {g.deadline}</span>
                  <span>Remaining: {formatCurrency(g.target - g.current)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
