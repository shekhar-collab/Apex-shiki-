# APEX — MERN Conversion

Aapki teeno HTML files (landing page, admin dashboard, member panel) ab **MERN stack** (MongoDB + Express + React + Node.js) mein convert ho chuki hain — **design, layout, CSS, aur functionality bilkul same** rakha gaya hai. Sirf data ab hardcoded arrays ki jagah asli MongoDB database se aata hai, aur admin/member login bhi real (JWT-based) hai.

## 📁 Structure

```
apex-mern/
├── backend/            → Node.js + Express + MongoDB (Mongoose) + JWT auth
├── landing-page/        → React app (marketing site, contact form → DB)
├── admin-dashboard/      → React app (gym owner/admin panel, login required)
└── member-panel/         → React app (member's own panel, login required)
```

Teeno frontend alag-alag Vite React apps hain (jaisa aapne bola), aur ek hi backend teeno ko serve karta hai.

## 🎨 Design fidelity

Har page ka original `<style>` aur body markup **hoo-ba-hoo (verbatim) extract** karke React components mein daala gaya hai — koi bhi CSS, spacing, color, font, ya layout change nahi kiya gaya. Sirf jo hardcoded JS arrays the (members, trainers, transactions, notifications, macros, meals, exercises, bookings, payments, rewards, achievements, weight history) — unko backend API calls se replace kiya gaya hai, taaki data asli database se aaye.

## 🚀 Setup

### 1. MongoDB
Local MongoDB chalayein ya [MongoDB Atlas](https://www.mongodb.com/atlas) ka free cluster bana lein.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# .env mein apna MONGO_URI aur JWT_SECRET set karein
npm run seed     # database mein demo data daal dega (members, trainers, kpis, etc.)
npm run dev      # http://localhost:5000 par server chalu ho jayega
```

**Demo login credentials (seed ke baad):**
- Admin: `admin@apex.com` / `Admin@123`
- Member: `ishaan.v@mail.com` / `Member@123` (full dashboard data isi member ke saath hai — streak, macros, bookings, sab kuch)
- Baaki 7 members bhi same password `Member@123` se login ho sakte hain (unki emails `backend/seed/admin-data.json` mein hain)

### 3. Landing Page

```bash
cd landing-page
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```

### 4. Admin Dashboard

```bash
cd admin-dashboard
npm install
cp .env.example .env
npm run dev      # http://localhost:5174
```

### 5. Member Panel

```bash
cd member-panel
npm install
cp .env.example .env
npm run dev      # http://localhost:5175
```

## 🔑 Kaise kaam karta hai

- **Landing page**: bilkul static design same hai; sirf "Send Message" form ab real backend `/api/contact` par POST karta hai jo MongoDB mein save hota hai. FAQ accordion bhi original jaisa hi kaam karta hai.
- **Admin dashboard**: pehle login screen aayega (naya add kiya gaya hai kyunki original design mein login nahi tha, lekin real MERN ke liye zaroori hai). Login ke baad wahi original dashboard dikhega, bas members/trainers/transactions/notifications/streaks/rewards/KPIs sab MongoDB se live fetch honge.
- **Member panel**: same tarah, login/register ke baad member apna khud ka data dekhta hai (macros, meals, exercises, bookings, payments, rewards, achievements) — sab uske MongoDB document se aata hai.

## 🛠️ Tech stack

- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT (jsonwebtoken), bcryptjs
- **Frontend**: React 18 + Vite (3 alag apps)
- **Auth**: Role-based JWT (`admin` / `member`), tokens localStorage mein store hote hain

## 📌 Notes

- Har backend route `/api/admin/*` sirf admin JWT ke saath accessible hai; `/api/member/*` sirf member JWT ke saath.
- `backend/seed/seed.js` dubara chalane se database reset ho jayega (fresh demo data).
- Production mein `JWT_SECRET` zaroor change karein aur `CLIENT_ORIGINS` mein apne deployed frontend URLs daalein.
