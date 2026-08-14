import api from './api';
import { DataSource } from './marketService';

export interface Holding {
  symbol: string;
  name: string;
  sector?: string | null;
  shares: number;
  avgCost: number;
  price: number | null;
  dayChangePercent: number | null;
  marketValue: number | null;
  costBasis: number;
  gain: number | null;
  gainPercent: number | null;
  spark: number[];
  weight: number;
  source: DataSource | 'unpriced';
  /** False when no quote was available; the row shows but is excluded from totals. */
  priced?: boolean;
}

export interface PortfolioTotals {
  totalValue: number;
  investedValue: number;
  cash: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface AllocationSlice {
  name: string;
  value: number;
}

export interface Portfolio {
  totals: PortfolioTotals;
  holdings: Holding[];
  allocation: AllocationSlice[];
  source: DataSource;
}

class PortfolioService {
  async getPortfolio(): Promise<Portfolio> {
    const { data } = await api.get<Portfolio>('/portfolio');
    return data;
  }

  /** Add a holding, or update shares/avg cost if the symbol is already held. */
  async upsertHolding(symbol: string, shares: number, avgCost: number): Promise<Portfolio> {
    const { data } = await api.post<Portfolio>('/portfolio/holdings', { symbol, shares, avgCost });
    return data;
  }

  async removeHolding(symbol: string): Promise<Portfolio> {
    const { data } = await api.delete<Portfolio>(`/portfolio/holdings/${symbol}`);
    return data;
  }
}

const portfolioService = new PortfolioService();
export default portfolioService;
