import api from './api';

export interface MLPrediction {
  symbol: string;
  predictions: number[];
  dates: string[];
  method: string;
  confidence: string;
}

export interface MLAnalysis {
  symbol: string;
  name: string;
  current_price: number;
  predicted_price: number;
  price_change: number;
  price_change_percent: number;
  action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  confidence: number;
  reasoning: string;
  predictions: number[];
  prediction_dates: string[];
  method: string;
  volatility: number;
  trend: 'Bullish' | 'Bearish';
}

export interface BatchAnalysisResult {
  results: MLAnalysis[];
  count: number;
}

class MLPredictionService {
  async predictStock(symbol: string, days: number = 7): Promise<MLPrediction> {
    const response = await api.get(`/ml/predict/${symbol}?days=${days}`);
    return response.data;
  }

  async analyzeStock(symbol: string): Promise<MLAnalysis> {
    const response = await api.get(`/ml/analyze/${symbol}`);
    return response.data;
  }

  async batchAnalyze(symbols: string[]): Promise<BatchAnalysisResult> {
    const symbolsStr = symbols.join(',');
    const response = await api.get(`/ml/batch-analyze?symbols=${symbolsStr}`);
    return response.data;
  }

  async trainModel(symbol: string, epochs: number = 50): Promise<any> {
    const response = await api.post(`/ml/train/${symbol}?epochs=${epochs}`);
    return response.data;
  }

  // Generate ML-powered recommendations for top stocks
  async generateMLRecommendations(limit: number = 10): Promise<MLAnalysis[]> {
    try {
      // Popular stocks to analyze
      const symbols = [
        'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA',
        'NVDA', 'META', 'AMD', 'NFLX', 'DIS'
      ];

      const result = await this.batchAnalyze(symbols.slice(0, limit));
      return result.results;
    } catch (error) {
      console.error('Error generating ML recommendations:', error);
      throw error;
    }
  }
}

const mlPredictionService = new MLPredictionService();
export default mlPredictionService;
