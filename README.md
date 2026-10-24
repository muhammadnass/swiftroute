# SwiftRoute — Logistics Platform

> **Swift Hub Innovative Enterprise** | Nigeria-wide logistics SaaS

SwiftRoute is a full-stack logistics management platform that lets logistics companies manage their riders and orders while earning revenue through the platform.

---

## ✨ Features

### Admin
- Full platform dashboard with revenue analytics
- Company approval & management (all 37 Nigerian states)
- Rider oversight across the platform
- Live nationwide map of all active riders/deliveries
- Platform fee & commission configuration

### Logistics Company
- Order management (create, track, assign riders)
- Rider management with approval workflow
- Real-time live map of your fleet
- Earnings & wallet dashboard
- Company profile management

### Rider (Mobile-first, Bolt-style UI)
- Online/offline toggle
- Active order cards with one-tap navigation (Google Maps)
- Earnings wallet & transaction history
- Rider profile with stats & ratings

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Real-time | Socket.io |
| Auth | JWT (access + refresh tokens) |
| Maps | Google Maps API |
| Image Upload | Cloudinary |
| Animation | Framer Motion |
| Charts | Recharts |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Setup

```bash
git clone <repo-url>
cd swiftroute
chmod +x setup.sh
./setup.sh
```

Or manually:

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Add your Google Maps API key
npm install
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://USER:PASS@localhost:5432/swiftroute"
JWT_SECRET="your-very-long-secret-key"
JWT_REFRESH_SECRET="your-very-long-refresh-secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Optional: Google Maps
GOOGLE_MAPS_API_KEY="AIza..."

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Business Config (can adjust)
PLATFORM_FEE_PERCENTAGE=10
RIDER_COMMISSION_PERCENTAGE=70
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="AIza..."
```

---

## 🗂️ Project Structure

```
swiftroute/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # All DB models
│   │   └── seed.js            # 37 Nigerian states + demo accounts
│   └── src/
│       ├── controllers/       # Business logic
│       ├── middleware/        # Auth & rate limiting
│       ├── routes/            # Express routers
│       ├── utils/             # JWT, helpers
│       └── server.js          # Entry point + Socket.io
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx       # Landing page
        │   ├── (auth)/        # Login & Register
        │   ├── admin/         # Admin dashboard
        │   ├── company/       # Company dashboard
        │   ├── rider/         # Rider app (mobile-first)
        │   └── track/         # Public tracking page
        ├── components/
        │   └── shared/        # Sidebar, OrderCard, MapView...
        ├── lib/
        │   ├── api.ts         # Axios + auto token refresh
        │   └── utils.ts       # Helpers
        └── store/
            └── authStore.ts   # Zustand + persist
```

---

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@swiftroute.ng | Admin@12345 |
| Company | lagos@swiftdemo.ng | Company@12345 |

---

## 💰 Revenue Model

- **Platform fee**: 10% of each delivery fee (configurable in admin settings)
- **Rider commission**: 70% of each delivery fee
- **Company keeps**: Delivery fee minus platform fee (≈ 90% of the fee they charge customers)

Example on a ₦2,000 delivery:
- Platform earns: ₦200
- Rider earns: ₦1,400
- Company nets: ₦1,800 (90%)

---

## 🗺️ Nigerian States

All 37 Nigerian states (36 + FCT) are pre-seeded. Each company registers under a specific state, enabling state-based filtering and isolation.

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register company or rider |
| POST | `/api/auth/login` | — | Login (returns tokens) |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/auth/profile` | ✓ | Get current user |
| GET | `/api/orders/track/:code` | — | Public order tracking |
| POST | `/api/orders` | Company | Create new order |
| PUT | `/api/orders/:id/assign` | Company | Assign rider |
| PUT | `/api/orders/:id/status` | Rider | Update order status |
| GET | `/api/companies/riders` | Company | Get company riders |
| GET | `/api/admin/companies` | Admin | All companies |
| GET | `/api/admin/revenue` | Admin | Platform revenue |

---

## 🔌 Real-time Events (Socket.io)

| Event | Direction | Payload |
|-------|-----------|---------|
| `join` | Client→Server | `{ userId }` |
| `rider:location` | Client→Server | `{ lat, lng }` |
| `order:status` | Server→Client | `{ orderId, status }` |
| `order:assigned` | Server→Client | `{ orderId, rider }` |

---

## 🎨 Design System

- **Primary color**: `#f97316` (brand orange)
- **Background**: `#0a0a0f` (near black)
- **Glass morphism**: `backdrop-blur + bg-white/5`
- **Fonts**: Inter (body), Sora (display/headings)
- **Radius**: `rounded-2xl` (16px) for cards, `rounded-3xl` (24px) for hero elements

---

## 📱 Connect to Chat (For Future Updates)

After running the project:
1. Open **Claude desktop app**
2. Start a new chat
3. Click the 📎 folder icon and select the `swiftroute/` folder
4. All future changes can be made through Claude automatically

---

*Built with ❤️ by Swift Hub Innovative Enterprise*
