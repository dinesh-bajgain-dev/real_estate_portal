# EstatePortal — Buyer Portal Assessment

A full-stack buyer portal for a real-estate broker. Built with **React + TypeScript**, **Node.js + Express**, and **PostgreSQL**.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios |
| Backend    | Node.js, Express, TypeScript, express-validator |
| Database   | PostgreSQL (raw `pg` queries — no ORM)          |
| Auth       | JWT (jsonwebtoken) + bcrypt password hashing    |

---

## Roles

| Role    | Capabilities |
|---------|---|
| `buyer` | Browse properties, save/remove favourites, view own saved list |
| `admin` | Full CRUD on properties, view all users, delete users, view dashboard stats |

Admin credentials (seeded automatically): **admin@estateportal.com / Admin@1234**

---

## Project Structure

```
buyer-portal/
├── backend/
│   └── src/
│       ├── controllers/     # Business logic (auth, properties, favourites)
│       ├── db/              # Connection pool + migration script
│       ├── middleware/       # JWT authentication middleware
│       ├── routes/          # Express route definitions with validation
│       ├── types/           # Shared TypeScript interfaces
│       └── index.ts         # Express app entry point
└── frontend/
    └── src/
        ├── api/             # Axios client + API call functions
        ├── components/      # Reusable UI (Navbar, PropertyCard, Toast, ProtectedRoute)
        ├── context/         # AuthContext — global auth state
        ├── hooks/           # useToast hook
        ├── pages/           # LoginPage, RegisterPage, DashboardPage, FavouritesPage
        └── types/           # Shared TypeScript types
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally
- npm or yarn

---

## Setup & Running

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# In /backend, copy the example file
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/buyer_portal
JWT_SECRET=a_long_random_secret_string_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE buyer_portal;"
```

### 4. Run migrations (creates tables + seeds 8 sample properties)

```bash
cd backend
npm run db:migrate
```

You should see:
```
🚀 Running migrations...
✅ Seed properties inserted
✅ Migrations complete
```

### 5. Start the backend

```bash
cd backend
npm run dev
# API running on http://localhost:4000
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
# UI running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Example User Flows

### Flow 1: Register → Browse → Save a Favourite

1. Visit `/register`
2. Fill in name, email, and a password (min 8 chars, 1 uppercase, 1 number)
3. You're automatically logged in and redirected to `/dashboard`
4. Click the **heart icon** on any property card to save it
5. Navigate to **My Favourites** in the navbar to see saved properties

### Flow 2: Login → View Favourites → Remove

1. Visit `/login`
2. Enter your credentials
3. On the dashboard, your previously saved properties show a filled heart
4. Go to **My Favourites** and click the heart again to remove a property

### Flow 3: Admin — Create / Edit / Delete a property

1. Visit `/login` and sign in with `admin@estateportal.com` / `Admin@1234`
2. You are redirected to `/admin` — the admin panel
3. Click **Properties** in the sidebar
4. Click **Add Property** → fill in the form → click **Create Property**
5. The new property appears at the top of the table and is immediately visible to buyers
6. Click **Edit** on any row → update fields → **Save Changes**
7. Click **Delete** on any row → confirm the dialog → property and all its favourites are removed

### Flow 4: Admin — View & delete users

1. Log in as admin, go to `/admin`
2. Click **Users** in the sidebar to see all registered buyers with favourite counts
3. Click **Delete** on a buyer row to remove their account (admin accounts are protected)


## Database Schema

```sql
users        (id, name, email, password[hashed], role, created_at, updated_at)
properties   (id, title, address, price, bedrooms, bathrooms, area_sqft, image_url, property_type, created_at)
favourites   (id, user_id→users, property_id→properties, created_at)  UNIQUE(user_id, property_id)
```
