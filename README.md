# 📊 FinTrack - AI Financial Tracker

A modern, full-stack financial tracking application with real-time market data and AI-powered investment insights. Built with React, TypeScript, FastAPI, and a sleek black & white UI design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18.3+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-latest-green.svg)

## ✨ Features

### 📈 Real-Time Market Data
- **Stock Market**: Live stock prices, trending stocks, top gainers/losers
- **Cryptocurrency**: Real-time crypto market data and trends
- **Forex**: Foreign exchange rates and currency pairs

### 🤖 AI-Powered Insights
- Technical analysis using price momentum, volume, and market cap
- Smart investment recommendations (Strong Buy, Hold, Sell)
- Confidence scores based on multiple market indicators
- Real-time market analysis with automatic updates

### 🎨 Premium UI/UX
- Sleek black & white minimalist design
- Smooth animations and transitions
- Responsive dropdown navigation menu
- Interactive data visualizations
- Pre-loaders for seamless user experience

### 🔐 Secure Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- User profile management

## 🚀 Deployment

### 🌐 Deploy to Cloud (FREE)

Want to make your project live and accessible to everyone? **[See DEPLOYMENT.md](DEPLOYMENT.md)** for a complete step-by-step guide to deploy on:
- **Railway** (backend) - $5 free credits/month
- **Vercel** (frontend) - 100% free forever

**Deploy time: ~10 minutes | No credit card needed**

---

## 💻 Local Development

### Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.9 or higher** ([Download Python](https://www.python.org/downloads/))
- **Node.js 16 or higher** ([Download Node.js](https://nodejs.org/))
- **Git** ([Download Git](https://git-scm.com/downloads))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fintrack.git
cd fintrack
```

#### 2. Backend Setup

Navigate to the backend directory and set up a virtual environment:

```bash
# Windows
cd backend
python -m venv venv
venv\Scripts\activate

# macOS/Linux
cd backend
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```bash
# backend/.env
SECRET_KEY=your_super_secret_key_change_this_in_production
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

Initialize the database:

```bash
python init_db.py
```

#### 3. Frontend Setup

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:8000
```

### Running the Application

#### Start Backend Server

From the `backend` directory (with virtual environment activated):

```bash
# Windows
python -m uvicorn app.main:app --reload

# macOS/Linux
python3 -m uvicorn app.main:app --reload
```

The backend API will be available at: **http://localhost:8000**

#### Start Frontend Development Server

From the `frontend` directory (in a new terminal):

```bash
npm start
```

The frontend application will open automatically at: **http://localhost:3000**

### 🎉 You're Ready!

1. Open your browser to **http://localhost:3000**
2. Register a new account or use demo credentials:
   - **Email**: `demo@fintrack.com`
   - **Password**: `demo123`
3. Explore the Markets, AI Insights, and Profile pages!

## 📁 Project Structure

```
fintrack/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes and endpoints
│   │   │   ├── endpoints/  # Auth, Users, Market endpoints
│   │   │   └── api_v1/     # API version 1 router
│   │   ├── core/           # Configuration and security
│   │   ├── db/             # Database setup and session
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic schemas for validation
│   │   ├── services/       # Business logic layer
│   │   └── main.py         # FastAPI application entry point
│   ├── .env                # Environment variables
│   ├── init_db.py          # Database initialization script
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React + TypeScript frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── Layout.tsx # Main layout wrapper
│   │   │   └── Sidebar.tsx # Navigation dropdown menu
│   │   ├── pages/         # Page components
│   │   │   ├── AIInsights.tsx    # AI recommendations page
│   │   │   ├── Markets.tsx       # Market data page
│   │   │   ├── Profile.tsx       # User profile page
│   │   │   ├── Login.tsx         # Login page
│   │   │   └── Register.tsx      # Registration page
│   │   ├── services/      # API client services
│   │   │   ├── api.ts                  # Axios API client
│   │   │   ├── marketService.ts        # Market data service
│   │   │   └── recommendationService.ts # AI recommendation engine
│   │   ├── App.tsx        # Root component with routing
│   │   ├── index.tsx      # React entry point
│   │   └── index.css      # Global styles and animations
│   ├── .env               # Frontend environment variables
│   ├── package.json       # Node dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
│
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance async web framework |
| **SQLAlchemy** | SQL toolkit and ORM |
| **Pydantic** | Data validation and settings |
| **JWT** | Token-based authentication |
| **Bcrypt** | Password hashing |
| **yfinance** | Yahoo Finance API for market data |
| **SQLite** | Lightweight database (production: PostgreSQL) |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animation library |

## 🔌 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login user
GET    /api/v1/auth/me                # Get current user
```

#### Market Data
```
GET    /api/v1/market/stocks/trending        # Get trending stocks
GET    /api/v1/market/stocks/movers          # Get top gainers/losers
GET    /api/v1/market/stocks/search?q=AAPL   # Search stocks
GET    /api/v1/market/stock/{symbol}         # Get stock details
```

#### User
```
GET    /api/v1/users/me               # Get user profile
PUT    /api/v1/users/me               # Update user profile
```

## 🎨 UI Design System

### Color Palette
- **Primary**: Black (#000000)
- **Background**: Gray gradient (from-gray-50 to-gray-100)
- **Cards**: White with black top border
- **Accent**: Gray scale for hierarchy

### Typography
- **Headers**: text-4xl (36px)
- **Sections**: text-2xl (24px)
- **Subsections**: text-xl (20px)
- **Body**: text-base (16px)

### Animations
- **Hover Scale**: transform hover:scale-105
- **Transitions**: duration-300 / duration-500
- **Shadow Lift**: shadow-lg hover:shadow-2xl
- **Smooth Translate**: hover:-translate-y-1

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/build` directory.

## 🌍 Environment Variables

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

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

**Database errors:**
```bash
# Delete and reinitialize database
rm backend/test.db
python backend/init_db.py
```

### Frontend Issues

**Module not found errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 already in use:**
```bash
# Set different port
# Windows
set PORT=3001 && npm start

# macOS/Linux
PORT=3001 npm start
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dennis Sharon**
- Email: dennis.sharon@email.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the amazing Python web framework
- [React](https://react.dev/) for the powerful UI library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Yahoo Finance](https://finance.yahoo.com/) for market data

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Email: dennis.sharon@email.com

---

**⭐ Star this repository if you find it helpful!**
