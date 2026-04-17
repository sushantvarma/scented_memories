# ScentedMemories — Deployment Validation Checklist

Run through this checklist top-to-bottom after every deployment.
Replace `BACKEND` and `FRONTEND` with your actual URLs throughout.

```
BACKEND  = https://scented-memories-backend.onrender.com
FRONTEND = https://scented-memories.vercel.app
```

---

## Phase 1 — Backend (Render)

### 1.1 Service is live

```bash
curl -i $BACKEND/health
```

**Expected**
```
HTTP/2 200
Content-Type: text/plain;charset=UTF-8

UP
```

**If it hangs for 30–50 s** — normal on first request after a cold start (Render free tier spins down after inactivity). Wait and retry.  
**If it returns 502/503 after 60 s** — the JVM failed to start. Check Render logs (see Phase 5).

---

### 1.2 JSON serialisation works

```bash
curl -s $BACKEND/test | python3 -m json.tool
```

**Expected**
```json
{
  "app": "scented-memories-backend",
  "status": "running",
  "timestamp": "2026-04-17T10:23:45.123Z"
}
```

**If you get HTML** — Spring Boot is returning its default error page. The app started but something is wrong with the request routing. Check that `BACKEND` has no trailing slash.

---

### 1.3 Database is connected and migrations ran

```bash
curl -s $BACKEND/api/categories | python3 -m json.tool
```

**Expected** — array of 6 categories seeded by V2:
```json
[
  { "id": 1, "name": "Essential Oils",  "slug": "essential-oils"  },
  { "id": 2, "name": "Aroma Oils",      "slug": "aroma-oils"      },
  { "id": 3, "name": "Incense",         "slug": "incense"         },
  { "id": 4, "name": "Rose Water",      "slug": "rose-water"      },
  { "id": 5, "name": "Diffusers",       "slug": "diffusers"       },
  { "id": 6, "name": "Fragrance Kits",  "slug": "fragrance-kits"  }
]
```

**If you get `[]`** — DB connected but migrations didn't run. Check `spring.flyway.enabled=true` and that `DATABASE_URL` points to the correct Neon database.  
**If you get 500** — DB connection failed. Verify `DATABASE_URL` on Render includes `?sslmode=require&channel_binding=require` and uses the **pooler** endpoint.

---

### 1.4 Products are seeded

```bash
curl -s "$BACKEND/api/products?size=5" | python3 -m json.tool
```

**Expected** — `totalElements: 10`, first page of 5 products from V3 seed.

```bash
# Verify a specific product by slug
curl -s $BACKEND/api/products/lavender-essential-oil | python3 -m json.tool
```

**Expected** — full product detail with 2 variants (10ml ₹349, 30ml ₹849) and tags.

**If you get 404** — V3 migration didn't run or ran with errors. Check Render logs for Flyway output at startup.

---

### 1.5 Auth endpoint works

```bash
curl -s -X POST $BACKEND/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scentedmemories.in","password":"Admin@123"}' \
  | python3 -m json.tool
```

**Expected**
```json
{
  "id": 1,
  "fullName": "ScentedMemories Admin",
  "email": "admin@scentedmemories.in",
  "role": "ADMIN",
  "token": "<jwt>"
}
```

**If you get 401** — admin user not seeded. Check V3 migration ran. The seed uses `ON CONFLICT DO NOTHING` so re-running is safe.  
**If you get 500** — `JWT_SECRET` env var is missing or too short (must be ≥ 32 chars).

Save the token for Phase 1.6:
```bash
TOKEN=$(curl -s -X POST $BACKEND/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scentedmemories.in","password":"Admin@123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

---

### 1.6 Protected endpoint respects JWT

```bash
# Should succeed with token
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BACKEND/api/admin/orders" | python3 -m json.tool

# Should return 401 without token — NOT a CORS error
curl -s "$BACKEND/api/admin/orders"
```

**Expected without token**
```json
{ "status": 401, "message": "Unauthorized" }
```

**If the browser shows a CORS error instead of 401** — the `AuthenticationEntryPoint` in `SecurityConfig` is not wired. Verify the backend was redeployed after the last `SecurityConfig.java` change.

---

### 1.7 CORS preflight passes from Vercel origin

```bash
curl -s -i -X OPTIONS $BACKEND/api/products \
  -H "Origin: $FRONTEND" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization"
```

**Expected headers in response**
```
Access-Control-Allow-Origin: https://scented-memories.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

**If `Access-Control-Allow-Origin` is missing** — `FRONTEND_URL` on Render is wrong or not set. It must exactly match the Vercel URL (no trailing slash, correct protocol).

