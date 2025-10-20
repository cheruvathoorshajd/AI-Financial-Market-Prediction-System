# 🚀 Deployment Guide - Free Hosting

## Overview
Deploy your AI Financial Market Prediction System for **FREE** using:
- **Frontend**: Vercel (unlimited bandwidth, automatic deployments)
- **Backend**: Render (750 free hours/month)

---

## 📦 Part 1: Deploy Backend to Render (5 minutes)

### Step 1: Create Render Account
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Select: `cheruvathoorshajd/AI-Financial-Market-Prediction-System`
   - Click **"Connect"**

### Step 3: Configure Service
Fill in these settings:

**Basic Settings:**
- **Name**: `ai-financial-backend` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Python 3`

**Build & Deploy:**
- **Build Command**: 
  ```bash
  pip install -r backend/requirements.txt
  ```
- **Start Command**:
  ```bash
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

**Instance Type:**
- Select **"Free"** (750 hours/month)

### Step 4: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these:
```
SECRET_KEY=your_super_secret_key_change_in_production_12345
DATABASE_URL=sqlite:///./test.db
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Step 5: Deploy!
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend will be live at: `https://ai-financial-backend.onrender.com`

✅ **Backend Deployed!** Copy your backend URL.

---

## 🎨 Part 2: Deploy Frontend to Vercel (3 minutes)

### Step 1: Update Frontend API URL
Before deploying, update the API URL in your frontend:

1. Create `.env.production` in frontend folder:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api/v1
   ```
   (Replace with your actual Render URL from Part 1)

### Step 2: Create Vercel Account
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with your GitHub account

### Step 3: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import from GitHub:
   - Select: `cheruvathoorshajd/AI-Financial-Market-Prediction-System`
   - Click **"Import"**

### Step 4: Configure Project
**Framework Preset:** Create React App (auto-detected)

**Root Directory:** 
- Click **"Edit"**
- Set to: `frontend`

**Build Settings:**
- Build Command: `npm run build` (default)
- Output Directory: `build` (default)
- Install Command: `npm install` (default)

**Environment Variables:**
Click **"Add"** and add:
```
Name: REACT_APP_API_URL
Value: https://your-backend-url.onrender.com/api/v1
```

### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app will be live at: `https://your-project-name.vercel.app`

✅ **Frontend Deployed!**

---

## 🔄 Part 3: Update CORS (Important!)

After getting your Vercel URL, update the backend CORS:

1. Go to Render Dashboard → Your Service
2. Go to **"Environment"** tab
3. Add environment variable:
   ```
   BACKEND_CORS_ORIGINS=["https://your-vercel-url.vercel.app"]
   ```
4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## ✅ Verification

### Test Backend:
```
https://your-backend.onrender.com/docs
```
Should show API documentation.

### Test Frontend:
```
https://your-project.vercel.app
```
Should load your app and connect to backend!

---

## 🎯 Your Live URLs:

**Frontend (Vercel):**
- Production: `https://your-project.vercel.app`
- Preview: Auto-generated for each commit

**Backend (Render):**
- Production: `https://your-backend.onrender.com`
- API Docs: `https://your-backend.onrender.com/docs`

---

## 📝 Important Notes

### Free Tier Limitations:

**Render (Backend):**
- ⏰ 750 hours/month (enough for 24/7 if only one service)
- 💤 Sleeps after 15 min of inactivity
- ⚡ Cold start: ~30 seconds on first request
- 💾 500 MB RAM
- 🔄 Auto-deploys on git push

**Vercel (Frontend):**
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ No sleep/downtime
- 🔄 Auto-deploys on git push

### Pro Tips:

1. **Keep Backend Awake**: Use a service like UptimeRobot to ping your backend every 5 minutes
2. **Custom Domain**: Both Vercel and Render support custom domains (free)
3. **Auto-Deploy**: Both platforms auto-deploy when you push to GitHub
4. **Logs**: Check deployment logs on each platform's dashboard

---

## 🔧 Troubleshooting

**Backend not responding:**
- Check Render logs in dashboard
- Verify environment variables are set
- Backend may be sleeping (first request takes 30s)

**Frontend can't connect to backend:**
- Check CORS settings in backend
- Verify API URL in frontend .env.production
- Check browser console for errors

**Build fails:**
- Check build logs
- Verify all dependencies in requirements.txt/package.json
- Check Node/Python versions

---

## 🎉 Success!

Your AI Financial Market Prediction System is now **LIVE** and accessible worldwide!

**Share your project:**
- Frontend: `https://your-project.vercel.app`
- GitHub: `https://github.com/cheruvathoorshajd/AI-Financial-Market-Prediction-System`

Both platforms offer:
✅ Free SSL certificates
✅ Automatic deployments
✅ Easy rollbacks
✅ Analytics
✅ No credit card required!

---

## 📚 Alternative Options

If you want to explore other hosting options:

**Backend Alternatives:**
- Railway (500 hours free)
- Fly.io (3 VMs free)
- PythonAnywhere (basic free tier)
- Heroku (no longer has free tier)

**Frontend Alternatives:**
- Netlify (100 GB bandwidth/month)
- GitHub Pages (unlimited for static sites)
- Cloudflare Pages (unlimited bandwidth)

**All-in-One:**
- Railway (host both frontend & backend)
- Fly.io (host both)
