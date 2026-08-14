import { QueryClient, useMutation, useQuery, UseQueryResult } from 'react-query';
import marketService, {
  Trending,
  Movers,
  Indices,
  Quote,
  History,
  SearchResults,
} from '../services/marketService';
import portfolioService, { Portfolio } from '../services/portfolioService';
import insightsService, { AssetInsight, Outlook } from '../services/insightsService';
import newsService, { NewsResponse, NewsParams } from '../services/newsService';
import watchlistService from '../services/watchlistService';

/**
 * One shared client. Market data changes slowly (and is rate-limited upstream),
 * so we keep a generous stale time and never refetch on window focus — calm,
 * not chatty.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      cacheTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const useTrending = (limit = 8): UseQueryResult<Trending> =>
  useQuery(['trending', limit], () => marketService.getTrending(limit));

export const useMovers = (): UseQueryResult<Movers> =>
  useQuery('movers', () => marketService.getMovers());

export const useIndices = (): UseQueryResult<Indices> =>
  useQuery('indices', () => marketService.getIndices());

export const useStock = (symbol: string): UseQueryResult<Quote> =>
  useQuery(['stock', symbol], () => marketService.getStock(symbol), {
    enabled: Boolean(symbol),
  });

export const useHistory = (symbol: string, period = '6mo'): UseQueryResult<History> =>
  useQuery(['history', symbol, period], () => marketService.getHistory(symbol, period), {
    enabled: Boolean(symbol),
  });

export const useSearch = (query: string): UseQueryResult<SearchResults> =>
  useQuery(['search', query], () => marketService.search(query), {
    enabled: query.trim().length > 0,
    keepPreviousData: true,
  });

export const useStocks = (symbols: string[]): UseQueryResult<Trending> =>
  useQuery(['stocks', symbols.join(',')], () => marketService.getStocks(symbols), {
    enabled: symbols.length > 0,
  });

export const usePortfolio = (): UseQueryResult<Portfolio> =>
  useQuery('portfolio', () => portfolioService.getPortfolio());

export function usePortfolioMutations() {
  const onSuccess = (p: Portfolio): void => {
    queryClient.setQueryData('portfolio', p);
  };
  const upsert = useMutation(
    (v: { symbol: string; shares: number; avgCost: number }) =>
      portfolioService.upsertHolding(v.symbol, v.shares, v.avgCost),
    { onSuccess }
  );
  const remove = useMutation((symbol: string) => portfolioService.removeHolding(symbol), {
    onSuccess,
  });
  return { upsert, remove };
}

export const useAssetInsight = (symbol: string): UseQueryResult<AssetInsight> =>
  useQuery(['insight', symbol], () => insightsService.getAssetInsight(symbol), {
    enabled: Boolean(symbol),
    staleTime: 5 * 60_000,
  });

/** Experimental LSTM outlook — trained server-side; slow first call, then cached. */
export const useOutlook = (): UseQueryResult<Outlook> =>
  useQuery('outlook', () => insightsService.getOutlook(), {
    staleTime: 10 * 60_000,
    retry: 0,
  });

/** Finance news — cached hard (slow-moving, upstream is rate-limited). */
export const useNews = (params: NewsParams = {}): UseQueryResult<NewsResponse> =>
  useQuery(
    ['news', params.topics?.join(',') ?? '', params.tickers?.join(',') ?? '', params.limit ?? 20],
    () => newsService.getNews(params),
    { staleTime: 5 * 60_000 }
  );

/** Watchlist is per-user; only query when authenticated to avoid a 401 redirect. */
export const useWatchlist = (enabled: boolean): UseQueryResult<string[]> =>
  useQuery('watchlist', () => watchlistService.get(), { enabled });

export function useWatchlistMutations() {
  const onSuccess = (symbols: string[]): void => {
    queryClient.setQueryData('watchlist', symbols);
  };
  const add = useMutation((symbol: string) => watchlistService.add(symbol), { onSuccess });
  const remove = useMutation((symbol: string) => watchlistService.remove(symbol), { onSuccess });
  return { add, remove };
}
