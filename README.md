# ScentedMemories

A full-stack e-commerce application for a home fragrance and wellness business. Customers can browse, filter, and purchase products. The business owner manages the catalog, inventory, and orders through a dedicated admin panel.

---

## Live Application

| | URL |
|---|---|
| **Storefront** | https://scented-memories.vercel.app |
| **Admin Panel** | https://scented-memories.vercel.app/admin/login |
| **Backend API** | https://scented-memories-backend.onrender.com |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand |
| Backend | Spring Boot 3.2, Java 21 |
| Database | PostgreSQL on Neon (serverless) |
| Frontend hosting | Vercel |
| Backend hosting | Render (Docker, free tier) |

---

## Repository Structure

```
/
├── backend/                  Spring Boot API
│   ├── src/main/java/        Java source
│   ├── src/main/resources/
│   │   ├── application.properties        Production config
│   │   ├── application-dev.properties    Local dev config (gitignored)
│   │   └── db/migration/                 Flyway migrations (V1–V5)
│   └── Dockerfile
├── frontend/                 Next.js application
│   ├── src/
│   │   ├── app/              Pages (App Router)
│   │   │   ├── admin/        Admin panel pages
│   │   │   ├── products/     Product listing + detail
│   │   │   ├── cart/         Cart page
│   │   │   ├── checkout/     Checkout page
│   │   │   └── auth/         Login + register
│   │   ├── components/       Shared UI components
│   │   │   └── admin/        Admin-specific components
│   │   ├── lib/api/          API client modules
│   │   ├── store/            Zustand stores (cart, auth)
│   │   └── types/            TypeScript types
│   └── public/               Static assets (product images, logo)
├── render.yaml               Render deployment config
├── DEPLOYMENT_STEPS.md       Step-by-step deployment guide
└── DEPLOYMENT_CHECKLIST.md   Post-deployment validation checklist
```

---

## Features

### Customer-facing storefront
- Product listing with SSR, pagination, and URL-based filters
- Filter by category, scent/mood/use-case tags, and price range
- Full-text search by product name and description
- Product detail pages with variant selection, images, and tags
- In-memory cart (Zustand) — add, remove, update quantity
- Guest and authenticated checkout
- Order confirmation page

### Admin panel (`/admin`)
- Protected by JWT — ADMIN role required
- **Dashboard** — total products, total orders, pending count, recent orders feed with Refresh button
- **Products** — list all products with name-only search, add/edit/deactivate
  - Product form: name, description, category, image URLs (with live preview), variants (label/price/stock), tags
  - Save & Publish — changes go live immediately
- **Orders** — full order list with status filters, expandable order detail, inline status transitions

---

## Local Development

### Prerequisites
- Java 21
- Node.js 20
- Maven (or use the included `mvnw` wrapper)

### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Runs on `http://localhost:8080`. Uses `application-dev.properties` which connects to the Neon database directly.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`. Reads `NEXT_PUBLIC_API_URL` from `.env.local` (defaults to `http://localhost:8080`).

---

## Database Migrations

Flyway manages all schema changes. Migrations run automatically on backend startup.

| Migration | Contents |
|---|---|
| `V1__create_schema.sql` | All 9 tables, constraints, indexes |
| `V2__seed_reference_data.sql` | 6 categories, 25 tags |
| `V3__seed_products.sql` | 10 products, variants, images, admin user |
| `V4__update_product_images.sql` | Update image URLs to local `/public/` paths |
| `V5__update_admin_password.sql` | Admin password update |

---

## Admin Credentials

| Field | Value |
|---|---|
| Email | `admin@scentedmemories.in` |
| Password | `sushant123` |

---

## Deployment

See [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md) for the complete deployment guide.  
See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for post-deployment validation.
