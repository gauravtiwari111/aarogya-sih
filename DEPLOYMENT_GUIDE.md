# AAROGYA Deployment & Environment Setup Guide

## 1. Cloud Database (MongoDB Atlas Setup)
Jab aapko MongoDB Atlas ka connection string (URI) mile:
1. `backend/.env` file open karein.
2. `MONGODB_URI` field me apna Atlas URL paste karein:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/aarogya?retryWrites=true&w=majority
```
3. Custom JWT Secret Key enter karein:
```env
JWT_SECRET=your_custom_jwt_secret_key_here
```

---

## 2. Backend Live Deployment (Render / Railway / Cyclic)
1. GitHub pe code push karein.
2. Render.com par **Web Service** create karein.
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variables add karein: `MONGODB_URI`, `JWT_SECRET`, `AI_API_KEY`, `CLIENT_URL`.

---

## 3. Frontend Live Deployment (Vercel / Netlify)
1. Vercel.com par Github repo connect karein.
2. Root Directory: `./` (ya `/`)
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Environment Variable (Optional):
```env
VITE_API_URL=https://your-backend-render-url.onrender.com/api
```
6. Deploy button dabaen! `vercel.json` file pehle se configured hai route fallback ke liye.
