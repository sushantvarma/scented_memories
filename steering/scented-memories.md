# ScentedMemories — Architecture Steering Document

This document captures the frozen MVP architecture for the ScentedMemories application. The architecture is locked. Do not introduce structural changes unless the user explicitly requests them.

---

## Stack (Fixed — Do Not Change)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand |
| Backend | Spring Boot 3.x, Java 21 |
| Database | PostgreSQL on Neon |
| Frontend hosting | Vercel |
| Backend hosting | Render (free tier) |

---

## Architecture Constraints

- The backend is stateless. No server-side sessions. JWT only.
- The cart is entirely client-side (Zustand, in-memory). There is no server cart API and no cart persistence. Do not add one.
- All monetary values are in INR. There is no multi-currency support. Do not add a currencies table or currency_code columns.
- Product images are referenced by URL only. There is no image upload infrastructure. Do not add one.
- The admin account is seeded directly in the database. There is no self-service admin registration. Do not add one.
- No payment gateway. Orders are placed and recorded without payment processing.
- No email notifications. No real-time features. No WebSockets.

---

## Database Schema Rules

The schema is frozen. The 8 tables are: `categories`, `tags`, `products`, `product_images`, `product_variants`, `product_tags`, `users`, `orders`, `order_items`.

**Do not add new tables without explicit instruction.**

Key constraints to preserve in all implementations:

- `products.slug` — UNIQUE, NOT NULL. The UNIQUE constraint creates its own B-tree index. Do not add a separate index.
- `product_variants` — UNIQUE on `(product_id, label)`. Price CHECK `>= 0`.
- `product_images.position` — NOT NULL, no DEFAULT. Caller must supply explicit position. UNIQUE on `(product_id, position)`.
- `tags` — UNIQUE on `(name, dimension)`.
- `order_items` — UNIQUE on `(order_id, variant_id)`. Contains `variant_label_snap`, `product_name_snap`, `unit_price_snap` — all populated at order creation time from the database, never from client input.
- `orders.total_amount` — CHECK `> 0`. Computed server-side only.
- `orders.user_id` — nullable (guest orders).

**Active indexes (do not add or remove without explicit instruction):**
```
idx_products_category  ON products(category_id) WHERE active = TRUE
idx_variants_product   ON product_variants(product_id)
idx_product_tags_tag   ON product_tags(tag_id)
idx_orders_user        ON orders(user_id)
idx_orders_created     ON orders(created_at DESC)
```
`idx_orders_status` is intentionally omitted at MVP scale.

---

## API Rules

**Public endpoints (no auth required):**
- `GET /api/products` — paginated, filterable list. Filters: `categoryId`, `tagIds` (multi-value), `minPrice`, `maxPrice`, `search`.
- `GET /api/products/{slug}` — product detail by slug, not by ID.
- `GET /api/categories`
- `GET /api/tags`

**Admin endpoints (ADMIN JWT required, prefix `/api/admin/`):**
- `POST /api/admin/products`
- `PUT /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}` — soft-delete only (`active = false`)
- `PUT /api/admin/products/{productId}/variants/{variantId}/inventory`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/{id}/status`

**Order endpoints:**
- `POST /api/orders` — public, JWT optional. Associates with user if JWT present, otherwise guest (`user_id = NULL`).
- `GET /api/orders/{id}` — authenticated owner or ADMIN. Guest orders: ADMIN only.

**Response format:**
- Success: resource returned directly (no wrapper envelope).
- Error: `{ "status": <int>, "message": "<string>", "errors": { "<field>": "<message>" } }`

**Do not add new endpoints without explicit instruction.**

---

## Backend Implementation Rules

### Layer responsibilities
- Controllers: thin. Bean Validation on request body, delegate to service, return `ResponseEntity`.
- Services: all business logic. Stock checks, soft-delete, JWT issuance, bcrypt, snapshot capture, status transitions.
- Repositories: Spring Data JPA. Custom JPQL/native queries for filtering via `Specification` (Criteria API).
- Security: Spring Security JWT filter validates token before every request reaches a controller.

### Critical service behaviors (do not deviate)

1. **Order total is always server-side.** The `OrderService` fetches current `price` from `product_variants` at order creation time. Any price value in the client request body is ignored. `unit_price_snap` and `total_amount` are computed from DB values only.

2. **Stock decrement uses pessimistic locking.** Use `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the repository method that fetches a variant for stock decrement. This prevents overselling under concurrent orders.

3. **Soft delete only.** Products are never hard-deleted. `active = false` is the only deletion mechanism. This preserves `order_items` references.

