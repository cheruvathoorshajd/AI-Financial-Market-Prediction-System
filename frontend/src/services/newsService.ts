import api from './api';
import { DataSource } from './marketService';

export type NewsProvider = 'finnhub' | 'alphavantage' | 'snapshot';

export interface Article {
  title: string;
  url: string;
  source: string;
  summary: string;
  published: string; // ISO 8601
  tickers: string[];
  sentiment: string | null; // e.g. "Bullish" | "Bearish" | "Neutral" | null
  image: string | null;
  topics: string[];
}

export interface NewsResponse {
  articles: Article[];
  source: DataSource; // "live" | "snapshot"
  provider: NewsProvider;
  asOf?: string;
}

export interface NewsParams {
  topics?: string[];
  tickers?: string[];
  limit?: number;
}

/**
 * Finance/investing news. Every response is honestly labelled by `source`
 * ("live" | "snapshot") and `provider` so the UI never pretends a snapshot is
 * live.
 */
class NewsService {
  async getNews(params: NewsParams = {}): Promise<NewsResponse> {
    const q = new URLSearchParams();
    if (params.topics?.length) q.set('topics', params.topics.join(','));
    if (params.tickers?.length) q.set('tickers', params.tickers.join(','));
    q.set('limit', String(params.limit ?? 20));
    const { data } = await api.get<NewsResponse>(`/news?${q.toString()}`);
    return data;
  }
}

const newsService = new NewsService();
export default newsService;
