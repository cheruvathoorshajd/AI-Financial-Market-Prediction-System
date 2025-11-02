"""
Machine Learning Stock Price Predictor using LSTM Neural Network
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from alpha_vantage.timeseries import TimeSeries
import os
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

try:
    from tensorflow import keras
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("Warning: TensorFlow not available. Using fallback prediction method.")


class MLStockPredictor:
    """
    Advanced ML-based stock price predictor using LSTM networks
    """
    
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length  # Days of historical data to use
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        self.api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "UP4DUV2FAQA27ENY")
        self.ts = TimeSeries(key=self.api_key, output_format='pandas')
        
    def fetch_historical_data(self, symbol: str, period: str = "2y") -> pd.DataFrame:
        """Fetch historical stock data using Alpha Vantage"""
        try:
            # Get full historical data (up to 20 years)
            data, meta_data = self.ts.get_daily(symbol=symbol, outputsize='full')
            
            if data.empty:
                raise ValueError(f"No data available for {symbol}")
            
            # Rename columns to match expected format
            df = pd.DataFrame({
                'Open': data['1. open'],
                'High': data['2. high'],
                'Low': data['3. low'],
                'Close': data['4. close'],
                'Volume': data['5. volume']
            })
            
            # Sort by date (oldest first)
            df = df.sort_index()
            
            # Filter by period if needed (approximate)
            if period == "6mo":
                df = df.tail(126)  # ~6 months of trading days
            elif period == "1y":
                df = df.tail(252)  # ~1 year of trading days
            elif period == "2y":
                df = df.tail(504)  # ~2 years of trading days
            
            # Add technical indicators
            df['MA7'] = df['Close'].rolling(window=7).mean()
            df['MA21'] = df['Close'].rolling(window=21).mean()
            df['MA50'] = df['Close'].rolling(window=50).mean()
            df['Price_Change'] = df['Close'].pct_change()
            df['Volume_Change'] = df['Volume'].pct_change()
            
            # Drop NaN values
            df = df.dropna()
            
            return df
        except Exception as e:
            print(f"Error fetching data for {symbol}: {str(e)}")
            return pd.DataFrame()
    
    def prepare_data(self, df: pd.DataFrame, target_column: str = 'Close'):
        """Prepare data for LSTM model"""
        # Select features for training
        features = ['Close', 'Volume', 'MA7', 'MA21', 'MA50', 'Price_Change', 'Volume_Change']
        data = df[features].values
        
        # Scale the data
        scaled_data = self.scaler.fit_transform(data)
        
        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i])
            y.append(scaled_data[i, 0])  # Predict Close price
        
        X, y = np.array(X), np.array(y)
        
        return X, y
    
    def build_lstm_model(self, input_shape):
        """Build LSTM neural network model"""
        if not TENSORFLOW_AVAILABLE:
            return None
            
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(units=50, return_sequences=True),
            Dropout(0.2),
            LSTM(units=50),
            Dropout(0.2),
            Dense(units=25),
            Dense(units=1)
        ])
        
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model
    
    def train_model(self, symbol: str, epochs: int = 50, batch_size: int = 32):
        """Train the LSTM model on historical data"""
        if not TENSORFLOW_AVAILABLE:
            print("TensorFlow not available. Cannot train model.")
            return False
            
        # Fetch data
        df = self.fetch_historical_data(symbol)
        if df.empty:
            return False
        
        # Prepare data
        X, y = self.prepare_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, shuffle=False
        )
        
        # Build model
        self.model = self.build_lstm_model((X_train.shape[1], X_train.shape[2]))
        
        # Early stopping to prevent overfitting
        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
        
        # Train model
        print(f"Training model for {symbol}...")
        self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_test, y_test),
            callbacks=[early_stop],
            verbose=1
        )
        
        return True
    
    def predict_next_days(self, symbol: str, days: int = 7):
        """Predict stock prices for the next N days"""
        try:
            df = self.fetch_historical_data(symbol)
            if df.empty:
                return self._fallback_prediction(symbol, days)
            
            if TENSORFLOW_AVAILABLE and self.model is None:
                # Train model if not already trained
                self.train_model(symbol, epochs=30)
            
            if not TENSORFLOW_AVAILABLE or self.model is None:
                return self._fallback_prediction(symbol, days)
            
            # Prepare recent data for prediction
            X, _ = self.prepare_data(df)
            last_sequence = X[-1:]
            
            predictions = []
            current_sequence = last_sequence.copy()
            
            for _ in range(days):
                # Predict next day
                pred = self.model.predict(current_sequence, verbose=0)
                predictions.append(pred[0, 0])
                
                # Update sequence for next prediction
                new_row = current_sequence[0, -1].copy()
                new_row[0] = pred[0, 0]  # Update Close price
                current_sequence = np.append(current_sequence[:, 1:, :], [[new_row]], axis=1)
            
            # Inverse transform predictions
            predictions = np.array(predictions).reshape(-1, 1)
            dummy = np.zeros((predictions.shape[0], self.scaler.n_features_in_))
            dummy[:, 0] = predictions[:, 0]
            predictions = self.scaler.inverse_transform(dummy)[:, 0]
            
            return {
                'symbol': symbol,
                'predictions': predictions.tolist(),
                'dates': [(datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(days)],
                'method': 'LSTM Neural Network',
                'confidence': 'High' if len(df) > 500 else 'Medium'
            }
            
        except Exception as e:
            print(f"Error in ML prediction: {str(e)}")
            return self._fallback_prediction(symbol, days)
    
    def _fallback_prediction(self, symbol: str, days: int = 7):
        """Fallback prediction using statistical methods when ML is not available"""
        try:
            df = self.fetch_historical_data(symbol, period="6mo")
            if df.empty:
                return None
            
            # Calculate trend using linear regression
            recent_prices = df['Close'].tail(30).values
            X_trend = np.arange(len(recent_prices)).reshape(-1, 1)
            
            # Simple linear regression
            mean_x = X_trend.mean()
            mean_y = recent_prices.mean()
            
            numerator = ((X_trend.flatten() - mean_x) * (recent_prices - mean_y)).sum()
            denominator = ((X_trend.flatten() - mean_x) ** 2).sum()
            slope = numerator / denominator
            intercept = mean_y - slope * mean_x
            
            # Predict future prices
            last_price = df['Close'].iloc[-1]
            predictions = []
            
            for i in range(1, days + 1):
                pred_value = intercept + slope * (len(recent_prices) + i)
                # Add some volatility based on historical std
                volatility = df['Close'].pct_change().std()
                predictions.append(float(pred_value))
            
            return {
                'symbol': symbol,
                'predictions': predictions,
                'dates': [(datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(days)],
                'method': 'Statistical Trend Analysis',
                'confidence': 'Medium'
            }
            
        except Exception as e:
            print(f"Error in fallback prediction: {str(e)}")
            return None
    
    def analyze_stock_ml(self, symbol: str):
        """
        Comprehensive ML analysis of a stock
        Returns prediction, trend, and recommendation
        """
        try:
            df = self.fetch_historical_data(symbol, period="1y")
            if df.empty:
                return None
            
            current_price = df['Close'].iloc[-1]
            
            # Get predictions
            prediction_result = self.predict_next_days(symbol, days=7)
            if not prediction_result:
                return None
            
            predictions = prediction_result['predictions']
            predicted_price = predictions[-1]  # 7-day prediction
            
            # Calculate metrics
            price_change = predicted_price - current_price
            price_change_pct = (price_change / current_price) * 100
            
            # Determine action based on prediction
            if price_change_pct > 5:
                action = 'Strong Buy'
                confidence = 85
            elif price_change_pct > 2:
                action = 'Buy'
                confidence = 70
            elif price_change_pct > -2:
                action = 'Hold'
                confidence = 60
            elif price_change_pct > -5:
                action = 'Sell'
                confidence = 70
            else:
                action = 'Strong Sell'
                confidence = 85
            
            # Calculate volatility
            volatility = df['Close'].pct_change().std() * 100
            
            # Generate reasoning
            reasons = []
            if price_change_pct > 0:
                reasons.append(f"ML model predicts {price_change_pct:.1f}% increase")
            else:
                reasons.append(f"ML model predicts {abs(price_change_pct):.1f}% decrease")
            
            if volatility > 3:
                reasons.append("high volatility detected")
            elif volatility < 1:
                reasons.append("stable price movement")
            
            reasons.append(f"analysis based on {len(df)} days of historical data")
            
            return {
                'symbol': symbol,
                'name': yf.Ticker(symbol).info.get('longName', symbol),
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'price_change': float(price_change),
                'price_change_percent': float(price_change_pct),
                'action': action,
                'confidence': confidence,
                'reasoning': ', '.join(reasons).capitalize(),
                'predictions': prediction_result['predictions'][:7],
                'prediction_dates': prediction_result['dates'][:7],
                'method': prediction_result['method'],
                'volatility': float(volatility),
                'trend': 'Bullish' if price_change_pct > 0 else 'Bearish'
            }
            
        except Exception as e:
            print(f"Error in ML analysis for {symbol}: {str(e)}")
            return None


# Global predictor instance
ml_predictor = MLStockPredictor()
