# 🍽️ Restaurant Management System

A full-stack Restaurant Management System (RMS) that digitizes day-to-day restaurant operations for **Admins**, **Staff** (Waiter / Kitchen / Cleaner), and **Customers** — all in real time.

Built on **Lovable** with React, TypeScript, Tailwind CSS, shadcn/ui, and **Lovable Cloud** (Supabase) for the backend.

---

## ✨ Features

### 👑 Admin / Manager
- Real-time dashboard (orders, tables, reservations, revenue)
- Interactive **floor plan** with drag-and-drop tables
- **Menu management** — categories, items, pricing, dietary tags
- **Orders & Reservations** — create, view, and manage
- **Kitchen Display System (KDS)** view
- **Staff management**
- **Billing & Payments** — cash, card, UPI, split bills

### 🧑‍🍳 Staff (role-specialized dashboards)
- **Waiter** — assign tables, take orders, deliver food
- **Kitchen** — ticket queue, mark orders ready
- **Cleaner** — cleaning queue, mark tables clean

### 🙋 Customer
- Browse menu
- Place orders
- Make / view reservations
- Leave reviews

### 🔒 Security
- Role-based access control via a separate `user_roles` table
- Postgres **Row-Level Security (RLS)** on every table
- `has_role()` SECURITY DEFINER function to prevent recursive RLS issues
- Server-side role validation only — never trusts the client

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS v3 (HSL semantic tokens) |
| UI Kit | shadcn/ui + Radix UI |
| Routing | react-router-dom |
| Data Layer | @tanstack/react-query |
| Backend | Lovable Cloud (Postgres, Auth, Realtime, Edge Functions) |
| Icons | lucide-react |
| Notifications | sonner |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # AuthGuard route protection
│   ├── menu/              # Menu cards & dialogs
│   ├── orders/            # Order creation dialog
│   ├── reservations/      # Reservation dialog
│   ├── tables/            # Floor plan, table cards, add dialog
│   └── ui/                # shadcn/ui primitives
├── pages/
│   ├── admin/             # Admin pages (tables, menu, orders, kitchen, billing, staff…)
│   ├── staff/             # Staff pages (tables, take order, kitchen, cleaning)
│   ├── customer/          # Customer pages (menu, orders, reservations, reviews)
│   ├── Auth.tsx           # Login / Signup
│   ├── Index.tsx          # Role-based redirector
│   └── *Dashboard.tsx     # One dashboard per role
├── integrations/supabase/ # Auto-generated client + types
├── hooks/                 # Custom hooks
└── lib/                   # Utilities
```

---

## 🗄 Database Schema (Lovable Cloud)

| Table | Purpose |
|---|---|
| `profiles` | User profile data (name, phone, avatar) |
| `user_roles` | Role assignment (admin / staff / customer) |
| `staff_details` | Staff sub-role (waiter / kitchen / cleaner / cashier / manager) + shift info |
| `restaurant_tables` | Tables with capacity, position, status |
| `menu_categories` | Menu sections |
| `menu_items` | Dishes with price, dietary flags, prep time |
| `orders` + `order_items` | Order lifecycle (pending → preparing → ready → served) |
| `reservations` | Customer bookings |

All tables are protected by RLS policies. Order numbers are auto-generated via `generate_order_number()`.

---

## 🚀 Getting Started

### Use Lovable (recommended)
Visit the [Lovable project](https://lovable.dev/projects/7feeea20-4a6e-40b9-88c8-08d867e46071) and start prompting. Changes auto-sync to GitHub.

### Run locally
Requires Node.js 18+ and npm.

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

The app runs on `http://localhost:8080` (or the port Vite chooses).

> **Note:** Lovable Cloud env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are auto-injected. Don't edit `.env` manually.

---

## 👥 Test Accounts

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@rm.com` | Full access |
| Waiter | `staff@rm.com` | Tables + orders |
| Kitchen | `kitchen@rm.com` | KDS only *(create via signup, then assign role)* |
| Cleaner | `cleaner@rm.com` | Cleaning queue *(create via signup, then assign role)* |
| Customer | sign up via `/auth` | Self-service |

---

## 🚢 Deployment

Open the [Lovable project](https://lovable.dev/projects/7feeea20-4a6e-40b9-88c8-08d867e46071) → click **Share → Publish**.

To connect a custom domain: **Project → Settings → Domains → Connect Domain**.
Docs: <https://docs.lovable.dev/features/custom-domain>

---

## 🔮 Roadmap / Suggested Upgrades

- 📦 **Inventory & recipe-level deduction** (auto-stock tracking)
- 🎁 **Loyalty / CRM** with tier tracking and automated messaging
- 🛵 **Delivery & takeout** with real-time tracking
- 📊 **Advanced analytics** (sales, staff performance, top dishes)
- 🤖 **AI assistant** for menu suggestions / demand forecasting (via Lovable AI Gateway)
- 💳 **Stripe / Razorpay** payment integration
- 📱 **PWA / mobile app** wrapper
- 🔔 **Push notifications** for order status
- 🌐 **Multi-language** (i18n) support
- 🧾 **Printable / emailed receipts**

---

## 📄 License

Built with ❤️ on [Lovable](https://lovable.dev).
