# 🤖 Machine Learning Features

## Overview

This application now includes **real Machine Learning capabilities** using LSTM (Long Short-Term Memory) neural networks for stock price prediction and recommendation generation.

## 🧠 ML Architecture

### **LSTM Neural Network**
- **3-layer LSTM** with dropout for regularization
- **Sequence Length**: 60 days of historical data
- **Features Used**:
  - Closing Price
  - Trading Volume
  - 7-day Moving Average (MA7)
  - 21-day Moving Average (MA21)
  - 50-day Moving Average (MA50)
  - Price Change Percentage
  - Volume Change Percentage

### **Model Training**
- Trained on 2 years of historical data
- 80/20 train-test split
- Early stopping to prevent overfitting
- Adam optimizer with MSE loss

## 📊 Features

### 1. **Price Prediction**
```
GET /api/v1/ml/predict/{symbol}?days=7
```
- Predicts future stock prices for up to 30 days
- Returns prediction dates and confidence levels
- Uses LSTM neural network trained on historical patterns

### 2. **ML Analysis**
```
GET /api/v1/ml/analyze/{symbol}
```
- Comprehensive stock analysis using ML
- Provides:
  - 7-day price prediction
  - Buy/Hold/Sell recommendation
  - Confidence score (0-100)
  - Trend analysis (Bullish/Bearish)
  - Volatility metrics

### 3. **Batch Analysis**
```
GET /api/v1/ml/batch-analyze?symbols=AAPL,GOOGL,MSFT
```
- Analyze multiple stocks simultaneously
- Returns sorted results by confidence
- Limit: 10 stocks per request

### 4. **Custom Training**
```
POST /api/v1/ml/train/{symbol}?epochs=50
```
- Train custom models for specific stocks
- Adjustable epochs (10-200)
- Improves prediction accuracy

## 🎯 How It Works

### **Step 1: Data Collection**
```python
# Fetches 2 years of historical data from Yahoo Finance
stock_data = fetch_historical_data(symbol="AAPL", period="2y")
```

### **Step 2: Feature Engineering**
```python
# Calculates technical indicators
df['MA7'] = df['Close'].rolling(window=7).mean()
df['MA21'] = df['Close'].rolling(window=21).mean()
df['MA50'] = df['Close'].rolling(window=50).mean()
```

### **Step 3: Data Preprocessing**
```python
# Normalizes data to 0-1 range
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(data)
```

### **Step 4: LSTM Training**
```python
# Creates sequences of 60 days for prediction
model = Sequential([
    LSTM(50, return_sequences=True),
    Dropout(0.2),
    LSTM(50, return_sequences=True),
    Dropout(0.2),
    LSTM(50),
    Dense(25),
    Dense(1)
])
```

### **Step 5: Prediction**
```python
# Predicts future prices
predictions = model.predict(last_sequence)
future_prices = scaler.inverse_transform(predictions)
```

## 🔄 Frontend Integration

### **Toggle Between Modes**
Users can switch between:
- 🤖 **ML Mode**: Uses LSTM neural network predictions
- 📊 **Technical Mode**: Uses rule-based technical analysis

### **Usage in Frontend**
```typescript
// ML Prediction Service
import mlPredictionService from './services/mlPredictionService';

// Get ML recommendations
const recommendations = await mlPredictionService.generateMLRecommendations(10);

// Analyze specific stock
const analysis = await mlPredictionService.analyzeStock('AAPL');

// Get price predictions
const predictions = await mlPredictionService.predictStock('AAPL', 7);
```

## 📈 Recommendation Logic

### **Confidence Scoring**
- **Strong Buy** (85%): Predicted increase > 5%
- **Buy** (70%): Predicted increase 2-5%
- **Hold** (60%): Predicted change -2% to +2%
- **Sell** (70%): Predicted decrease 2-5%
- **Strong Sell** (85%): Predicted decrease > 5%

### **Fallback System**
If TensorFlow is not available or training fails, the system automatically falls back to **statistical trend analysis** using linear regression.

## 🚀 Performance

### **Accuracy**
- Predictions improve with more historical data
- Best for stocks with > 500 days of data
- Confidence levels adjust based on data availability

### **Speed**
- Initial training: 30-60 seconds per stock
- Predictions: < 1 second
- Batch analysis: 10-20 seconds for 10 stocks

## 📦 Dependencies

```
tensorflow>=2.13.0
keras>=2.13.0
numpy
pandas
scikit-learn
yfinance
```

## 🎓 Educational Note

This ML system uses **supervised learning** with **time series forecasting**. The LSTM network learns patterns from historical data to predict future prices. However, **past performance does not guarantee future results**. This tool should be used for educational purposes and combined with other analysis methods.

## 🔮 Future Enhancements

1. **Sentiment Analysis**: Integrate news and social media sentiment
2. **Ensemble Methods**: Combine multiple models for better accuracy
3. **Real-time Learning**: Update models with live data
4. **More Indicators**: Add RSI, MACD, Bollinger Bands
5. **Market Regime Detection**: Identify bull/bear markets
6. **Risk Management**: Add portfolio optimization

## 📝 License

This ML implementation is part of the AI Financial Market Prediction System and follows the same MIT license.