4. **Order status transitions are enforced.** Valid transitions only:
   - `PENDING` → `PROCESSING` or `CANCELLED`
   - `PROCESSING` → `SHIPPED` or `CANCELLED`
   - `SHIPPED` → `FULFILLED`
   - `FULFILLED` and `CANCELLED` are terminal — no further transitions.
   - All other transitions return 400.

5. **Variant active flag is independent of product active flag.** A deactivated variant hides only that variant. A deactivated product hides the entire product regardless of variant flags.

6. **Category deletion is blocked if products are assigned.** Check `countByCategoryId > 0` before deletion. Return 400 if true.

7. **Duplicate tag assignment is idempotent.** Use `INSERT ... ON CONFLICT DO NOTHING` for `product_tags`. Never return an error for re-assigning an existing tag.

8. **Guest order ownership.** `GET /api/orders/{id}` for a guest order (`user_id = NULL`) is accessible to ADMIN only. Authenticated users can only access orders where `orders.user_id` matches their JWT `sub`.

### HikariCP configuration
```
spring.datasource.hikari.maximum-pool-size=5
```
Do not increase beyond 5 without verifying Neon free-tier connection limits.

### Security
- Passwords: bcrypt, minimum cost factor 10.
- JWT: stored in `localStorage` on the frontend (MVP trade-off; `httpOnly` cookie is post-MVP).
- JWT payload: `{ "sub": "<userId>", "role": "CUSTOMER|ADMIN", "exp": <unix_ts> }`. Expiry: 7 days.
- JWT secret: injected via `JWT_SECRET` environment variable.
- CORS: restrict to registered Vercel frontend origin only.
- Never expose stack traces or SQL errors in API responses. `spring.jpa.show-sql=false` in production.

### Error mapping (GlobalExceptionHandler)
| Exception | HTTP Status |
|---|---|
| `EntityNotFoundException` | 404 |
| `MethodArgumentNotValidException` | 400 |
| `InsufficientStockException` | 409 |
| `DuplicateEmailException` | 409 |
| `InvalidStatusTransitionException` | 400 |
| `CategoryNotEmptyException` | 400 |
| `AccessDeniedException` | 403 |
| `AuthenticationException` | 401 |
| `Exception` (catch-all) | 500 |

---

## Frontend Implementation Rules

### Routing
- Product listing: `/products` — SSR page. Filter state in URL search params only (not component state).
- Product detail: `/products/[slug]` — SSR page. Variant selection is client-side state.
- Checkout: `/checkout` — client-side. Redirect to `/products` if cart is empty on mount.
- Admin routes: `/admin/*` — wrapped in `AdminLayout`. Redirect to login if no JWT; redirect to home if role is CUSTOMER.

### Zustand cart store
The cart store interface is fixed:
```typescript
interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  price: number;       // price at time of add — display only, not sent to server for calculation
  quantity: number;
  imageUrl: string;
}
```
- `addItem`: increments quantity if `variantId` already exists.
- `updateQuantity(id, 0)`: removes the item.
- `subtotal()`: derived selector — `sum(price × quantity)`.
- Cart is in-memory only. No localStorage persistence in MVP.

### API client
- Base URL from `NEXT_PUBLIC_API_URL` env var.
- Inject `Authorization: Bearer <token>` from localStorage on every protected request.
- Retry with exponential backoff on 503 (cold start).
- Normalize all errors to `{ message: string, errors?: Record<string, string> }`.
- On cold start delay: show "Connecting to server..." loading state for up to 35 seconds before surfacing an error.

### SSR requirements
- Product listing and product detail pages MUST use SSR (Next.js server components or `getServerSideProps`).
- Each product detail page MUST set unique `<title>`, `<meta name="description">`, and Open Graph tags.
- A sitemap must include all active product detail page URLs.

---

## What Is Out of Scope for MVP

Do not implement any of the following unless explicitly instructed:

- Payment gateway (Razorpay, Stripe, or any other)
- Subscription or recurring orders
- Product recommendation engine
- Analytics dashboard
- Multi-vendor support
- Customer order history page (post-auth enhancement)
- Product reviews and ratings
- Wishlist / saved items
- Discount codes or promotional pricing
- Email or SMS notifications
- Mobile native app
- Real-time inventory sync or WebSockets
- Internationalization or multi-currency
- Tax calculation or GST invoicing
- Image upload infrastructure
- Server-side cart persistence
- `httpOnly` cookie JWT storage
- `idx_orders_status` database index

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel | Spring Boot API base URL |
| `JWT_SECRET` | Render | JWT signing secret |
| `DATABASE_URL` | Render | Neon PostgreSQL JDBC connection string |
