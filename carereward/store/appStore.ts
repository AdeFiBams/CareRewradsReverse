import { create } from 'zustand';
import {
  MOCK_POINTS, MOCK_OPPORTUNITIES, MOCK_CLAIMS,
  MOCK_BENEFITS, REDEMPTION_OPTIONS,
} from '@/constants/mockData';
import type {
  Opportunity, Claim, Benefits, PointsSummary, RedemptionOption,
} from '@/types';

interface AppState {
  points: PointsSummary;
  opportunities: Opportunity[];
  claims: Claim[];
  benefits: Benefits;
  redemptionOptions: RedemptionOption[];
  isDataLoaded: boolean;

  // Actions
  loadData: () => Promise<void>;
  completeOpportunity: (id: string) => void;
  redeemPoints: (amount: number, optionId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  points: MOCK_POINTS,
  opportunities: MOCK_OPPORTUNITIES,
  claims: MOCK_CLAIMS,
  benefits: MOCK_BENEFITS,
  redemptionOptions: REDEMPTION_OPTIONS,
  isDataLoaded: false,

  loadData: async () => {
    // TODO: Replace with real API calls
    // const [points, opportunities, claims, benefits] = await Promise.all([
    //   api.get('/points'), api.get('/opportunities'),
    //   api.get('/claims'), api.get('/benefits'),
    // ]);
    await new Promise((r) => setTimeout(r, 600));
    set({ isDataLoaded: true });
  },

  completeOpportunity: (id: string) => {
    const { opportunities, points } = get();
    const opp = opportunities.find((o) => o.id === id);
    if (!opp || opp.status === 'completed') return;

    set({
      opportunities: opportunities.map((o) =>
        o.id === id ? { ...o, status: 'completed' } : o,
      ),
      points: {
        ...points,
        balance: points.balance + opp.pointsReward,
        earnedThisYear: points.earnedThisYear + opp.pointsReward,
        transactions: [
          {
            id: `t_${Date.now()}`,
            description: `Completed: ${opp.title}`,
            points: opp.pointsReward,
            type: 'earned',
            date: new Date().toISOString().split('T')[0],
            category: opp.type,
          },
          ...points.transactions,
        ],
      },
    });
  },

  redeemPoints: (amount: number, _optionId: string) => {
    const { points } = get();
    if (points.balance < amount) return;

    set({
      points: {
        ...points,
        balance: points.balance - amount,
        redeemedThisYear: points.redeemedThisYear + amount,
        savingsThisYear: points.savingsThisYear + amount / 100,
        transactions: [
          {
            id: `t_${Date.now()}`,
            description: 'Points redeemed',
            points: -amount,
            type: 'redeemed',
            date: new Date().toISOString().split('T')[0],
            category: 'redemption',
          },
          ...points.transactions,
        ],
      },
    });
  },
}));
