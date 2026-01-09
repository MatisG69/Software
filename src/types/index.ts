export type UserRole = 'candidate' | 'company';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Candidate extends User {
  role: 'candidate';
  firstName?: string;
  lastName?: string;
  verificationStatus: VerificationStatus;
  certified: boolean;
  profile?: CandidateProfile;
}

export interface CandidateProfile {
  skills: string[];
  experience: number;
  education: string;
  bio?: string;
  location?: string;
}

export interface Company extends User {
  role: 'company';
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  benefits?: string;
  whatYouWillLive?: string;
  whatWeWillLove?: string;
  whoWeAre?: string;
}

export interface JobOffer {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  category: string;
  createdAt: string;
  company?: Company;
  missions?: string;
  expectedExperience?: string;
  otherInformation?: string;
  benefits?: string;
  whatYouWillLive?: string;
  whatWeWillLove?: string;
  whoWeAre?: string;
  // Decision DNA
  decisionDNAEnabled?: boolean;
  decisionDNAMode?: DecisionDNAMode;
  decisionProfileTarget?: DecisionProfileTarget;
}

export interface Application {
  id: string;
  jobOfferId: string;
  candidateId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
  skills?: string[];
  jobOffer?: JobOffer;
  decisionDNA?: CandidateDecisionDNA;
}

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'application' | 'message' | 'job_match' | 'verification';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// ============================================
// Decision DNA Types
// ============================================

export type DecisionDNAMode = 'standard_decision_dna' | 'custom_company_test' | 'no_test';

export interface DecisionProfileTarget {
  rapidité?: 'faible' | 'moyen' | 'élevé';
  prudence?: 'faible' | 'moyen' | 'élevé';
  optimisation_long_terme?: 'faible' | 'moyen' | 'élevé';
  tolérance_au_risque?: 'faible' | 'moyen' | 'élevé';
  [key: string]: 'faible' | 'moyen' | 'élevé' | undefined;
}

export interface TradeoffVector {
  risk_tolerance?: number; // -1 to 1
  decision_speed?: number; // -1 to 1
  consistency?: number; // -1 to 1
  adaptability?: number; // -1 to 1
  long_term_thinking?: number; // -1 to 1
  [key: string]: number | undefined;
}

export interface DecisionOption {
  id: string;
  label: string;
  tradeoff_vector: TradeoffVector;
}

export interface MicroScenario {
  id?: string;
  scenario_order: number;
  context_state: Record<string, any>;
  decision_prompt: string;
  options: DecisionOption[];
  time_limit?: number; // en secondes
}

export interface DecisionDNAResponse {
  scenario_id?: string;
  scenario_order: number;
  selected_option_id: string;
  context_state_before: Record<string, any>;
  context_state_after: Record<string, any>;
  response_time_ms?: number;
}

export interface DecisionDNA {
  risk_tolerance: number; // 0 to 1
  decision_speed: number; // 0 to 1
  consistency: number; // 0 to 1
  adaptability: number; // 0 to 1
  long_term_thinking: number; // 0 to 1
  prioritization: number; // 0 to 1
  stress_reaction: number; // 0 to 1
  rigidity: number; // 0 to 1 (inverse of adaptability)
  [key: string]: number;
}

export interface CandidateDecisionDNA {
  id: string;
  applicationId: string;
  decisionDNA: DecisionDNA;
  compatibilityScore?: number;
  createdAt: string;
}

