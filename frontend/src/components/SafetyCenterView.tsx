"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  UserPlus, 
  Bell, 
  ShieldCheck, 
  Eye, 
  ChevronRight,
  Flame
} from "lucide-react";
import { api, ActiveThreat, FamilyMember } from "@/lib/api";

export const SafetyCenterView: React.FC = () => {
  const [threats, setThreats] = useState<ActiveThreat[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // New family member modal/form
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("Parent (Senior)");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    Promise.all([api.getThreats(), api.getFamilyMembers()])
      .then(([tData, fData]) => {
        setThreats(tData);
        setFamilyMembers(fData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newMem: FamilyMember = {
      id: `fam_${Date.now()}`,
      name: newName,
      relation: newRelation,
      phone: newPhone,
      protection_status: "Active Shield",
      scams_intercepted: 0,
      last_checkup: "Just Now"
    };

    setFamilyMembers((prev) => [...prev, newMem]);
    setShowAddFamily(false);
    setNewName("");
    setNewPhone("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span>Financial Safety Center & Family Protection</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Active threat intelligence bulletins and collaborative defense for family members and seniors.
        </p>
      </div>

      {/* Family Shield Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-sky-400" />
              <span>Family Circle Guardian</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Protect vulnerable relatives against targeted impersonation, parcel fraud, and fake distress calls.
            </p>
          </div>

          <button
            onClick={() => setShowAddFamily(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all self-start sm:self-auto"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Family Member</span>
          </button>
        </div>

        {/* Family Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {familyMembers.map((fam) => (
            <div key={fam.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white">{fam.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {fam.protection_status}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{fam.relation}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{fam.phone}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Intercepted: <strong className="text-slate-200">{fam.scams_intercepted} scams</strong></span>
                <span className="text-[10px]">{fam.last_checkup}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Threat Intelligence Feed */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Flame className="h-5 w-5 text-rose-500 animate-pulse" />
            <span>Live Threat Intelligence Bulletins</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time cyber fraud trends compiled from CERT, FTC, and anti-fraud law enforcement agencies.
          </p>
        </div>

        <div className="space-y-4">
          {threats.map((threat) => (
            <div 
              key={threat.id} 
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    threat.severity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {threat.severity}
                  </span>
                  <h3 className="text-sm font-bold text-white">{threat.title}</h3>
                </div>

                <div className="text-xs text-slate-400 flex items-center space-x-2">
                  <span className="text-rose-400 font-semibold">{threat.victim_count_today} reports today</span>
                  <span>• {threat.date_reported}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {threat.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900">
                  <span className="font-bold text-amber-400 block mb-0.5">Indicators of Compromise (IoC):</span>
                  <span className="text-slate-400">{threat.indicator_of_compromise}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900">
                  <span className="font-bold text-emerald-400 block mb-0.5">Shielding Guideline:</span>
                  <span className="text-slate-400">{threat.preventative_tip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Family Member Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Family Member to Shield</h3>
            <p className="text-xs text-slate-400 mb-4">Enable real-time scam alerts and shared threat blocking.</p>
            
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Margaret Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Relationship</label>
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Parent (Senior)">Parent (Senior)</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child / Student">Child / Student</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 123-4567"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFamily(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs text-white font-semibold shadow-md shadow-sky-600/20"
                >
                  Connect & Shield
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
