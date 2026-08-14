import api from './api';

interface WatchlistResponse {
  symbols: string[];
}

class WatchlistService {
  async get(): Promise<string[]> {
    const { data } = await api.get<WatchlistResponse>('/watchlist');
    return data.symbols;
  }
  async add(symbol: string): Promise<string[]> {
    const { data } = await api.post<WatchlistResponse>('/watchlist', { symbol });
    return data.symbols;
  }
  async remove(symbol: string): Promise<string[]> {
    const { data } = await api.delete<WatchlistResponse>(`/watchlist/${symbol}`);
    return data.symbols;
  }
}

const watchlistService = new WatchlistService();
export default watchlistService;
