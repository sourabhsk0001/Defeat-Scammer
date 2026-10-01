const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  monthly_income: number;
  monthly_expenses?: number;
  age_range?: string;
  occupation?: string;
  financial_goal?: string;
  preferred_language?: string;
  risk_appetite: string;
  protection_tier: string;
  family_members_count: number;
  security_score: number;
  financial_health_score: number;
  is_onboarded?: boolean;
  created_at: string;
}

export interface OnboardingPayload {
  name: string;
  age_range: string;
  occupation: string;
  monthly_income: number;
  monthly_expenses: number;
  financial_goal: string;
  preferred_language: string;
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
  url_components?: {
    raw_url: string;
    normalized_url: string;
    scheme: string;
    netloc: string;
    hostname: string;
    port?: number | null;
    is_non_standard_port: boolean;
    path: string;
    query: string;
    has_at_symbol: boolean;
    has_stacked_protocol: boolean;
    is_obfuscated_ip: boolean;
  };
  domain_analysis?: {
    subdomain: string;
    domain: string;
    suffix: string;
    registered_domain: string;
    is_ip_address: boolean;
    is_punycode: boolean;
    is_suspicious_tld: boolean;
    domain_entropy: number;
    subdomain_entropy: number;
    is_high_entropy_dga: boolean;
    subdomain_depth: number;
    is_deep_subdomain: boolean;
    impersonated_brand?: string | null;
    is_brand_spoofing: boolean;
    found_phish_tokens: string[];
  };
  threat_intelligence?: {
    providers_checked: string[];
    positive_detections: number;
    threat_tags: string[];
    google_safe_browsing: string;
    virustotal_summary: string;
    virustotal_positives: number;
    phishtank_status: string;
    urlhaus_status: string;
  };
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

// --- Phase 11: AI Engine Responsibilities Interfaces ---
export interface FinancialExplanationResponse {
  explanation: string;
  health_tier: string;
  health_summary: string;
  metrics_evaluated: {
    income: number;
    expenses: number;
    net_savings: number;
    savings_rate_pct: number;
    anomalies_detected: number;
  };
}

export interface ScamExplanationResponse {
  scam_explanation: string;
  channel: string;
  category: string;
  threat_level: string;
  golden_rule: string;
  reporting_helpline: string;
}

export interface BudgetRecommendationResponse {
  recommendations: string;
  framework: string;
  monthly_income: number;
  target_allocations: {
    needs_50_pct: number;
    wants_30_pct: number;
    savings_investments_20_pct: number;
  };
  category_targets: Record<string, number>;
  annual_wealth_growth_potential: number;
}

export interface FinancialEducationResponse {
  topic: string;
  lesson: string;
  difficulty: string;
  estimated_read_time: string;
}

export interface PersonalizedGuidanceResponse {
  name: string;
  goal: string;
  guidance_roadmap: string;
  monthly_surplus: number;
  security_status: string;
  action_phases: string[];
}

// --- Phase 12: RAG Knowledge Base Interfaces ---
export interface RAGSourceCitation {
  source: string;
  title: string;
  publication_date: string;
  update_date?: string;
  jurisdiction: string;
  document_type: string;
  url: string;
  category: string;
  relevance_score: number;
  excerpt: string;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  sources: RAGSourceCitation[];
  total_sources_cited: number;
  pipeline_trace: Record<string, any>;
}

export interface OfficialDocumentMetadata {
  id: string;
  category: string;
  title: string;
  source: string;
  publication_date: string;
  update_date?: string;
  jurisdiction: string;
  document_type: string;
  url: string;
  content: string;
}

// --- Phase 13: Unified AI Assistant Interfaces ---
export interface AIAssistantSafetyAssessment {
  is_suspicious: boolean;
  risk_level: "SAFE" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  risk_score: number;
  detected_indicators: string[];
  extracted_urls: string[];
  scam_category: string;
}

export interface AIAssistantFinancialResult {
  calculation_type: string;
  details: Record<string, any>;
}

export interface AIAssistantUnifiedResponse {
  query: string;
  answer: string;
  safety_assessment: AIAssistantSafetyAssessment;
  financial_calculations?: AIAssistantFinancialResult | null;
  sources: RAGSourceCitation[];
  action_steps: string[];
  pipeline_trace: Record<string, any>;
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
  explainFinances: async (data: {
    income: number;
    expenses: number;
    savings?: number;
    savings_rate?: number;
    categories?: Record<string, number>;
    anomalies_count?: number;
    query?: string;
  }): Promise<FinancialExplanationResponse> => {
    const res = await fetch(`${API_BASE}/ai-assistant/explain-finances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  explainScam: async (data: {
    content: string;
    channel?: string;
    scam_category?: string;
    threat_level?: string;
    indicators?: string[];
  }): Promise<ScamExplanationResponse> => {
    const res = await fetch(`${API_BASE}/ai-assistant/explain-scam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  recommendBudget: async (data: {
    income: number;
    expenses?: any[];
    current_budgets?: any[];
    financial_goals?: any[];
  }): Promise<BudgetRecommendationResponse> => {
    const res = await fetch(`${API_BASE}/ai-assistant/budget-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getFinancialEducation: async (data: {
    topic: string;
    difficulty_level?: string;
  }): Promise<FinancialEducationResponse> => {
    const res = await fetch(`${API_BASE}/ai-assistant/financial-education`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getPersonalizedGuidance: async (data: {
    name?: string;
    age_range?: string;
    occupation?: string;
    monthly_income?: number;
    monthly_expenses?: number;
    financial_goal?: string;
    preferred_language?: string;
    risk_alerts_count?: number;
  }): Promise<PersonalizedGuidanceResponse> => {
    const res = await fetch(`${API_BASE}/ai-assistant/personalized-guidance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  assistUnified: async (data: {
    query: string;
    channel?: string;
    history?: { role: string; content: string }[];
    user_context?: Record<string, any>;
  }): Promise<AIAssistantUnifiedResponse> => {
    const res = await fetch(`${API_BASE}/ai-assistant/assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  queryRAG: async (data: {
    query: string;
    top_k?: number;
    category_filter?: string;
  }): Promise<RAGQueryResponse> => {
    const res = await fetch(`${API_BASE}/rag/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getOfficialDocuments: async (category?: string): Promise<OfficialDocumentMetadata[]> => {
    const url = category ? `${API_BASE}/rag/documents?category=${encodeURIComponent(category)}` : `${API_BASE}/rag/documents`;
    const res = await fetch(url);
    return res.json();
  },
  getRAGStats: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/rag/stats`);
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
  signUp: async (data: { email: string; password: string; full_name: string }) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  login: async (data: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE}/profile/dashboard-summary`);
    return res.json();
  },
  getFinancialAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },
  completeOnboarding: async (data: OnboardingPayload) => {
    const res = await fetch(`${API_BASE}/auth/onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  logout: async () => {
    const res = await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
    return res.json();
  },
  // Phase 7: Risk Engine APIs
  evaluateRisk: async (data: RiskEvaluationRequest): Promise<RiskEvaluationResult> => {
    const res = await fetch(`${API_BASE}/risk/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getRiskRules: async (): Promise<DeterministicRuleInfo[]> => {
    const res = await fetch(`${API_BASE}/risk/rules`);
    return res.json();
  },
  simulateRisk: async (data: RiskEvaluationRequest): Promise<RiskEvaluationResult> => {
    const res = await fetch(`${API_BASE}/risk/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // Phase 8: ML Anomaly Detection APIs
  detectMLAnomaly: async (data: MLAnomalyDetectionRequest): Promise<MLAnomalyDetectionResult> => {
    const res = await fetch(`${API_BASE}/ml/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getMLModelInfo: async (): Promise<MLModelInfo> => {
    const res = await fetch(`${API_BASE}/ml/model-info`);
    return res.json();
  },
  retrainMLModel: async () => {
    const res = await fetch(`${API_BASE}/ml/retrain`, { method: "POST" });
    return res.json();
  },
  batchDetectLedger: async () => {
    const res = await fetch(`${API_BASE}/ml/batch-detect`, { method: "POST" });
    return res.json();
  },
  // Phase 9: Unified Scam Shield API
  scanScamShield: async (data: ScamShieldScanRequest): Promise<ScamShieldScanResult> => {
    const res = await fetch(`${API_BASE}/scam-shield/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// --- Phase 7: Risk Engine Interfaces ---
export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  sanitized_fields: Record<string, any>;
}

export interface RiskIndicator {
  rule_id: string;
  flag: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score_contribution: number;
  category: string;
  metadata: Record<string, any>;
}

export interface RiskEvaluationRequest {
  amount: number;
  recipient: string;
  title?: string;
  type?: string;
  category?: string;
  channel?: string;
  location?: string;
  timestamp?: string;
  user_id?: string;
  force_new_recipient?: boolean;
  burst_count_override?: number;
}

export interface RiskEvaluationResult {
  transaction_id: string;
  validation: ValidationResult;
  rules_evaluated_count: number;
  risk_indicators: RiskIndicator[];
  risk_score: number;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  decision: "APPROVE" | "FLAG_REVIEW" | "STEP_UP_AUTH" | "BLOCK";
  is_anomaly: boolean;
  recommendations: string[];
  telemetry: Record<string, any>;
}

export interface DeterministicRuleInfo {
  rule_id: string;
  name: string;
  category: string;
  severity: string;
  weight: number;
  formula: string;
  description: string;
}

// --- Phase 8: ML Anomaly Detection Interfaces ---
export interface MLFeatures {
  transaction_amount: number;
  transaction_frequency: number;
  time_of_day: number;
  recipient_frequency: number;
  amount_deviation: number;
  daily_transaction_count: number;
}

export interface MLAnomalyDetectionRequest {
  amount: number;
  recipient: string;
  timestamp?: string;
  type?: string;
  channel?: string;
  location?: string;
  feature_overrides?: Record<string, number>;
}

export interface MLAnomalyDetectionResult {
  transaction_id: string;
  features: MLFeatures;
  raw_decision_score: number;
  anomaly_score: number;
  is_anomaly: boolean;
  anomaly_flags: string[];
  confidence_percent: number;
  model_info: Record<string, any>;
}

export interface MLModelInfo {
  model_name: string;
  n_estimators: number;
  contamination: number;
  training_samples_count: number;
  features_used: string[];
  algorithm: string;
}

// --- Phase 9: Unified Scam Shield Interfaces ---
export interface ScamShieldScanRequest {
  content: string;
  input_type: "sms" | "whatsapp" | "email" | "url" | "payment";
  sender_info?: string;
  subject?: string;
}

export interface ScamShieldScanResult {
  verdict_banner: string;
  risk_level: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  risk_score: number;
  indicators: string[];
  recommended_actions: string[];
  scam_category: string;
  input_type: string;
  extracted_text_clean: string;
  extracted_urls: Array<URLAnalysisResult>;
  psychological_triggers: string[];
  pipeline_trace: Record<string, any>;
  reporting_advice: string;
  is_scam: boolean;
}



