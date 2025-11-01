# 🚀 Deploy to Render - Complete Guide

## Why Render?

✅ **750 hours/month FREE** (more than Railway's $5 credits)  
✅ **Simple setup** - One-click deploy from GitHub  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Python 3.11 support** - Perfect for your FastAPI + TensorFlow app  

---

## 📋 Deploy Backend to Render (7 Minutes)

### Step 1: Sign Up for Render

1. Go to **https://render.com**
2. Click **"Get Started"**
3. Sign up with **GitHub account**
4. Authorize Render to access your repositories

---

### Step 2: Create Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** (if not already connected)
3. Find and select: **`AI-Financial-Market-Prediction-System`**
4. Click **"Connect"**

---

### Step 3: Configure Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `ai-financial-backend` (or your choice) |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | Leave blank |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | **Free** |

---

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these **4 variables**:

1. **SECRET_KEY**
   - Value: `your-super-secret-key-change-this-to-something-random-and-long-123456789`
   - (Make it long and random!)

2. **DATABASE_URL**
   - Value: `sqlite:///./sql_app.db`

3. **ACCESS_TOKEN_EXPIRE_MINUTES**
   - Value: `30`

4. **BACKEND_CORS_ORIGINS**
   - Value: `["https://ai-financial-frontend.onrender.com"]`
   - (We'll update this after frontend deployment)

5. **PYTHON_VERSION**
   - Value: `3.11.0`

---

### Step 5: Deploy!

1. Click **"Create Web Service"**
2. Wait 5-8 minutes for build to complete
3. Watch the logs - you'll see:
   - Installing dependencies
   - TensorFlow loading
   - Server starting

✅ **Your backend URL**: `https://ai-financial-backend.onrender.com`

**Copy this URL** - you'll need it for frontend!

---

## 🎨 Deploy Frontend to Render (5 Minutes)

### Step 1: Create Static Site

1. From Render Dashboard, click **"New +"** → **"Static Site"**
2. Select your repository: **`AI-Financial-Market-Prediction-System`**
3. Click **"Connect"**

---

### Step 2: Configure Static Site

| Setting | Value |
|---------|-------|
| **Name** | `ai-financial-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

---

### Step 3: Add Environment Variable

Click **"Advanced"** → **"Add Environment Variable"**

**REACT_APP_API_URL**
- Value: `https://ai-financial-backend.onrender.com/api/v1`
- (Use your actual backend URL from Step 5 above)

---

### Step 4: Deploy!

1. Click **"Create Static Site"**
2. Wait 3-5 minutes for build
3. Your app will be live!

✅ **Your frontend URL**: `https://ai-financial-frontend.onrender.com`

---

## 🔄 Update Backend CORS

**Important:** Now that you have your frontend URL, update backend:

1. Go to your **backend service** in Render
2. Click **"Environment"** tab
3. Find **BACKEND_CORS_ORIGINS**
4. Update to: `["https://ai-financial-frontend.onrender.com"]`
   - (Use your actual frontend URL)
5. Click **"Save Changes"**
6. Service will automatically redeploy (~2 minutes)

---

## 🎉 You're Live!

Your URLs:
- **Frontend**: `https://ai-financial-frontend.onrender.com`
- **Backend API**: `https://ai-financial-backend.onrender.com`
- **API Docs**: `https://ai-financial-backend.onrender.com/docs`

---

## 🧪 Test Your Deployment

1. Visit your frontend URL
2. Click **"Register"** to create account
3. Try all features:
   - View Markets
   - Get AI Insights
   - See ML Predictions

---

## 💰 Render Free Tier Details

### Backend (Web Service):
- ✅ **750 hours/month FREE**
- ✅ **512 MB RAM**
- ✅ **0.1 CPU**
- ⚠️ **Sleeps after 15 min inactivity** (wakes automatically)
- ⚠️ **Cold start**: ~30 seconds first visit

### Frontend (Static Site):
- ✅ **100% FREE forever**
- ✅ **100 GB bandwidth/month**
- ✅ **Instant loading** (no cold starts)
- ✅ **Global CDN**

---

## 🔄 Automatic Deployments

Every time you push to GitHub:
1. ✅ Render detects changes
2. ✅ Automatically rebuilds & deploys
3. ✅ Live in ~5 minutes

---

## 🛠️ Troubleshooting

### Issue: Build fails with TensorFlow error

**Solution**: Render uses Python 3.11 by default. If you see TensorFlow issues:
1. Check `backend/requirements.txt` has `tensorflow==2.15.0`
2. Ensure `PYTHON_VERSION=3.11.0` in environment variables

---

### Issue: Backend sleeps (cold starts)

**Solution**: This is normal on free tier. Options:
1. Use a **ping service** (like cron-job.org) to keep it awake
2. Upgrade to paid plan ($7/month for always-on)
3. Accept 30-second cold start on first visit

---

### Issue: Frontend can't reach backend

**Solution**: Check CORS settings:
1. Go to backend service → Environment
2. Verify `BACKEND_CORS_ORIGINS` includes your frontend URL
3. Save and wait for redeploy

---

### Issue: Database resets after deploy

**Solution**: Render's free tier doesn't persist SQLite on disk. Options:
1. Use **Render PostgreSQL** (free tier available)
2. Upgrade to paid plan with persistent disk
3. Accept that users need to re-register after deploys

---

## 📱 Share Your Project

Send this URL to anyone:
```
https://ai-financial-frontend.onrender.com
```

They can:
- ✅ Register & login
- ✅ View real-time market data
- ✅ Get AI recommendations
- ✅ See ML predictions

---

## 🎯 Pro Tips

### 1. Keep Service Awake
Use **cron-job.org** (free):
- Create job to ping your backend URL every 10 minutes
- Prevents cold starts
- Keeps app responsive

### 2. Monitor Deployments
- Render Dashboard shows all deploy logs
- Set up email notifications for failed builds
- Check "Events" tab for deployment history

### 3. Custom Domain (Optional)
- Add custom domain in Render dashboard
- Free SSL certificate included
- Point your domain's DNS to Render

### 4. Database Upgrade
For production, consider:
- Render PostgreSQL (free tier: 256 MB)
- More reliable than SQLite
- Data persists across deployments

---

## ⚡ Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| **Free Hours** | 750/month | ~500/month ($5 credits) |
| **Cold Starts** | Yes (15 min) | Yes (similar) |
| **Python Support** | Excellent | Excellent |
| **Setup** | Slightly more manual | Auto-detects |
| **Database** | PostgreSQL free tier | Needs paid plan |

**Both are great!** Try Render first, you have Railway as backup.

---

## 🚨 Common Pitfalls

1. **Don't forget PYTHON_VERSION** - Render needs it explicitly
2. **Update CORS after frontend deploy** - Backend won't accept requests otherwise
3. **Cold starts are normal** - First request takes 30s on free tier
4. **SQLite data is temporary** - Consider PostgreSQL for production

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **This Project Issues**: https://github.com/cheruvathoorshajd/AI-Financial-Market-Prediction-System/issues

---

**Your AI Financial Market Prediction System is now LIVE on Render! 🎉**

*750 hours/month FREE - Perfect for personal projects and portfolios!*
