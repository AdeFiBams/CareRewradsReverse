// ─── User & Auth ────────────────────────────────────────────────────────────

export type MemberTier = 'standard' | 'silver' | 'gold' | 'platinum';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberId: string;
  planName: string;
  groupNumber: string;
  tier: MemberTier;
  avatarInitials: string;
}

// ─── Points & Rewards ────────────────────────────────────────────────────────

export type TransactionType = 'earned' | 'redeemed';

export interface PointsTransaction {
  id: string;
  description: string;
  points: number;
  type: TransactionType;
  date: string;
  category: OpportunityType | 'redemption' | 'bonus' | 'survey';
}

export type RedemptionType =
  | 'premium_reduction'
  | 'deductible_credit'
  | 'copay_credit'
  | 'gift_card'
  | 'hsa_contribution';

export interface RedemptionOption {
  id: string;
  type: RedemptionType;
  label: string;
  description: string;
  minPoints: number;
  conversionRate: number; // points per dollar
  icon: string;
}

// ─── Opportunities ───────────────────────────────────────────────────────────

export type OpportunityType =
  | 'medication'
  | 'preventive'
  | 'mail_delivery'
  | 'upcoming_care'
  | 'specialist';

export type OpportunityStatus = 'available' | 'in_progress' | 'completed' | 'missed';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  shortDescription: string;
  fullDescription: string;
  pointsReward: number;
  estimatedSavings: number;
  status: OpportunityStatus;
  dueDate?: string;
  steps: string[];
  icon: string;
  category: string;
}

// ─── Claims ──────────────────────────────────────────────────────────────────

export type ClaimStatus = 'processed' | 'pending' | 'denied' | 'in_review';

export interface Claim {
  id: string;
  claimNumber: string;
  date: string;
  providerName: string;
  providerType: string;
  serviceDescription: string;
  billedAmount: number;
  planAllowed: number;
  insurancePaid: number;
  patientResponsibility: number;
  deductibleApplied: number;
  copayApplied: number;
  coinsuranceApplied: number;
  status: ClaimStatus;
  diagnosisCodes?: string[];
  serviceDate: string;
}

// ─── Benefits ────────────────────────────────────────────────────────────────

export interface DeductibleInfo {
  individual: { met: number; total: number };
  family: { met: number; total: number };
}

export interface OutOfPocketInfo {
  individual: { met: number; total: number };
  family: { met: number; total: number };
}

export interface CopayTier {
  tier: number;
  label: string;
  description: string;
  copay: number;
  examples: string[];
}

export interface PreventiveService {
  id: string;
  name: string;
  frequency: string;
  covered: boolean;
  lastCompleted?: string;
  nextDue?: string;
}

export interface Benefits {
  deductible: DeductibleInfo;
  outOfPocket: OutOfPocketInfo;
  copayTiers: CopayTier[];
  preventiveServices: PreventiveService[];
  planYear: string;
  inNetworkOnly: boolean;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface PointsSummary {
  balance: number;
  earnedThisYear: number;
  redeemedThisYear: number;
  savingsThisYear: number;
  transactions: PointsTransaction[];
}