---

## Phase 2 — Frontend (Vercel)

### 2.1 Site loads

Open `$FRONTEND` in a browser.

- [ ] Page renders without a blank white screen
- [ ] Navbar shows "ScentedMemories" logo and "Shop" link
- [ ] Hero section is visible
- [ ] No console errors about `NEXT_PUBLIC_API_URL`

**If the build failed on Vercel** — `NEXT_PUBLIC_API_URL` was not set before the build. Add it in Vercel → Settings → Environment Variables → Production, then redeploy.

---

### 2.2 Homepage calls the backend

Open browser DevTools → Network tab, then reload `$FRONTEND`.

- [ ] Request to `$BACKEND/api/products?size=8...` returns 200
- [ ] Request to `$BACKEND/api/categories` returns 200
- [ ] Featured products grid renders (8 products)
- [ ] Category grid renders (6 categories)

**If requests show as pending for 30+ s** — Render cold start. The frontend retries automatically for up to ~35 s. Normal on first visit after inactivity.  
**If requests fail with CORS error** — `FRONTEND_URL` on Render doesn't match the Vercel URL. Fix it and redeploy the backend.

---

### 2.3 Product listing page

Navigate to `$FRONTEND/products`.

- [ ] 10 products displayed (2 pages of 5, or 1 page of 10 depending on default size)
- [ ] Filter sidebar shows 6 categories and all tags grouped by dimension
- [ ] Search box is present
- [ ] URL updates when a filter is applied (e.g. `?categoryId=1`)
- [ ] Pagination controls appear if more than one page

---

### 2.4 Product detail page

Navigate to `$FRONTEND/products/lavender-essential-oil`.

- [ ] Product name "Lavender Essential Oil" renders
- [ ] Description is visible
- [ ] Two variant buttons: "10ml" (₹349) and "30ml" (₹849)
- [ ] Tags show: Lavender, Calming, Sleep, Meditation, Stress Relief
- [ ] Page `<title>` is "Lavender Essential Oil | ScentedMemories"
- [ ] Open Graph tags present (check with `curl -s $FRONTEND/products/lavender-essential-oil | grep og:`)

---

## Phase 3 — Cart and Order Flow

### 3.1 Add to cart

On the Lavender Essential Oil detail page:

- [ ] Select "10ml" variant — price ₹349 appears
- [ ] Click "Add to Cart" — button briefly shows "✓ Added to Cart"
- [ ] Cart icon in navbar shows badge with count "1"
- [ ] Navigate to `$FRONTEND/cart` — item appears with correct name, variant, price

---

### 3.2 Cart operations

On the cart page:

- [ ] Quantity `+` button increments quantity
- [ ] Quantity `−` button decrements; at 1 → 0 removes the item
- [ ] "Remove" link removes the item immediately
- [ ] Subtotal updates correctly (price × quantity)
- [ ] "Clear cart" removes all items and shows empty state
- [ ] Empty cart redirects to `/products` when "Continue Shopping" is clicked

---

### 3.3 Checkout — guest order

Add an item to cart, navigate to `$FRONTEND/checkout`.

- [ ] Page loads (not redirected — cart has items)
- [ ] Order summary shows correct items and subtotal
- [ ] Fill in the form:
  - Full Name: `Test User`
  - Email: `test@example.com`
  - Street: `123 MG Road`
  - City: `Bengaluru`
  - State: `Karnataka`
  - Postal Code: `560001`
  - Country: `India` (pre-filled)
- [ ] Click "Place Order"
- [ ] Redirected to `/order-confirmation/<id>`
- [ ] Order confirmation page shows order ID, items, total, and shipping address
- [ ] Cart is cleared (navbar badge gone)

**Verify server-side total** — the total shown on the confirmation page must match the DB price (₹349 for 10ml), not whatever was in the cart. This confirms the backend is computing the total, not the frontend.

---

### 3.4 Verify order in database (via admin API)

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BACKEND/api/admin/orders" | python3 -m json.tool
```

- [ ] The test order appears with status `PENDING`
- [ ] `totalAmount` matches the DB price (not client-submitted)
- [ ] `unit_price_snap`, `product_name_snap`, `variant_label_snap` are populated

---

### 3.5 Order status transition (admin)

```bash
# Replace <ORDER_ID> with the ID from the previous step
ORDER_ID=1

curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PROCESSING"}' \
  "$BACKEND/api/admin/orders/$ORDER_ID/status" | python3 -m json.tool
