<div align="center">

<img src="https://img.shields.io/badge/SkillBazaar-Freelance%20Marketplace-1dbf73?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==" alt="SkillBazaar" />

# SkillBazaar

### 🚀 A Full-Stack Freelance Marketplace Platform

*Buy and sell professional services with confidence — built for the modern web.*

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/ishan10x/SkillBazaar?style=flat-square&color=yellow)](https://github.com/ishan10x/SkillBazaar/stargazers)

<br/>

[**🌐 Live Demo**](#) · [**🐛 Report Bug**](https://github.com/ishan10x/SkillBazaar/issues) · [**✨ Request Feature**](https://github.com/ishan10x/SkillBazaar/issues)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**SkillBazaar** is a feature-rich, full-stack freelance marketplace inspired by platforms like Fiverr and Upwork. It enables sellers to list their skills as "gigs" and buyers to discover, order, and review those services — all within a polished, real-time platform.

Built from scratch with a **React** frontend, **Node.js/Express** backend, and **MySQL** database, SkillBazaar demonstrates a production-ready architecture with proper authentication, file uploads, wallet systems, real-time messaging, and more.

---

## ✨ Features

### 🛍️ Marketplace
| Feature | Description |
|---|---|
| **Gig Listings** | Sellers create detailed service listings with image uploads |
| **Image Upload** | Upload gig photos directly from your computer |
| **Search & Filter** | Search by keyword, category, price range |
| **Recent Searches** | Instantly revisit previous search queries |
| **🔥 Trending Gigs** | Discover most-ordered services in real-time |
| **Categories** | Browse services organized by skill category |
| **Favorites / Wishlist** | Save gigs to a personal wishlist |

### 👤 User System
| Feature | Description |
|---|---|
| **Auth** | Secure JWT-based login & registration |
| **Roles** | Separate Buyer and Seller roles |
| **Profile Management** | Edit avatar, bio, country, DOB, language |
| **Language Preference** | Select preferred language (Hindi, Tamil, etc.) |
| **Dark / Light Mode** | Persistent theme toggle with localStorage |
| **Settings Page** | Change password, manage account, danger zone |
| **Account Deletion** | Permanent account removal with confirmation modal |

### 📦 Orders & Payments
| Feature | Description |
|---|---|
| **Order Placement** | Buyers order gigs with custom requirements |
| **Order Tracking** | Visual timeline: Pending → In Progress → Delivered |
| **Status Updates** | Sellers update order status with timestamped steps |
| **⬇️ Download Receipt** | Print-to-PDF receipt for any completed order |
| **Wallet System** | Top up balance, view transaction history |
| **Platform Fee** | Automatic 10% fee deduction on completion |

### 💬 Communication
| Feature | Description |
|---|---|
| **Real-time Messaging** | Chat between buyer and seller on any order |
| **🔔 Notifications** | Bell icon with unread dot — order status alerts |
| **Custom Offers** | Sellers send tailored custom offer proposals |

### 📜 Legal & Trust
| Feature | Description |
|---|---|
| **Terms of Service** | Full 10-section terms page at `/terms` |
| **Privacy Policy** | Detailed privacy policy at `/privacy` |
| **Site Footer** | Persistent footer with all legal and nav links |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│   React 18  ·  React Router v6  ·  Axios  ·  CSS Vars  │
├─────────────────────────────────────────────────────────┤
│                       BACKEND                           │
│     Node.js  ·  Express.js  ·  Multer  ·  bcryptjs     │
├─────────────────────────────────────────────────────────┤
│                      DATABASE                           │
│          MySQL 8  ·  mysql2/promise driver              │
├─────────────────────────────────────────────────────────┤
│                   AUTHENTICATION                        │
│               JWT  ·  localStorage token               │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

The database contains **12 relational tables**:

```
users               ← accounts, roles, wallet balance, language
gigs                ← service listings with pricing
categories          ← gig categories (Programming, Design, etc.)
orders              ← placed orders with status tracking
payments            ← payment records per order
reviews             ← buyer ratings on completed orders
messages            ← real-time chat between users
favorites           ← user wishlists
wallet_transactions ← full wallet audit trail
custom_offers       ← seller-initiated custom proposals
portfolios          ← seller portfolio showcase items
notifications       ← real-time order status alerts
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) `v18+`
- [MySQL](https://dev.mysql.com/downloads/installer/) `v8+`
- [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/ishan10x/SkillBazaar.git
cd SkillBazaar
```

**2. Set up the database**
```sql
-- In MySQL Workbench or CLI:
CREATE DATABASE skillbazaar;
USE skillbazaar;
SOURCE database/skillbazaar.sql;
```

**3. Configure the backend environment**

Create a `.env` file inside the `backend/` folder:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=skillbazaar
JWT_SECRET=your_super_secret_key
PORT=5001
```

**4. Install dependencies and start the backend**
```bash
cd backend
npm install
npm run dev
```
> Backend runs at `http://localhost:5001`

**5. Install dependencies and start the frontend**

Open a new terminal:
```bash
cd frontend
npm install
npm start
```
> Frontend runs at `http://localhost:3000`

---

## 📁 Project Structure

```
SkillBazaar/
│
├── 📂 backend/
│   ├── 📂 config/
│   │   └── db.js                  # MySQL connection pool
│   ├── 📂 middleware/
│   │   └── auth.js                # JWT verifyToken, isSeller
│   ├── 📂 routes/
│   │   ├── auth.js                # Register, login, profile, password
│   │   ├── gigs.js                # CRUD + trending + image upload
│   │   ├── orders.js              # Order lifecycle + notifications
│   │   ├── notifications.js       # Fetch & mark read
│   │   ├── misc.js                # Reviews, messages, favorites, categories
│   │   ├── wallet.js              # Balance, top-up, transactions
│   │   ├── offers.js              # Custom offers
│   │   └── portfolios.js          # Seller portfolios
│   ├── 📂 uploads/                # Uploaded gig images (gitignored)
│   ├── .env                       # Secrets (gitignored)
│   └── server.js                  # Express app entry point
│
├── 📂 frontend/
│   └── 📂 src/
│       ├── 📂 components/
│       │   ├── Navbar.js          # Nav + notifications bell + theme toggle
│       │   └── GigCard.js         # Reusable gig card component
│       ├── 📂 context/
│       │   └── AuthContext.js     # Global user auth state
│       ├── 📂 pages/
│       │   ├── Home.js
│       │   ├── GigsPage.js        # Browse + trending + recent searches
│       │   ├── GigDetail.js
│       │   ├── CreateGig.js       # Image upload + form
│       │   ├── Dashboard.js
│       │   ├── OrdersPage.js
│       │   ├── OrderDetailPage.js # Timeline + receipt download
│       │   ├── MessagesPage.js
│       │   ├── ProfilePage.js     # Avatar, DOB, language, gig management
│       │   ├── SettingsPage.js    # Password, danger zone
│       │   ├── WalletPage.js
│       │   ├── CheckoutPage.js
│       │   ├── TermsPage.js
│       │   └── PrivacyPage.js
│       ├── api.js                 # All Axios API calls
│       └── styles.css             # Global styles + CSS variables + dark mode
│
├── 📂 database/
│   └── skillbazaar.sql            # Full schema + seed data
│
└── README.md
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login, get JWT token | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update profile + language | ✅ |
| `PUT` | `/api/auth/password` | Change password | ✅ |
| `DELETE` | `/api/auth/account` | Permanently delete account | ✅ |

### Gigs
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/gigs` | Get all gigs (filterable) | ❌ |
| `GET` | `/api/gigs/trending` | Get top 8 trending gigs | ❌ |
| `GET` | `/api/gigs/:id` | Get single gig + reviews | ❌ |
| `POST` | `/api/gigs` | Create gig (with image upload) | ✅ Seller |
| `PUT` | `/api/gigs/:id` | Update gig | ✅ Seller |
| `DELETE` | `/api/gigs/:id` | Hard delete gig | ✅ Seller |

### Orders
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/orders` | Place an order | ✅ |
| `GET` | `/api/orders` | Get all my orders | ✅ |
| `GET` | `/api/orders/:id` | Get order details | ✅ |
| `PUT` | `/api/orders/:id/status` | Update status + notify | ✅ |

### Notifications
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/notifications` | Get all notifications | ✅ |
| `PUT` | `/api/notifications/read` | Mark all as read | ✅ |

---

## 🔐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `secret123` |
| `DB_NAME` | Database name | `skillbazaar` |
| `JWT_SECRET` | Secret for signing JWTs | `any_long_random_string` |
| `PORT` | Backend port | `5001` |

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 🗺️ Roadmap

- [x] JWT Authentication & Role system
- [x] Gig CRUD with image upload
- [x] Order management & tracking
- [x] Real-time messaging
- [x] Wallet & payments
- [x] Notification system
- [x] Dark/Light mode
- [x] Terms & Privacy pages
- [x] Trending gigs & recent searches
- [x] Receipt download (PDF)
- [ ] Deploy to production (Railway + Vercel)
- [ ] Email notifications (Nodemailer)
- [ ] Admin dashboard
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please make sure your code follows the existing style and doesn't break existing functionality.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Ishan Khandelwal](https://github.com/ishan10x)**

⭐ **Star this repo if you found it helpful!** ⭐

</div>
