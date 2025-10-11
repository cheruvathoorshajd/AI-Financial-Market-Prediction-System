import { useState, useEffect } from 'react';
import marketService, { StockData, MoversData } from '../services/marketService';

const Markets = () => {
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto' | 'forex'>('stocks');
  const [trendingStocks, setTrendingStocks] = useState<StockData[]>([]);
  const [movers, setMovers] = useState<MoversData>({ gainers: [], losers: [] });
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [trending, moversData] = await Promise.all([
        marketService.getTrending(6),
        marketService.getMovers()
      ]);
      setTrendingStocks(trending);
      setMovers(moversData);
      setError(null);
    } catch (err) {
      console.error('Error loading market data:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await marketService.searchStocks(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError(`No results found for "${searchQuery}". Try searching by stock symbol (e.g., AAPL, TSLA, MSFT)`);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  const displayStocks = searchResults.length > 0 ? searchResults : trendingStocks;

  if (loading && trendingStocks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-black"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-black rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium animate-pulse">Loading market data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="mb-10 bg-white rounded-2xl shadow-lg mx-8 mt-8 p-8 border-t-4 border-black">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">Markets</h1>
            <p className="text-gray-600 text-base">Real-time market data and analysis</p>
          </div>
          {(loading || searching) && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {searching ? 'Searching...' : 'Loading...'}
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveTab('stocks')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'stocks' 
                ? 'bg-black text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📈 Stocks
          </button>
          <button 
            onClick={() => setActiveTab('crypto')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'crypto' 
                ? 'bg-black text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🪙 Crypto
          </button>
          <button 
            onClick={() => setActiveTab('forex')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'forex' 
                ? 'bg-black text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💱 Forex
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {/* Search Bar - Only for Stocks */}
        {activeTab === 'stocks' && (
          <form onSubmit={handleSearch} className="mb-8 relative">
            <input
              type="text"
              placeholder="Search stocks by symbol or name (e.g., AAPL, Tesla)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-black transition-all duration-300 shadow-md hover:shadow-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-all duration-300 hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
        )}

        {error && activeTab === 'stocks' && (
          <div className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl shadow-md animate-slideIn">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-yellow-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stocks Tab */}
        {activeTab === 'stocks' && (
          <>
            {/* Trending Stocks */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 mb-8 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-black rounded-full"></div>
                  <h2 className="text-2xl font-bold text-black">
                    {searchResults.length > 0 ? `Search Results (${searchResults.length})` : 'Trending Stocks'}
                  </h2>
                </div>
              </div>
          {displayStocks.length === 0 && !loading && !searching ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-lg text-gray-600 mb-2 font-medium">No stocks found</p>
              <p className="text-sm text-gray-500">Try searching for a different symbol or company name</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayStocks.map((stock, index) => (
                <div key={index} className="p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xl font-bold text-black group-hover:text-gray-700 transition-colors">{stock.symbol}</div>
                      <div className="text-sm text-gray-600 mt-1">{stock.name}</div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                      stock.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {stock.changePercent >= 0 ? '↗' : '↘'} {Math.abs(stock.changePercent).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-black mb-2">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Vol: {(stock.volume / 1000000).toFixed(1)}M
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Market Movers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-green-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-black">Top Gainers</h2>
            </div>
            <div className="space-y-4">
              {movers.gainers.slice(0, 3).map((stock, index) => (
                <div key={index} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors rounded-lg px-3">
                  <div>
                    <div className="font-bold text-black text-base">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold text-base flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +{stock.changePercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-500">${stock.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-red-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-black">Top Losers</h2>
            </div>
            <div className="space-y-4">
              {movers.losers.slice(0, 3).map((stock, index) => (
                <div key={index} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors rounded-lg px-3">
                  <div>
                    <div className="font-bold text-black text-base">{stock.symbol}</div>
                    <div className="text-sm text-gray-600">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-bold text-base flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      {stock.changePercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-500">${stock.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
        )}

        {/* Crypto Tab */}
        {activeTab === 'crypto' && (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100 transform transition-all duration-500">
            <div className="max-w-lg mx-auto">
              <div className="text-8xl mb-6 animate-bounce">🪙</div>
              <h2 className="text-3xl font-bold text-black mb-4">Crypto Markets</h2>
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                We're working on bringing you real-time cryptocurrency data including Bitcoin, Ethereum, and more popular digital assets.
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-black rounded-xl text-sm font-bold border-2 border-gray-300 shadow-md">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coming Soon
              </div>
            </div>
          </div>
        )}

        {/* Forex Tab */}
        {activeTab === 'forex' && (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100 transform transition-all duration-500">
            <div className="max-w-lg mx-auto">
              <div className="text-8xl mb-6 animate-bounce">💱</div>
              <h2 className="text-3xl font-bold text-black mb-4">Forex Markets</h2>
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                We're building foreign exchange market data featuring major currency pairs like EUR/USD, GBP/USD, and more.
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-black rounded-xl text-sm font-bold border-2 border-gray-300 shadow-md">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coming Soon
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;
