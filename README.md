# SkillBazaar

A full-stack freelance marketplace built with **React**, **Node.js/Express**, and **MySQL**.

## 🚀 Features

- 🔐 JWT-based Authentication (Buyer & Seller roles)
- 🛍️ Gig Marketplace with image upload
- 📦 Order management with real-time status tracking
- 💬 Real-time messaging system
- 🔔 Notification system
- 💰 Wallet & payment system
- ⭐ Reviews & ratings
- 🌗 Light / Dark mode
- 🌍 Multi-language profile support
- 📄 Receipt download (PDF via print)
- 🔥 Trending gigs & recent searches
- 📜 Terms & Privacy pages

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer |

## 📦 Local Setup

### Prerequisites
- Node.js v18+
- MySQL v8+

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/skillbazaar.git
cd skillbazaar
```

### 2. Set up the Database
- Create a MySQL database called `skillbazaar`
- Run `database/skillbazaar.sql` to create all tables and seed data

### 3. Configure Backend Environment
Create a `.env` file inside the `backend/` folder:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=skillbazaar
JWT_SECRET=your_secret_key_here
PORT=5001
```

### 4. Install & Run Backend
```bash
cd backend
npm install
npm run dev
```

### 5. Install & Run Frontend
```bash
cd frontend
npm install
npm start
```

The app will be running at **http://localhost:3000**

## 📁 Project Structure

```
skillbazaar/
├── backend/
│   ├── config/         # Database connection
│   ├── middleware/      # JWT auth middleware
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded gig images (gitignored)
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # Navbar, GigCard, etc.
│       ├── context/     # AuthContext
│       ├── pages/       # All page components
│       ├── api.js       # Axios API calls
│       └── styles.css   # Global styles
└── database/
    └── skillbazaar.sql  # Full DB schema
```

## ⚠️ Notes

- The `backend/.env` file is **gitignored** — you must create it manually on each machine
- Uploaded images are stored in `backend/uploads/` which is also gitignored
