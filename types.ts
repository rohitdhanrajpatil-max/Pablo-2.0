
export enum DecisionType {
  APPROVE = 'Approve / Continue',
  CONDITIONAL = 'Conditional',
  REJECT = 'Reject / Exit',
  AUTO_REJECT = 'AUTO REJECT / EXIT'
}

export interface ScorecardItem {
  parameter: string;
  score: number;
  reason: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface OTAAuditItem {
  channel: string;
  status: 'FAIL' | 'WARNING' | 'PASS';
  rating?: number;
  history?: { label: string; value: number }[];
  blockers: string[];
  recoveryPlan: string[];
}

export interface RoomType {
  name: string;
  price: string;
  inclusions: string[];
  description: string;
}

export interface Competitor {
  name: string;
  rating: number;
  adr: string;
  distance: string;
  category: string;
  otaName: string;
}

export interface CityEntity {
  name: string;
  relevance: string;
}

export interface EvaluationResult {
  executiveSummary: {
    hotelName: string;
    city: string;
    status: string; // New Onboarding / Existing
    finalDecision: DecisionType;
    averageScore: number;
    detectedRating?: number;
    detectedADR?: string;
  };
  scorecard: ScorecardItem[];
  otaAudit: OTAAuditItem[];
  roomTypes: RoomType[];
  competitors: Competitor[];
  topCorporates: CityEntity[];
  topTravelAgents: CityEntity[];
  keyRisks: string[];
  commercialUpside: string[];
  finalRecommendation: string;
  conditionalActionPlan: string[] | null;
  hardStopFlag: boolean;
  hardStopDetails: string | null;
  groundingSources?: GroundingSource[];
}

export interface HotelInput {
  hotelName: string;
  city: string;
  status: 'New Onboarding' | 'Existing Treebo';
  rawDetails?: string;
}
