import { useState, useEffect } from 'react';
import recommendationService, { Recommendation, RiskMetric } from '../services/recommendationService';

const AIInsights = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [useML, setUseML] = useState(true); // Toggle for ML vs Technical Analysis

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const recs = useML 
        ? await recommendationService.generateMLRecommendations()
        : await recommendationService.generateRecommendations();
      const risks = recommendationService.calculateRiskMetrics(recs);
      setRecommendations(recs);
      setRiskMetrics(risks);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to generate recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
    // Refresh every 5 minutes
    const interval = setInterval(loadRecommendations, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useML]);

  const getActionBadgeStyle = (action: string) => {
    const baseStyle = 'px-4 py-1.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 transform hover:scale-105';
    if (action.includes('Buy')) return `${baseStyle} bg-black text-white shadow-lg`;
    if (action === 'Hold') return `${baseStyle} bg-gray-800 text-white shadow-md`;
    return `${baseStyle} bg-gray-600 text-white shadow-sm`;
  };

  const getRiskStatusColor = (status: 'Low' | 'Medium' | 'High') => {
    if (status === 'Low') return 'text-green-700 bg-green-50';
    if (status === 'Medium') return 'text-yellow-700 bg-yellow-50';
    return 'text-red-700 bg-red-50';
  };

  if (loading && recommendations.length === 0) {
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
            <p className="mt-6 text-gray-600 font-medium animate-pulse">Analyzing market data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-10 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-3 tracking-tight">AI Investment Insights</h1>
            <p className="text-gray-600 text-base">
              {useML ? '🤖 Machine Learning Predictions using LSTM Neural Networks' : '📊 Technical Analysis based on market indicators'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">
                Analysis Mode:
              </span>
              <button
                onClick={() => setUseML(!useML)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  useML 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {useML ? '🤖 ML Mode' : '📊 Technical'}
              </button>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button
              onClick={loadRecommendations}
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl shadow-md animate-slideIn">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Top Recommendations */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-black rounded-full"></div>
          <h2 className="text-2xl font-bold text-black">Top Recommendations</h2>
        </div>
        <div className="space-y-5">
          {recommendations.map((rec, index) => (
            <div
              key={rec.symbol}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-black to-gray-700 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1 tracking-tight">{rec.symbol}</h3>
                      <p className="text-gray-600 font-medium text-sm">{rec.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={getActionBadgeStyle(rec.action)}>
                      {rec.action}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Confidence Score</span>
                        <span className="font-bold text-black text-base">{rec.confidence}%</span>
                      </div>
                      <div className="relative bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-black to-gray-700 rounded-full transition-all duration-1000 ease-out shadow-lg"
                          style={{ width: `${rec.confidence}%` }}
                        >
                          <div className="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-black transition-colors duration-300">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Current Price</p>
                        <p className="text-xl font-bold text-black">${rec.currentPrice.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-black transition-colors duration-300">
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Target Price</p>
                        <p className="text-xl font-bold text-black">${rec.targetPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-3">Technical Analysis</p>
                    <p className="text-gray-800 leading-relaxed mb-4">{rec.reasoning}</p>
                    <div className="flex items-center gap-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                        rec.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span className="text-lg">{rec.changePercent >= 0 ? '↗' : '↘'}</span>
                        {Math.abs(rec.changePercent).toFixed(2)}% today
                      </div>
                      <div className="text-sm text-gray-600">
                        Upside: <span className="font-bold text-black">{((rec.targetPrice - rec.currentPrice) / rec.currentPrice * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-medium">
                  💡 Potential gain: <span className="text-black font-bold">${(rec.targetPrice - rec.currentPrice).toFixed(2)}</span> per share
                </p>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-6">No recommendations available at the moment.</p>
            <button
              onClick={loadRecommendations}
              className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Risk Analysis */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-black rounded-full"></div>
          <h2 className="text-2xl font-bold text-black">Risk Analysis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {riskMetrics.map((metric) => (
            <div key={metric.label} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-black text-base">{metric.label}</h3>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getRiskStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <div className="relative bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-3">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-black to-gray-700 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
              <p className="text-right text-sm font-bold text-gray-700">{metric.value}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-white rounded-2xl border-l-4 border-black p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-black font-bold">Disclaimer:</strong> These recommendations are generated using technical analysis 
              algorithms based on real-time market data. They should not be considered as financial advice. 
              Always conduct your own research and consult with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
