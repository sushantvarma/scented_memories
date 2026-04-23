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

**If it hangs for 30–50 s** — normal cold start (Render free tier spins down after inactivity). Wait and retry.
**If it returns 502/503 after 60 s** — JVM failed to start. Check Render logs.

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

---

### 1.3 Database connected and all migrations ran

```bash
curl -s $BACKEND/api/categories | python3 -m json.tool
```

**Expected** — 6 categories from V2 migration:
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

**If you get `[]`** — DB connected but migrations didn't run. Check `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD` on Render.
**If you get 500** — DB connection failed. Verify credentials and that `DATABASE_URL` uses the pooler endpoint with `?sslmode=require`.

---

### 1.4 Products are seeded with correct image URLs

```bash
curl -s "$BACKEND/api/products?size=3" | python3 -m json.tool | grep primaryImageUrl
```

**Expected** — local paths like `/lavender-essential-oil.jpeg` (not the old CDN URLs):
```
"primaryImageUrl": "/lavender-essential-oil.jpeg",
```

**If you see `https://images.scentedmemories.in/...`** — V4 migration didn't run. Check Render logs for Flyway output.

---

### 1.5 Auth endpoint works

```bash
curl -s -X POST $BACKEND/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scentedmemories.in","password":"sushant123"}' \
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

**If you get 401** — V5 migration (password update) didn't run, or password was changed again. Check Render logs.

Save the token:
```bash
TOKEN=$(curl -s -X POST $BACKEND/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scentedmemories.in","password":"sushant123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

---

### 1.6 Protected endpoints respect JWT

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

---

### 1.7 Admin product search is name-only

```bash
# Should return only Lavender Essential Oil, NOT Eucalyptus
curl -s "$BACKEND/api/admin/products?search=lavender" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | grep '"name"'
```

**Expected** — only products with "lavender" in the name, not in the description.

---

### 1.8 CORS preflight passes from Vercel origin

```bash
curl -s -i -X OPTIONS $BACKEND/api/products \
  -H "Origin: $FRONTEND" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization"
```

**Expected headers**
```
Access-Control-Allow-Origin: https://scented-memories.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

**If `Access-Control-Allow-Origin` is missing** — `FRONTEND_URL` on Render is wrong or not set.

---

## Phase 2 — Frontend (Vercel)

### 2.1 Site loads

Open `$FRONTEND` in a browser.

- [ ] Page renders — hero section, featured products, category grid visible
- [ ] Navbar shows company logo + "ScentedMemories" text
- [ ] No console errors about `NEXT_PUBLIC_API_URL`

---

### 2.2 Product images appear

- [ ] Product cards on homepage show product images (not the ✦ placeholder)
- [ ] Product detail page shows the product image

**If images are missing** — check that Render has redeployed and V4 migration ran (see 1.4).

---

### 2.3 Product listing and filters

Navigate to `$FRONTEND/products`.

- [ ] Products listed with images, names, prices
- [ ] On mobile: "Filters" toggle button appears above the grid
- [ ] On desktop: filter sidebar visible on the left
- [ ] Category filter narrows results correctly
- [ ] Search for "Lavender" returns only Lavender Essential Oil (not Eucalyptus)
- [ ] URL updates when filters are applied (`?categoryId=1`)

---

### 2.4 Product detail page

Navigate to `$FRONTEND/products/lavender-essential-oil`.

- [ ] Product name, description, image, tags visible
- [ ] Two variant buttons: "10ml" (₹349) and "30ml" (₹849)
- [ ] Selecting a variant shows the price
- [ ] Page `<title>` is "Lavender Essential Oil | ScentedMemories"

---

## Phase 3 — Cart and Order Flow

### 3.1 Add to cart

- [ ] Select "10ml" variant on Lavender Essential Oil
- [ ] Click "Add to Cart" — button shows "✓ Added to Cart"
- [ ] Cart badge in navbar shows "1"
- [ ] Navigate to `/cart` — item appears correctly

### 3.2 Checkout — guest order

- [ ] Navigate to `/checkout` with items in cart
- [ ] Fill in shipping details and click "Place Order"
- [ ] Redirected to `/order-confirmation/<id>`
- [ ] Order total matches DB price (₹349), not client-submitted price
- [ ] Cart is cleared after order

---

## Phase 4 — Admin Panel

### 4.1 Admin login

Navigate to `$FRONTEND/admin/login`.

- [ ] Login with `admin@scentedmemories.in` / `sushant123`
- [ ] Redirected to `/admin` dashboard (not stuck on spinner)
- [ ] Dashboard shows: Total Products, Total Orders, Pending Orders stats
- [ ] Recent Orders table shows all orders (all statuses, not just pending)
- [ ] Refresh button reloads dashboard data

### 4.2 Admin products

Navigate to `$FRONTEND/admin/products`.

- [ ] All 10 products listed with images
- [ ] Search for "Lavender" returns only Lavender Essential Oil
- [ ] "Edit" link opens the edit form pre-filled with product data
- [ ] Edit form shows: name, description, category, image URLs with preview, variants, tags
- [ ] Changing a price and clicking "Save & Publish" updates the storefront immediately
- [ ] "Add Product" opens a blank form
- [ ] Creating a new product makes it appear in the public storefront
- [ ] "Deactivate" removes the product from the public listing
- [ ] On mobile: table scrolls horizontally

### 4.3 Admin orders

Navigate to `$FRONTEND/admin/orders`.

- [ ] All orders listed with status badges
- [ ] Status filter buttons (All, PENDING, PROCESSING, etc.) work
- [ ] Clicking a row expands order detail (items + shipping address)
- [ ] Status transition buttons appear for non-terminal orders
- [ ] Clicking a transition button updates status inline
- [ ] On mobile: table scrolls horizontally

---

## Phase 5 — Debugging Reference

### Where to look first

| Symptom | Where to look |
|---|---|
| Backend not responding | Render → Logs tab → startup errors |
| Flyway migration failed | Render logs → search `FlywayException` or `Migration V` |
| DB connection refused | Render logs → search `HikariPool` or `PSQLException` |
| JWT errors | Render logs → search `JwtException` or `SignatureException` |
| CORS errors in browser | Browser DevTools → Network → failed OPTIONS preflight |
| Frontend build failed | Vercel → Deployments → build log |
| Admin stuck on spinner | JWT hydration race — ensure latest frontend is deployed |
| Images not showing | Check V4 migration ran; check Render redeployed after image push |
| Search returning wrong results | Check V4 migration ran; admin uses name-only search |

---

### Render logs — useful search terms

```
HikariPool | PSQLException | Connection refused   # DB issues
Flyway | Migration | V1__ | V2__ | V3__ | V4__ | V5__  # Migration issues
JwtException | SignatureException                 # JWT issues
Started ScentedMemoriesApplication               # Successful startup
ERROR | WARN | Exception                          # General errors
```

---

### Quick CORS diagnosis

```
Access to fetch at 'https://...onrender.com/api/...' from origin
'https://...vercel.app' has been blocked by CORS policy
```

1. Is `FRONTEND_URL` set on Render?
2. Does it exactly match the Vercel URL? (no trailing slash, `https://`)
3. Was the backend redeployed after setting `FRONTEND_URL`?
4. Run the Phase 1.8 `curl` test.

---

### Cold start (expected, not a bug)

Render free tier suspends after 15 minutes of inactivity. Cold start takes 30–50 seconds. The frontend retries automatically for ~35 seconds. If the service doesn't respond after 60 seconds, check Render logs for a startup error.

---

### Post-launch security

- [ ] `FRONTEND_URL` on Render set to exact Vercel URL (not `*`)
- [ ] `JWT_SECRET` is at least 32 random characters
- [ ] `spring.jpa.show-sql=false` in production (already set)
- [ ] Admin password changed from default if needed
