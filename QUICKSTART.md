# 🚀 Quick Start Guide - FinTrack

**For developers who want to get up and running fast!**

## ⚡ Super Quick Setup (5 Minutes)

### Step 1: Clone the Repo
```bash
git clone https://github.com/yourusername/fintrack.git](https://github.com/cheruvathoorshajd/AI-Financial-Market-Prediction-System.git
cd fintrack
```

### Step 2: Backend Setup (2 minutes)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python init_db.py
python -m uvicorn app.main:app --reload
```
✅ Backend running at: http://localhost:8000

### Step 3: Frontend Setup (2 minutes)
**Open NEW terminal:**
```bash
cd frontend
npm install
npm start
```
✅ Frontend running at: http://localhost:3000

### Step 4: Test It! (1 minute)
1. Open browser: http://localhost:3000
2. Click **Register** → Create account
3. Login and explore!

---

## 🎯 Demo Credentials

```
Email: demo@fintrack.com
Password: demo123
```

---

## 📋 Essential Commands

### Backend
```bash
# Start server
python -m uvicorn app.main:app --reload

# Create new migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Run tests
pytest
```

### Frontend
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## 🐛 Common Issues

**"Port already in use"**
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**"Module not found"**
```bash
# Reinstall dependencies
cd backend
pip install -r requirements.txt

cd frontend
rm -rf node_modules
npm install
```

**"Database errors"**
```bash
# Reset database
cd backend
rm test.db
python init_db.py
```

---

## 🎨 Project Features

### ✅ What's Working:
- JWT Authentication (Login/Register)
- Real-time stock market data
- Crypto & Forex data
- AI-powered recommendations
- User profile management
- Smooth UI animations

### 🚧 Not Implemented:
- Portfolio management (removed)
- Transaction history (removed)
- Holdings tracking (removed)

---

## 📁 Key Files to Know

### Backend
```
backend/app/
├── main.py                    # FastAPI app entry point
├── api/endpoints/
│   ├── auth.py               # Login/Register
│   ├── users.py              # User profile
│   └── market.py             # Market data
└── services/
    ├── market_service.py     # Market data logic
    └── user_service.py       # User logic
```

### Frontend
```
frontend/src/
├── pages/
│   ├── Markets.tsx           # Market data page
│   ├── AIInsights.tsx        # AI recommendations
│   └── Profile.tsx           # User profile
└── services/
    ├── marketService.ts      # API calls
    └── recommendationService.ts  # AI logic
```

---

## 🔧 Configuration

### Backend (.env)
```properties
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env)
```properties
REACT_APP_API_URL=http://localhost:8000
```

---

## 📚 API Documentation

Once backend is running:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 💡 Pro Tips

1. **Use two terminals** - one for backend, one for frontend
2. **Keep virtual environment activated** when working on backend
3. **Check browser console** for frontend errors
4. **Check terminal output** for backend errors
5. **API docs are your friend** - visit `/docs` endpoint

---

## ✨ Next Steps

1. ✅ Get it running locally
2. 🎨 Customize the UI
3. 🚀 Add new features
4. 📦 Deploy to production

---



**Happy Coding! 🎉**
