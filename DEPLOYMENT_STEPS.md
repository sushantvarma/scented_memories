# ScentedMemories — Deployment Steps

Complete guide for deploying the full stack from scratch.
Reference this file any time you need to redeploy or set up a new environment.

---

## Stack

| Layer | Service | URL pattern |
|---|---|---|
| Database | Neon PostgreSQL | `ep-xxx-pooler.region.aws.neon.tech` |
| Backend | Render (free tier) | `https://scented-memories-backend.onrender.com` |
| Frontend | Vercel | `https://scented-memories.vercel.app` |

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
5. Copy the connection string:
   ```
   postgresql://neondb_owner:<password>@ep-cold-frost-a1rsrjdw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

### 1.2 Convert to JDBC format

Replace `postgresql://` with `jdbc:postgresql://`:

```
jdbc:postgresql://ep-cold-frost-a1rsrjdw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

> **Important:** Always use the **pooler** endpoint (`ep-xxx-pooler.region...`), not the direct endpoint.
> The pooler routes through PgBouncer and keeps connections within Neon's free-tier limit.
> Always include `?sslmode=require&channel_binding=require` — Neon rejects unencrypted connections.

Save this JDBC URL — you will paste it into Render in Step 2.

### 1.3 What Flyway does on first backend startup

When the backend starts for the first time against a fresh Neon database, Flyway automatically runs:

| Migration | Contents |
|---|---|
| `V1__create_schema.sql` | All 9 tables, constraints, indexes |
| `V2__seed_reference_data.sql` | 6 categories, 25 tags |
| `V3__seed_products.sql` | 10 products with variants, images, tags, and the admin user |

No manual intervention required.

---

## Step 2 — Backend (Render)

### 2.1 Create the web service

1. Go to [render.com](https://render.com) and sign in
2. Click **New** → **Web Service**
3. Connect your GitHub account (first time only)
4. Select the `scented-memories` repository
5. Render detects `render.yaml` at the repo root — click **Apply** to use it

**If Render does not detect `render.yaml`**, configure manually:

| Field | Value |
|---|---|
| Name | `scented-memories-backend` |
| Region | Singapore |
| Root Directory | `backend` |
| Runtime | Java |
| Build Command | `./mvnw clean package -DskipTests -q` |
| Start Command | `java -Xmx256m -XX:+UseContainerSupport -Dspring.profiles.active=prod -Djava.security.egd=file:/dev/./urandom -jar target/scented-memories-backend-0.0.1-SNAPSHOT.jar` |
| Plan | Free |
| Health Check Path | `/health` |

### 2.2 Set environment variables

In the Render dashboard → your service → **Environment** tab → add:

| Key | Value | Notes |
|---|---|---|
| `DATABASE_URL` | JDBC URL from Step 1.2 | Required. Includes credentials and SSL params. |
| `JWT_SECRET` | Output of `openssl rand -base64 48` | Required. Minimum 32 characters, random. |
| `FRONTEND_URL` | *(leave blank for now)* | Set in Step 4 after Vercel deploys. |

> **Generating JWT_SECRET:** Run this in your terminal and paste the output:
> ```bash
> openssl rand -base64 48
> ```

> **PORT** is injected automatically by Render. Do not set it manually.

### 2.3 Deploy

Click **Save Changes** then **Deploy** (or it starts automatically after setup).

Watch the **Logs** tab. A successful startup looks like:

```
Flyway: Successfully applied 3 migrations to schema "public"
HikariPool-1 - Start completed
Tomcat started on port(s): 10000
Started ScentedMemoriesApplication in 18.4 seconds
```

First deploy takes **3–5 minutes** (Maven build + JVM startup).

### 2.4 Verify the backend is live

```bash
# Replace with your actual Render URL
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
> If it is missing, the build fails immediately with a clear error message.

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
> This is intentional for the initial deployment window but must be tightened before going live.

**To allow multiple origins** (e.g. stable URL + preview deployments), use a comma-separated list:
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
Password: Admin@123
```

> **Change this password immediately after first login.**
> The seed credentials are in the public repository (`V3__seed_products.sql`).

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
| `DATABASE_URL` | Yes | Neon JDBC URL with pooler endpoint and SSL params |
| `JWT_SECRET` | Yes | Random string ≥ 32 chars. Generate: `openssl rand -base64 48` |
| `FRONTEND_URL` | Yes (after Step 3) | Exact Vercel URL. Comma-separate for multiple origins. |
| `PORT` | Auto | Injected by Render. Do not set manually. |

### Vercel (frontend)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Render backend URL. Must be set before build. |

---

## Redeployment

### Redeploy backend only
Push to the branch connected to Render, or go to Render → your service → **Manual Deploy** → **Deploy latest commit**.

### Redeploy frontend only
Push to the branch connected to Vercel, or go to Vercel → your project → **Deployments** → **Redeploy**.

### After changing environment variables
- **Render:** Saves trigger an automatic redeploy.
- **Vercel:** Go to **Deployments** → click the latest deployment → **Redeploy** (env vars are baked in at build time for `NEXT_PUBLIC_*`).

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

After confirming everything works:

- [ ] Change the admin password from `Admin@123` to something strong
- [ ] Confirm `FRONTEND_URL` on Render is set to the exact Vercel URL (not `*`)
- [ ] Confirm `JWT_SECRET` is at least 32 random characters and not guessable
- [ ] Confirm `spring.jpa.show-sql=false` in `application.properties` (already set)
- [ ] Decide whether to keep Swagger UI public (`/swagger-ui/**`) or restrict it

---

## Related Files

| File | Purpose |
|---|---|
| `render.yaml` | Render service definition (build/start commands, env var keys) |
| `frontend/next.config.mjs` | Vercel build config and env var validation |
| `backend/src/main/resources/application.properties` | Production Spring Boot config |
| `backend/src/main/resources/db/migration/` | Flyway migrations (schema + seed data) |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step validation after each deployment |
