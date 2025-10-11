import api from './api';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
}

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface HistoryData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MoversData {
  gainers: StockData[];
  losers: StockData[];
}

class MarketService {
  async getStock(symbol: string): Promise<StockData> {
    const response = await api.get(`/market/stock/${symbol}`);
    return response.data;
  }

  async getStocks(symbols: string[]): Promise<StockData[]> {
    const symbolsStr = symbols.join(',');
    const response = await api.get(`/market/stocks?symbols=${symbolsStr}`);
    return response.data;
  }

  async getIndices(): Promise<IndexData[]> {
    const response = await api.get('/market/indices');
    return response.data;
  }

  async getTrending(limit: number = 10): Promise<StockData[]> {
    const response = await api.get(`/market/trending?limit=${limit}`);
    return response.data;
  }

  async getMovers(): Promise<MoversData> {
    const response = await api.get('/market/movers');
    return response.data;
  }

  async getHistory(symbol: string, period: string = '1mo'): Promise<HistoryData[]> {
    const response = await api.get(`/market/history/${symbol}?period=${period}`);
    return response.data;
  }

  async searchStocks(query: string): Promise<StockData[]> {
    const response = await api.get(`/market/search?q=${encodeURIComponent(query)}`);
    return response.data.results;
  }
}

const marketServiceInstance = new MarketService();
export default marketServiceInstance;