```

**Expected** — order returned with `"status": "PROCESSING"`.

```bash
# Verify invalid transition is rejected
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"FULFILLED"}' \
  "$BACKEND/api/admin/orders/$ORDER_ID/status"
```

**Expected** — `{ "status": 400, "message": "..." }` (PROCESSING → FULFILLED is invalid).

---

## Phase 4 — Admin Panel

### 4.1 Admin login

Navigate to `$FRONTEND/admin/login`.

- [ ] Login form renders
- [ ] Login with `admin@scentedmemories.in` / `Admin@123`
- [ ] Redirected to `$FRONTEND/admin` dashboard
- [ ] Sidebar shows Dashboard, Products, Orders
- [ ] Stats cards load (Total Products: 10, Total Orders: ≥ 1)

**If redirected to `/` instead of `/admin`** — the JWT `role` claim is not `ADMIN`. Verify the seed user has `role = 'ADMIN'` in the DB.

---

### 4.2 Admin products page

Navigate to `$FRONTEND/admin/products`.

- [ ] Product table loads with 10 rows
- [ ] Search filters the list
- [ ] "Deactivate" button soft-deletes a product (removes from public listing)
- [ ] Deactivated product no longer appears at `$FRONTEND/products`

---

### 4.3 Admin orders page

Navigate to `$FRONTEND/admin/orders`.

- [ ] Orders table loads
- [ ] Status filter buttons work (PENDING, PROCESSING, etc.)
- [ ] Clicking a row expands order detail (items + shipping address)
- [ ] Status transition buttons appear for non-terminal orders
- [ ] Clicking a transition button updates the status inline

---

## Phase 5 — Debugging Reference

### Where to look first

| Symptom | Where to look |
|---|---|
| Backend not responding | Render dashboard → Logs tab → look for startup errors |
| Flyway migration failed | Render logs → search `FlywayException` or `Migration V` |
| DB connection refused | Render logs → search `HikariPool` or `Connection refused` |
| JWT errors | Render logs → search `JwtException` or `SignatureException` |
| CORS errors in browser | Browser DevTools → Network → failed preflight OPTIONS request |
| Frontend build failed | Vercel dashboard → Deployments → build log |
| Blank page on Vercel | Browser console → look for `NEXT_PUBLIC_API_URL` error |

---

### Render logs — useful search terms

```
# DB connection issues
HikariPool | Connection refused | SSL | neon

# Flyway
Flyway | Migration | V1__ | V2__ | V3__

# JWT
JwtException | SignatureException | ExpiredJwt

# App startup
Started ScentedMemoriesApplication | Tomcat started

# Request errors
ERROR | WARN | Exception
```

---

### Quick CORS diagnosis

Open browser DevTools → Console. A CORS error looks like:

```
Access to fetch at 'https://...onrender.com/api/...' from origin
'https://...vercel.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

**Checklist:**
1. Is `FRONTEND_URL` set on Render? (Render dashboard → Environment)
2. Does it exactly match the Vercel URL? (no trailing slash, `https://` not `http://`)
3. Was the backend redeployed after setting `FRONTEND_URL`?
4. Run the Phase 1.7 `curl` test to confirm the header is present.

---

### Quick DB diagnosis

```bash
# Test the Neon connection directly (requires psql)
psql "$NEON_CONNECTION_STRING" -c "SELECT COUNT(*) FROM products;"

# Expected: 10
```

If the count is 0 or the command fails:
- Verify `DATABASE_URL` on Render uses the **pooler** endpoint (`ep-xxx-pooler.region...`)
- Verify the URL includes `?sslmode=require&channel_binding=require`
- Check Neon dashboard → Branches → confirm the database is active (not suspended)

---

### Cold start behaviour (expected, not a bug)

Render free tier suspends the service after 15 minutes of inactivity. The first request after suspension triggers a cold start that takes **30–50 seconds**. During this time:

- The frontend shows a loading state
- The API client retries automatically (up to ~35 s total: 2 s + 4 s + 8 s + 16 s)
- Render's health check has a grace period and will not mark the deploy as failed

This is normal. If the service does not respond after 60 s, check Render logs for a startup error.

---

### Post-launch security hardening

Once both services are confirmed working:

- [ ] Set `FRONTEND_URL` on Render to the exact Vercel URL (remove the `*` default)
- [ ] Change the admin password — the seed password `Admin@123` is public
- [ ] Rotate `JWT_SECRET` if it was ever logged or shared
- [ ] Verify `spring.jpa.show-sql=false` in production (already set)
- [ ] Verify Swagger UI is acceptable to expose (`/swagger-ui/**` is public)
