import api from './api';
import { DataSource } from './marketService';

export type SignalDirection = 'up' | 'down' | 'neutral';

export interface InsightSignal {
  key: string;
  label: string;
  value: string;
  reading: string;
  direction: SignalDirection;
}

export interface Confidence {
  level: 'low' | 'tentative' | 'moderate';
  rationale: string;
}

export interface AssetInsight {
  symbol: string;
  name: string;
  method: 'heuristic';
  headline: string;
  summary: string;
  reasoning: string;
  limits: string;
  enough: boolean;
  observations: InsightSignal[];
  confidence: Confidence;
  source: DataSource;
  disclaimer: string;
}

export interface GroundingMover {
  symbol: string;
  changePercent: number;
  sector?: string | null;
}

export interface RankingRow {
  symbol: string;
  name?: string;
  valuePct: number;
  note?: string;
}

export interface Ranking {
  title: string;
  caption: string;
  rows: RankingRow[];
}

export interface AskAnswer {
  question: string;
  symbol: string | null;
  method: 'heuristic';
  headline: string;
  summary: string;
  reasoning: string;
  limits: string;
  enough: boolean;
  grounding: Array<InsightSignal | GroundingMover>;
  /** Ranked lists for "best performer" / model-outlook questions (may be empty). */
  rankings?: Ranking[];
  disclaimer: string;
}

export interface OutlookRow {
  symbol: string;
  name: string;
  last_price: number;
  forecast_return_pct: number;
  forecast_price: number;
  directional_accuracy: number;
  skill_vs_naive_pct: number;
}

export interface Outlook {
  model: 'LSTM';
  available: boolean;
  horizon: string;
  ranked: OutlookRow[];
  avg_skill_vs_naive_pct: number;
  honesty: string;
  disclaimer: string;
}

class InsightsService {
  async getAssetInsight(symbol: string): Promise<AssetInsight> {
    const { data } = await api.get<AssetInsight>(`/insights/asset/${symbol}`);
    return data;
  }

  async ask(question: string, symbol?: string): Promise<AskAnswer> {
    const { data } = await api.post<AskAnswer>('/insights/ask', {
      question,
      symbol: symbol ?? null,
    });
    return data;
  }

  /** Experimental LSTM ranked next-day outlook, with honest backtest metrics. */
  async getOutlook(limit = 8): Promise<Outlook> {
    const { data } = await api.get<Outlook>(`/insights/outlook?limit=${limit}`);
    return data;
  }
}

const insightsService = new InsightsService();
export default insightsService;
