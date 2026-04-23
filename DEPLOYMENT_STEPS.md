# ScentedMemories — Deployment Steps

Complete guide for deploying the full stack from scratch.
Reference this file any time you need to redeploy or set up a new environment.

---

## Stack

| Layer | Service | URL |
|---|---|---|
| Database | Neon PostgreSQL | `ep-cold-frost-a1rsrjdw-pooler.ap-southeast-1.aws.neon.tech` |
| Backend | Render (Docker / Java 21) | `https://scented-memories-backend.onrender.com` |
| Frontend | Vercel (Next.js 14) | `https://scented-memories.vercel.app` |

---

## Deployment order

**Always deploy in this sequence:**

```
1. Database (Neon)  →  2. Backend (Render)  →  3. Frontend (Vercel)  →  4. Wire CORS
```

Each layer depends on the one before it. Never deploy the frontend before the backend URL is known.

---

## Step 1 — Database (Neon PostgreSQL)

Neon is a serverless PostgreSQL provider. The schema and seed data are managed by Flyway migrations that run automatically when the backend starts — no manual SQL needed.

### 1.1 Get the connection string

1. Go to [neon.tech](https://neon.tech) and sign in
2. Open your project → **Dashboard**
3. Click **Connection Details** (top right)
4. Switch connection type to **Pooled connection**
5. Copy the connection string — it looks like:
   ```
   postgresql://neondb_owner:<password>@ep-cold-frost-a1rsrjdw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### 1.2 Split into three Render environment variables

The PostgreSQL JDBC driver does not support credentials embedded in the URL. Use three separate variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `jdbc:postgresql://ep-cold-frost-a1rsrjdw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `DB_USERNAME` | `neondb_owner` |
| `DB_PASSWORD` | `<your-neon-password>` |

> **Important:** Always use the **pooler** endpoint (`ep-xxx-pooler.region...`), not the direct endpoint.
> Include `?sslmode=require` — Neon rejects unencrypted connections.
> Do NOT include `channel_binding=require` — the JDBC driver does not support this parameter.

### 1.3 What Flyway does on first backend startup

When the backend starts for the first time against a fresh Neon database, Flyway automatically runs:

| Migration | Contents |
|---|---|
| `V1__create_schema.sql` | All 9 tables, constraints, indexes |
| `V2__seed_reference_data.sql` | 6 categories, 25 tags |
| `V3__seed_products.sql` | 10 products with variants, images, tags, and the admin user |
| `V4__update_product_images.sql` | Update image URLs to local `/public/` paths |
| `V5__update_admin_password.sql` | Set admin password |

No manual intervention required.

---

## Step 2 — Backend (Render)

### 2.1 Create the web service via Blueprint

1. Go to [render.com](https://render.com) and sign in
2. Click **New** → **Blueprint**
3. Connect your GitHub account (first time only)
4. Select the `scented_memories` repository
5. Render reads `render.yaml` at the repo root — it uses `runtime: docker`
6. Click **Apply**

> **Note:** Render Blueprint does not support `runtime: java`. The service uses Docker (`backend/Dockerfile`) which builds with Eclipse Temurin JDK 21.

### 2.2 Set environment variables

In the Render dashboard → your service → **Environment** tab → add:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `jdbc:postgresql://ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` | No credentials in URL |
| `DB_USERNAME` | `neondb_owner` | From Neon dashboard |
| `DB_PASSWORD` | `<your-neon-password>` | From Neon dashboard |
| `JWT_SECRET` | Output of `openssl rand -base64 48` | Minimum 32 characters |
| `FRONTEND_URL` | *(leave blank for now)* | Set in Step 4 after Vercel deploys |

> **Generating JWT_SECRET:**
> ```bash
> openssl rand -base64 48
> ```

> **PORT** is injected automatically by Render. Do not set it manually.

### 2.3 Deploy

Click **Save Changes** — Render deploys automatically.

Watch the **Logs** tab. A successful startup looks like:

```
Flyway: Successfully applied 5 migrations to schema "public"
HikariPool-1 - Start completed
Tomcat started on port(s): 10000
Started ScentedMemoriesApplication in 18.4 seconds
```

First deploy takes **4–6 minutes** (Docker build pulls base images + Maven build).
Subsequent deploys are faster (~2–3 min) because Docker layers are cached.

### 2.4 Verify the backend is live

```bash
curl https://scented-memories-backend.onrender.com/health
# Expected: UP

curl https://scented-memories-backend.onrender.com/api/categories
# Expected: JSON array of 6 categories
```

Copy your Render service URL — you need it for Step 3.

---

## Step 3 — Frontend (Vercel)

### 3.1 Create the project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:

| Field | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Next.js (auto-detected) |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Node.js Version | 20.x |

### 3.2 Set environment variables

**Before clicking Deploy**, go to **Environment Variables** and add:

| Key | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://scented-memories-backend.onrender.com` | Production, Preview, Development |

> **Critical:** This variable must be set **before** the first build.
> Next.js inlines `NEXT_PUBLIC_*` variables at build time — they are not read at runtime.
> If it is missing, the build fails with a clear error message.

### 3.3 Deploy

Click **Deploy**. The build takes **1–2 minutes**.

Once complete, Vercel provides a URL:
```
https://scented-memories.vercel.app
```

Copy this URL — you need it for Step 4.

---

## Step 4 — Wire CORS (Backend ↔ Frontend)

Now that both services are live, lock down CORS to your Vercel domain.

1. Go to Render → your backend service → **Environment** tab
2. Set `FRONTEND_URL` to your exact Vercel URL:
   ```
   https://scented-memories.vercel.app
   ```
   - No trailing slash
   - Exact match including `https://`
3. Click **Save Changes** — Render redeploys automatically (~2 minutes)

> Until this step is done, the backend accepts requests from any origin (`*`).
> Tighten this before going live.

**To allow multiple origins** (e.g. stable URL + Vercel preview deployments):
```
https://scented-memories.vercel.app,https://scented-memories-git-main-user.vercel.app
```

---

## Accessing the Application

Once all four steps are complete:

### Public storefront
```
https://scented-memories.vercel.app
```

### Admin panel
```
https://scented-memories.vercel.app/admin/login

Email:    admin@scentedmemories.in
Password: sushant123
```

### Backend API (direct access)
```
https://scented-memories-backend.onrender.com/health
https://scented-memories-backend.onrender.com/test
https://scented-memories-backend.onrender.com/api/products
https://scented-memories-backend.onrender.com/swagger-ui/index.html
```

---

## Environment Variables — Complete Reference

### Render (backend)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon JDBC URL — pooler endpoint, `?sslmode=require`, no credentials |
| `DB_USERNAME` | Yes | Neon database username |
| `DB_PASSWORD` | Yes | Neon database password |
| `JWT_SECRET` | Yes | Random string ≥ 32 chars. Generate: `openssl rand -base64 48` |
| `FRONTEND_URL` | Yes (after Step 3) | Exact Vercel URL. Comma-separate for multiple origins. |
| `PORT` | Auto | Injected by Render. Do not set manually. |

### Vercel (frontend)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Render backend URL. Must be set before build. |

---

## Local Development

### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Uses `application-dev.properties` (gitignored). This file must contain:
```properties
spring.datasource.url=jdbc:postgresql://ep-cold-frost-a1rsrjdw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=<your-password>
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
app.jwt.secret=dev-secret-change-in-production-must-be-at-least-32-chars
app.cors.allowed-origins=http://localhost:3000
```

### Frontend

```bash
cd frontend
npm run dev
```

Reads `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Redeployment

### Redeploy backend only
Push to the branch connected to Render, or go to Render → your service → **Manual Deploy** → **Deploy latest commit**.

### Redeploy frontend only
Push to the branch connected to Vercel, or go to Vercel → your project → **Deployments** → **Redeploy**.

### After changing environment variables
- **Render:** Saves trigger an automatic redeploy.
- **Vercel:** Go to **Deployments** → click the latest deployment → **Redeploy** (`NEXT_PUBLIC_*` vars are baked in at build time).

---

## Adding Product Images

Product images are served from `frontend/public/`. To add a new image:

1. Drop the file into `frontend/public/` with a URL-safe filename (e.g. `rose-aroma-oil.jpeg`)
2. Commit and push — Vercel deploys it automatically
3. In the admin panel → Edit Product → set the image URL to `/rose-aroma-oil.jpeg`
4. Click **Save & Publish**

---

## Cold Start Behaviour (Render Free Tier)

Render free tier suspends services after **15 minutes of inactivity**. The first request after suspension triggers a cold start that takes **30–50 seconds**.

The frontend handles this automatically — it retries API calls for up to 35 seconds before surfacing an error.

**To warm up the backend before a demo:**
```bash
curl https://scented-memories-backend.onrender.com/health
```

Run this ~1 minute before your demo. The service stays warm for 15 minutes after any request.

---

## Post-Launch Security Checklist

- [ ] Confirm `FRONTEND_URL` on Render is set to the exact Vercel URL (not `*`)
- [ ] Confirm `JWT_SECRET` is at least 32 random characters
- [ ] Confirm `spring.jpa.show-sql=false` in `application.properties` (already set)
- [ ] Change admin password if still using the default

---

## Related Files

| File | Purpose |
|---|---|
| `render.yaml` | Render Blueprint config (`runtime: docker`) |
| `backend/Dockerfile` | Multi-stage Docker build (JDK 21 build → JRE 21 runtime) |
| `frontend/next.config.mjs` | Vercel build config and env var validation |
| `backend/src/main/resources/application.properties` | Production Spring Boot config |
| `backend/src/main/resources/db/migration/` | Flyway migrations V1–V5 |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step validation after each deployment |
