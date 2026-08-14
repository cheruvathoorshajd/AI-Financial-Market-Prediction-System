import api from './api';

export type DataSource = 'live' | 'snapshot' | 'mixed';

export interface Quote {
  symbol: string;
  name: string;
  sector?: string | null;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number | null;
  timestamp: string;
  source: DataSource;
  /** Optional down-sampled close series for a sparkline (present on trending). */
  spark?: number[];
}

export interface IndexQuote {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  source: DataSource;
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trending {
  stocks: Quote[];
  source: DataSource;
}
export interface Movers {
  gainers: Quote[];
  losers: Quote[];
  source: DataSource;
}
export interface Indices {
  indices: IndexQuote[];
  source: DataSource;
}
export interface History {
  symbol: string;
  history: HistoryPoint[];
  source: DataSource;
}
export interface SearchResults {
  results: Quote[];
  source: DataSource;
}

/**
 * Market data client. Every endpoint carries an honest `source` field
 * ("live" | "snapshot" | "mixed"); the UI surfaces it rather than hiding it.
 */
class MarketService {
  async getStock(symbol: string): Promise<Quote> {
    const { data } = await api.get<Quote>(`/market/stock/${encodeURIComponent(symbol)}`);
    return data;
  }

  async getStocks(symbols: string[]): Promise<Trending> {
    const { data } = await api.get<Trending>(
      `/market/stocks?symbols=${encodeURIComponent(symbols.join(','))}`
    );
    return data;
  }

  async getIndices(): Promise<Indices> {
    const { data } = await api.get<Indices>('/market/indices');
    return data;
  }

  async getTrending(limit = 8): Promise<Trending> {
    const { data } = await api.get<Trending>(`/market/trending?limit=${limit}`);
    return data;
  }

  async getMovers(): Promise<Movers> {
    const { data } = await api.get<Movers>('/market/movers');
    return data;
  }

  async getHistory(symbol: string, period = '6mo'): Promise<History> {
    const { data } = await api.get<History>(
      `/market/history/${encodeURIComponent(symbol)}?period=${period}`
    );
    return data;
  }

  async search(query: string): Promise<SearchResults> {
    const { data } = await api.get<SearchResults>(
      `/market/search?q=${encodeURIComponent(query)}`
    );
    return data;
  }
}

const marketService = new MarketService();
export default marketService;
