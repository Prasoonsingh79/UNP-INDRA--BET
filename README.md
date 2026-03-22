# OpenBet AI - User-Created Prediction Platform

Welcome to **OpenBet AI**, a premium full-stack Web Application built exactly to your specifications!

## 🚀 Features Implemented
- **Premium Custom UI:** A stunning, vibrant dark theme with glassmorphism, dynamic animations, and `inter` typography (No generic CSS Frameworks used).
- **Backend Architecture:** Node.js, Express, Socket.IO, PostgreSQL (Prisma ORM).
- **Authentication:** JWT & Bcryptjs based User Auth with Wallet Initial Balance.
- **Live Real-Time Sync:** Socket.IO integrated to display live pool amounts, odds, and new pools.
- **AI Generator:** Gemini API implementation for "Generate trending prediction topics".
- **Result Engine:** Secure process where creators can resolve bets, automatically transferring coins proportionally to the pool size directly into the winner's wallets.

## 🛠 Prerequisites
1. **Node.js**: Make sure Node.js is installed.
2. **PostgreSQL**: A local PostgreSQL server must be running on your system.
3. **Gemini API Key:** You need an API key from Google AI Studio.

## 🏁 How to Run

### 1. Database Setup
Ensure PostgreSQL is running on `localhost:5432` with your credentials. By default, the `DATABASE_URL` is set to:
```env
postgresql://postgres:postgres@localhost:5432/openbet?schema=public
```
*If your database credentials differ, update the `DATABASE_URL` inside `backend/.env`*.

### 2. Configure Environment Variables
Inside `backend/.env`, set your real **Gemini API Key**:
```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY_HERE"
```

### 3. Start the Backend
Open a terminal in the `backend` folder and run:
```bash
cd backend
npx prisma db push
npm run dev
```

### 4. Start the Frontend
Open another terminal in the `frontend` folder and run:
```bash
cd frontend
npm run dev
```

### 5. Open Web App
Visit `http://localhost:5173` in your browser. Create a new account and begin predicting!
