import yfinance as yf
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import pandas as pd

class MarketService:
    """Service for fetching real-time market data using Yahoo Finance"""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = timedelta(minutes=5)  # Cache data for 5 minutes
    
    def get_stock_price(self, symbol: str) -> Optional[Dict]:
        """Get current price and basic info for a single stock"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Get the most recent price data
            hist = ticker.history(period="1d", interval="1m")
            if hist.empty:
                hist = ticker.history(period="5d")
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            open_price = hist['Open'].iloc[0]
            change = current_price - open_price
            change_percent = (change / open_price) * 100 if open_price != 0 else 0
            
            return {
                "symbol": symbol.upper(),
                "name": info.get("longName", symbol),
                "price": round(float(current_price), 2),
                "change": round(float(change), 2),
                "changePercent": round(float(change_percent), 2),
                "open": round(float(open_price), 2),
                "high": round(float(hist['High'].max()), 2),
                "low": round(float(hist['Low'].min()), 2),
                "volume": int(hist['Volume'].sum()),
                "marketCap": info.get("marketCap"),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    def get_multiple_stocks(self, symbols: List[str]) -> List[Dict]:
        """Get current prices for multiple stocks"""
        results = []
        for symbol in symbols:
            data = self.get_stock_price(symbol)
            if data:
                results.append(data)
        return results
    
    def get_market_indices(self) -> List[Dict]:
        """Get major market indices"""
        indices = {
            "^GSPC": "S&P 500",
            "^IXIC": "NASDAQ",
            "^DJI": "DOW JONES"
        }
        
        results = []
        for symbol, name in indices.items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="2d")
                
                if len(hist) >= 2:
                    current_price = hist['Close'].iloc[-1]
                    previous_price = hist['Close'].iloc[-2]
                    change = current_price - previous_price
                    change_percent = (change / previous_price) * 100
                    
                    results.append({
                        "symbol": symbol,
                        "name": name,
                        "value": round(float(current_price), 2),
                        "change": round(float(change), 2),
                        "changePercent": round(float(change_percent), 2),
                        "timestamp": datetime.now().isoformat()
                    })
            except Exception as e:
                print(f"Error fetching index {symbol}: {str(e)}")
                continue
        
        return results
    
    def get_trending_stocks(self, limit: int = 10) -> List[Dict]:
        """Get trending stocks (using predefined popular stocks)"""
        # Popular stocks to show as "trending"
        popular_symbols = [
            "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", 
            "NVDA", "META", "AMD", "NFLX", "DIS"
        ]
        
        stocks = self.get_multiple_stocks(popular_symbols[:limit])
        # Sort by absolute change percent to show most volatile
        return sorted(stocks, key=lambda x: abs(x.get('changePercent', 0)), reverse=True)
    
    def get_top_gainers_losers(self) -> Dict[str, List[Dict]]:
        """Get top gaining and losing stocks"""
        # Extended list of popular stocks
        symbols = [
            "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "AMD",
            "NFLX", "DIS", "COIN", "ROKU", "UBER", "SNAP", "SNOW", "PLTR",
            "BA", "GE", "F", "GM"
        ]
        
        stocks = self.get_multiple_stocks(symbols)
        
        # Sort by change percent
        sorted_stocks = sorted(stocks, key=lambda x: x.get('changePercent', 0), reverse=True)
        
        return {
            "gainers": sorted_stocks[:5],  # Top 5 gainers
            "losers": sorted_stocks[-5:]   # Top 5 losers
        }
    
    def get_stock_history(self, symbol: str, period: str = "1mo") -> List[Dict]:
        """Get historical price data for a stock"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            history = []
            for date, row in hist.iterrows():
                history.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "open": round(float(row['Open']), 2),
                    "high": round(float(row['High']), 2),
                    "low": round(float(row['Low']), 2),
                    "close": round(float(row['Close']), 2),
                    "volume": int(row['Volume'])
                })
            
            return history
        except Exception as e:
            print(f"Error fetching history for {symbol}: {str(e)}")
            return []
    
    def search_stocks(self, query: str) -> List[Dict]:
        """Search for stocks by symbol or name"""
        if not query or len(query.strip()) == 0:
            return []
        
        query = query.strip()
        results = []
        
        # First, try to search as a direct symbol
        try:
            # Try the query as a direct ticker symbol
            stock_data = self.get_stock_price(query.upper())
            if stock_data:
                results.append(stock_data)
        except:
            pass
        
        # If query is less than 3 characters and we found a direct match, return it
        if len(query) < 3 and results:
            return results
        
        # Search in a comprehensive list of common stocks
        common_stocks = {
            # Tech Giants
            "AAPL": "Apple Inc.",
            "GOOGL": "Alphabet Inc.",
            "GOOG": "Alphabet Inc. Class C",
            "MSFT": "Microsoft Corporation",
            "AMZN": "Amazon.com Inc.",
            "META": "Meta Platforms Inc.",
            "NVDA": "NVIDIA Corporation",
            "TSLA": "Tesla Inc.",
            "AMD": "Advanced Micro Devices",
            "INTC": "Intel Corporation",
            "CRM": "Salesforce Inc.",
            "ORCL": "Oracle Corporation",
            "ADBE": "Adobe Inc.",
            "NFLX": "Netflix Inc.",
            "AVGO": "Broadcom Inc.",
            
            # Financial
            "JPM": "JPMorgan Chase & Co.",
            "BAC": "Bank of America Corp",
            "WFC": "Wells Fargo & Company",
            "GS": "Goldman Sachs Group",
            "MS": "Morgan Stanley",
            "C": "Citigroup Inc.",
            "BLK": "BlackRock Inc.",
            "AXP": "American Express Company",
            "V": "Visa Inc.",
            "MA": "Mastercard Inc.",
            "PYPL": "PayPal Holdings Inc.",
            "BRK.B": "Berkshire Hathaway Inc.",
            "SQ": "Block Inc.",
            "COIN": "Coinbase Global Inc.",
            
            # Retail & Consumer
            "WMT": "Walmart Inc.",
            "COST": "Costco Wholesale Corp",
            "HD": "The Home Depot Inc.",
            "TGT": "Target Corporation",
            "LOW": "Lowe's Companies Inc.",
            "NKE": "Nike Inc.",
            "SBUX": "Starbucks Corporation",
            "MCD": "McDonald's Corporation",
            "DIS": "The Walt Disney Company",
            "CMCSA": "Comcast Corporation",
            
            # Healthcare & Pharma
            "JNJ": "Johnson & Johnson",
            "UNH": "UnitedHealth Group",
            "PFE": "Pfizer Inc.",
            "ABBV": "AbbVie Inc.",
            "TMO": "Thermo Fisher Scientific",
            "ABT": "Abbott Laboratories",
            "MRK": "Merck & Co. Inc.",
            "LLY": "Eli Lilly and Company",
            "BMY": "Bristol-Myers Squibb",
            "AMGN": "Amgen Inc.",
            
            # Industrial & Manufacturing
            "BA": "Boeing Company",
            "GE": "General Electric Company",
            "CAT": "Caterpillar Inc.",
            "MMM": "3M Company",
            "HON": "Honeywell International",
            "UPS": "United Parcel Service",
            "FDX": "FedEx Corporation",
            "LMT": "Lockheed Martin Corp",
            "RTX": "Raytheon Technologies",
            
            # Automotive
            "F": "Ford Motor Company",
            "GM": "General Motors Company",
            "RIVN": "Rivian Automotive Inc.",
            "LCID": "Lucid Group Inc.",
            
            # Energy
            "XOM": "Exxon Mobil Corporation",
            "CVX": "Chevron Corporation",
            "COP": "ConocoPhillips",
            "SLB": "Schlumberger Limited",
            "EOG": "EOG Resources Inc.",
            
            # Communications & Social
            "T": "AT&T Inc.",
            "VZ": "Verizon Communications",
            "TMUS": "T-Mobile US Inc.",
            "SNAP": "Snap Inc.",
            "SPOT": "Spotify Technology",
            "UBER": "Uber Technologies",
            "LYFT": "Lyft Inc.",
            "DASH": "DoorDash Inc.",
            
            # Semiconductors
            "TSM": "Taiwan Semiconductor",
            "ASML": "ASML Holding N.V.",
            "QCOM": "QUALCOMM Inc.",
            "TXN": "Texas Instruments",
            "MU": "Micron Technology",
            
            # Software & Cloud
            "NOW": "ServiceNow Inc.",
            "SNOW": "Snowflake Inc.",
            "DDOG": "Datadog Inc.",
            "ZM": "Zoom Video Communications",
            "TEAM": "Atlassian Corporation",
            "WDAY": "Workday Inc.",
            "PLTR": "Palantir Technologies",
            
            # E-commerce & Payments
            "SHOP": "Shopify Inc.",
            "EBAY": "eBay Inc.",
            "BABA": "Alibaba Group",
            "PDD": "PDD Holdings Inc.",
            
            # Gaming & Entertainment
            "RBLX": "Roblox Corporation",
            "EA": "Electronic Arts Inc.",
            "ATVI": "Activision Blizzard",
            "TTWO": "Take-Two Interactive",
            "ROKU": "Roku Inc.",
            
            # Consumer Goods
            "PG": "Procter & Gamble Co.",
            "KO": "The Coca-Cola Company",
            "PEP": "PepsiCo Inc.",
            "PM": "Philip Morris International",
            "CL": "Colgate-Palmolive Company",
        }
        
        query_lower = query.lower()
        query_upper = query.upper()
        
        # Search through the common stocks
        for symbol, name in common_stocks.items():
            # Skip if already in results
            if results and results[0]['symbol'] == symbol:
                continue
                
            # Match by symbol or name
            if (query_upper in symbol or 
                query_lower in name.lower() or
                any(word.startswith(query_lower) for word in name.lower().split())):
                
                stock_data = self.get_stock_price(symbol)
                if stock_data:
                    results.append(stock_data)
                    
                # Limit to 15 results
                if len(results) >= 15:
                    break
        
        # If still no results and query looks like a symbol (short and uppercase-ish)
        # Try a few variations
        if not results and len(query) <= 5:
            variations = [
                query.upper(),
                f"{query.upper()}",
            ]
            
            for variant in variations:
                try:
                    stock_data = self.get_stock_price(variant)
                    if stock_data:
                        results.append(stock_data)
                        break
                except:
                    continue
        
        return results

# Singleton instance
market_service = MarketService()
