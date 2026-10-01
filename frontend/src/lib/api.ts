const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  monthly_income: number;
  risk_appetite: string;
  protection_tier: string;
  family_members_count: number;
  security_score: number;
  financial_health_score: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  merchant: string;
  risk_score: number;
  is_anomaly: boolean;
  risk_flags: string[];
  location: string;
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  remaining: number;
  categories: {
    category: string;
    budgeted: number;
    spent: number;
    percentage: number;
    status: string;
  }[];
  savings_rate: number;
  health_advice: string;
}

export interface MessageAnalysisResult {
  is_scam: boolean;
  threat_level: string;
  risk_score: number;
  scam_category: string;
  detected_patterns: string[];
  urgency_rating: string;
  psychological_triggers: string[];
  evidence: string[];
  recommended_actions: string[];
  reporting_advice: string;
}

export interface URLAnalysisResult {
  url: string;
  is_phishing: boolean;
  threat_level: string;
  risk_score: number;
  detected_tricks: string[];
  domain_reputation: string;
  ssl_status: string;
  impersonated_brand?: string;
  verdict_summary: string;
  recommended_actions: string[];
}

export interface ScreenshotAnalysisResult {
  scenario: string;
  risk_score: number;
  threat_level: string;
  is_fraudulent: boolean;
  detected_manipulations: string[];
  extracted_text_preview: string;
  fraud_indicators: string[];
  action_plan: string[];
}

export interface VoiceAnalysisResult {
  threat_level: string;
  risk_score: number;
  impersonation_target: string;
  voice_social_engineering_tactics: string[];
  urgency_stress_level: string;
  immediate_instruction: string;
  is_deepfake_or_ai_voice_suspected: boolean;
  defense_script: string;
}

export interface AIChatResponse {
  reply: string;
  rag_sources: {
    id: string;
    title: string;
    category: string;
    content: string;
    recommended_action: string;
    relevance_score: number;
  }[];
  safety_advisory?: string;
}

export interface ActiveThreat {
  id: string;
  title: string;
  category: string;
  severity: string;
  victim_count_today: number;
  description: string;
  indicator_of_compromise: string;
  preventative_tip: string;
  date_reported: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  protection_status: string;
  scams_intercepted: number;
  last_checkup: string;
}

export interface MoneyTrailData {
  nodes: {
    id: string;
    label: string;
    type: string;
    balance: number;
    risk_level: string;
  }[];
  links: {
    source: string;
    target: string;
    amount: number;
    timestamp: string;
    flagged: boolean;
  }[];
  total_stolen_tracked: number;
  recovery_probability: string;
  frozen_nodes_count: number;
}

export interface EmergencyActionGuide {
  emergency_type: string;
  hotlines: { name: string; number: string }[];
  step_by_step_checklist: string[];
  sample_dispute_letter: string;
}

export const api = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/profile`);
    return res.json();
  },
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${API_BASE}/transactions`);
    return res.json();
  },
  addTransaction: async (data: { title: string; amount: number; type: string; category: string; merchant: string }): Promise<Transaction> => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  reScanTransactions: async () => {
    const res = await fetch(`${API_BASE}/transactions/re-scan-all`, { method: "POST" });
    return res.json();
  },
  getBudgets: async (): Promise<BudgetSummary> => {
    const res = await fetch(`${API_BASE}/budgets`);
    return res.json();
  },
  analyzeMessage: async (content: string, channel: string = "SMS"): Promise<MessageAnalysisResult> => {
    const res = await fetch(`${API_BASE}/scam-shield/analyze-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, channel }),
    });
    return res.json();
  },
  analyzeURL: async (url: string): Promise<URLAnalysisResult> => {
    const res = await fetch(`${API_BASE}/scam-shield/analyze-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return res.json();
  },
  analyzeScreenshot: async (scenario: string, extracted_text?: string): Promise<ScreenshotAnalysisResult> => {
    const res = await fetch(`${API_BASE}/scam-shield/analyze-screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simulated_scenario: scenario, extracted_text }),
    });
    return res.json();
  },
  analyzeVoice: async (audio_transcript: string, caller_identity?: string): Promise<VoiceAnalysisResult> => {
    const res = await fetch(`${API_BASE}/scam-shield/analyze-voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_transcript, caller_claimed_identity: caller_identity }),
    });
    return res.json();
  },
  chatAI: async (message: string, history: any[] = []): Promise<AIChatResponse> => {
    const res = await fetch(`${API_BASE}/ai-assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    return res.json();
  },
  getThreats: async (): Promise<ActiveThreat[]> => {
    const res = await fetch(`${API_BASE}/safety-center/threats`);
    return res.json();
  },
  getFamilyMembers: async (): Promise<FamilyMember[]> => {
    const res = await fetch(`${API_BASE}/safety-center/family-members`);
    return res.json();
  },
  getMoneyTrail: async (): Promise<MoneyTrailData> => {
    const res = await fetch(`${API_BASE}/safety-center/money-trail`);
    return res.json();
  },
  getEmergencyGuide: async (scenario: string = "unauthorized_debit"): Promise<EmergencyActionGuide> => {
    const res = await fetch(`${API_BASE}/safety-center/emergency-sos/${scenario}`);
    return res.json();
  },
};
