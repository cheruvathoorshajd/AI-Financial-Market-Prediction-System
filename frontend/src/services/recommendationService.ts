import marketService, { StockData } from './marketService';
import mlPredictionService from './mlPredictionService';

export interface Recommendation {
  symbol: string;
  name: string;
  action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  confidence: number;
  reasoning: string;
  currentPrice: number;
  targetPrice: number;
  changePercent: number;
  actionColor: 'green' | 'yellow' | 'red';
  method?: string;
  predictions?: number[];
  predictionDates?: string[];
}

export interface RiskMetric {
  label: string;
  value: number;
  status: 'Low' | 'Medium' | 'High';
}

class RecommendationService {
  private calculateTechnicalScore(stock: StockData): number {
    let score = 50; // Base score
    
    // Price momentum (change percent impact)
    if (stock.changePercent > 5) score += 20;
    else if (stock.changePercent > 2) score += 10;
    else if (stock.changePercent > 0) score += 5;
    else if (stock.changePercent < -5) score -= 20;
    else if (stock.changePercent < -2) score -= 10;
    else if (stock.changePercent < 0) score -= 5;
    
    // Volume indicator (higher is better)
    if (stock.volume > 50000000) score += 15;
    else if (stock.volume > 20000000) score += 10;
    else if (stock.volume > 10000000) score += 5;
    
    // Market cap stability (larger caps are more stable)
    if (stock.marketCap && stock.marketCap > 1000000000000) score += 10; // > $1T
    else if (stock.marketCap && stock.marketCap > 100000000000) score += 5; // > $100B
    
    return Math.max(0, Math.min(100, score)); // Clamp between 0-100
  }

  private getActionFromScore(score: number): { action: Recommendation['action'], color: Recommendation['actionColor'] } {
    if (score >= 65) return { action: 'Strong Buy', color: 'green' };
    if (score >= 35) return { action: 'Hold', color: 'yellow' };
    return { action: 'Sell', color: 'red' };
  }

  private generateReasoning(stock: StockData, score: number): string {
    const reasons: string[] = [];
    
    if (stock.changePercent > 5) {
      reasons.push('Strong positive momentum');
    } else if (stock.changePercent > 2) {
      reasons.push('Positive price action');
    } else if (stock.changePercent < -5) {
      reasons.push('Significant downward pressure');
    } else if (stock.changePercent < -2) {
      reasons.push('Negative price momentum');
    }
    
    if (stock.volume > 50000000) {
      reasons.push('exceptionally high trading volume');
    } else if (stock.volume > 20000000) {
      reasons.push('strong trading volume');
    }
    
    if (stock.marketCap && stock.marketCap > 1000000000000) {
      reasons.push('large-cap stability');
    }
    
    if (score >= 70) {
      reasons.push('favorable technical indicators');
    } else if (score <= 30) {
      reasons.push('weak technical setup');
    }
    
    return reasons.length > 0 
      ? reasons.join(', ') + '.' 
      : 'Market conditions are neutral with mixed signals.';
  }

  async generateMLRecommendations(): Promise<Recommendation[]> {
    try {
      // Use Machine Learning predictions
      const mlAnalyses = await mlPredictionService.generateMLRecommendations(10);
      
      // Convert ML analyses to Recommendation format
      const recommendations: Recommendation[] = mlAnalyses.map(analysis => {
        const actionColor = analysis.action.includes('Buy') ? 'green' : 
                           analysis.action === 'Hold' ? 'yellow' : 'red';
        
        return {
          symbol: analysis.symbol,
          name: analysis.name,
          action: analysis.action,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          currentPrice: analysis.current_price,
          targetPrice: analysis.predicted_price,
          changePercent: analysis.price_change_percent,
          actionColor: actionColor,
          method: analysis.method,
          predictions: analysis.predictions,
          predictionDates: analysis.prediction_dates
        };
      });

      // Sort by confidence and return top 5
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating ML recommendations:', error);
      // Fallback to technical analysis if ML fails
      return this.generateRecommendations();
    }
  }

  async generateRecommendations(): Promise<Recommendation[]> {
    try {
      // Get market data
      const [trending, movers] = await Promise.all([
        marketService.getTrending(20),
        marketService.getMovers()
      ]);

      // Combine all stocks and remove duplicates
      const allStocks = [...trending, ...movers.gainers, ...movers.losers];
      const uniqueStocks = Array.from(
        new Map(allStocks.map(stock => [stock.symbol, stock])).values()
      );

      // Generate recommendations for each stock
      const recommendations: Recommendation[] = uniqueStocks.map(stock => {
        const score = this.calculateTechnicalScore(stock);
        const { action, color } = this.getActionFromScore(score);
        const reasoning = this.generateReasoning(stock, score);
        
        // Calculate target price (simple projection based on momentum)
        const targetMultiplier = score >= 65 ? 1.12 : score >= 35 ? 1.02 : 0.92;
        const targetPrice = stock.price * targetMultiplier;

        return {
          symbol: stock.symbol,
          name: stock.name,
          action,
          confidence: score,
          reasoning: reasoning.charAt(0).toUpperCase() + reasoning.slice(1),
          currentPrice: stock.price,
          targetPrice: parseFloat(targetPrice.toFixed(2)),
          changePercent: stock.changePercent,
          actionColor: color
        };
      });

      // Sort by confidence score (highest first) and return top 5
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  calculateRiskMetrics(recommendations: Recommendation[]): RiskMetric[] {
    if (recommendations.length === 0) {
      return [
        { label: 'Volatility Risk', value: 50, status: 'Medium' },
        { label: 'Market Exposure', value: 50, status: 'Medium' },
        { label: 'Diversification', value: 50, status: 'Medium' }
      ];
    }

    // Calculate average volatility from change percentages
    const avgVolatility = recommendations.reduce((sum, r) => sum + Math.abs(r.changePercent), 0) / recommendations.length;
    const volatilityScore = Math.min(100, avgVolatility * 10);
    const volatilityStatus = volatilityScore > 60 ? 'High' : volatilityScore > 30 ? 'Medium' : 'Low';

    // Calculate market exposure (how aggressive the recommendations are)
    const buyCount = recommendations.filter(r => r.action.includes('Buy')).length;
    const exposureScore = (buyCount / recommendations.length) * 100;
    const exposureStatus = exposureScore > 60 ? 'High' : exposureScore > 30 ? 'Medium' : 'Low';

    // Diversification (more recommendations = better diversification)
    const diversificationScore = Math.min(100, (recommendations.length / 10) * 100);
    const diversificationStatus = diversificationScore > 60 ? 'High' : diversificationScore > 30 ? 'Medium' : 'Low';

    return [
      { label: 'Volatility Risk', value: Math.round(volatilityScore), status: volatilityStatus },
      { label: 'Market Exposure', value: Math.round(exposureScore), status: exposureStatus },
      { label: 'Diversification', value: Math.round(diversificationScore), status: diversificationStatus }
    ];
  }
}

const recommendationService = new RecommendationService();
export default recommendationService;
