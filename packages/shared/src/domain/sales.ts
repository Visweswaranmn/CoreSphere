export const DealStage = {
  Lead: 'lead',
  Qualified: 'qualified',
  Proposal: 'proposal',
  Negotiation: 'negotiation',
  Won: 'won',
  Lost: 'lost',
} as const;
export type DealStage = (typeof DealStage)[keyof typeof DealStage];
export const DEAL_STAGES: readonly DealStage[] = Object.values(DealStage);
export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  [DealStage.Lead]: 'Lead',
  [DealStage.Qualified]: 'Qualified',
  [DealStage.Proposal]: 'Proposal',
  [DealStage.Negotiation]: 'Negotiation',
  [DealStage.Won]: 'Won',
  [DealStage.Lost]: 'Lost',
};

/** The open stages shown as pipeline columns (excludes the closed Won/Lost). */
export const PIPELINE_STAGES: readonly DealStage[] = [
  DealStage.Lead,
  DealStage.Qualified,
  DealStage.Proposal,
  DealStage.Negotiation,
];

/** Win probability (0–100) associated with each pipeline stage. */
export const DEAL_STAGE_PROBABILITY: Record<DealStage, number> = {
  [DealStage.Lead]: 10,
  [DealStage.Qualified]: 30,
  [DealStage.Proposal]: 50,
  [DealStage.Negotiation]: 70,
  [DealStage.Won]: 100,
  [DealStage.Lost]: 0,
};

export function isOpenStage(stage: DealStage): boolean {
  return stage !== DealStage.Won && stage !== DealStage.Lost;
}

export interface DealDto {
  id: string;
  code: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  stage: DealStage;
  probability: number;
  weightedValue: number;
  expectedCloseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesStats {
  openDeals: number;
  openValue: number;
  weightedValue: number;
  wonValue: number;
  winRate: number;
}
