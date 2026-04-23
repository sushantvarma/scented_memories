# Requirements Document — ScentedMemories

## Executive Summary

### Purpose

This document defines the requirements for **ScentedMemories**, a full-stack e-commerce application serving a small business that sells home fragrance and wellness products, including aroma oils, essential oils, dhoop cones, incense sticks, rose water, diffusers, and fragrance kits. The application enables customers to discover, filter, and purchase products online, and provides the business owner with tools to manage the product catalog, inventory, and orders.

### Scope

**In Scope (MVP):**
- Public product catalog with browsing, filtering, and search
- Product detail pages with variant selection (size, quantity)
- Shopping cart with add, remove, and quantity update
- Guest and authenticated checkout with order placement
- User authentication (signup, login) with role-based access (customer, admin)
- Admin panel for product CRUD, inventory management, and order viewing
- Deployment on Vercel (frontend), Render (backend), and Neon PostgreSQL (database)

**Out of Scope (MVP):**
- Payment gateway integration (orders are placed without payment processing)
- Subscription or recurring order features
- Product recommendation engine
- Advanced analytics or reporting dashboards
- Multi-vendor or marketplace support
- Mobile native application
- Real-time inventory sync or live notifications
- Customer reviews and ratings
- Loyalty or rewards programs

---

## Glossary

- **System**: The full-stack ScentedMemories application as a whole
- **Frontend**: The Next.js web application served to end users
- **Backend**: The Spring Boot REST API server
- **Database**: The PostgreSQL instance hosted on Neon
- **Customer**: An end user who browses and purchases products
- **Admin**: The business owner or authorized staff member who manages the catalog and orders
- **Product**: A sellable item in the catalog (e.g., aroma oil, diffuser)
- **Variant**: A specific configuration of a product defined by size or quantity (e.g., 10ml, 30ml)
- **Category**: A top-level grouping of products (e.g., Oils, Incense, Diffusers)
- **Tag**: A descriptive label applied to a product for filtering (e.g., scent: lavender, mood: calming, use-case: meditation)
- **Cart**: A temporary, session-scoped or user-scoped collection of selected product variants and quantities
- **Order**: A confirmed purchase record created when a customer completes checkout
- **OrderItem**: A single line in an order representing one product variant and its quantity
- **Inventory**: The tracked stock quantity for each product variant
- **JWT**: JSON Web Token used for stateless authentication
- **SSR**: Server-Side Rendering, used by Next.js to pre-render pages for SEO and performance
- **Cold Start**: The latency introduced when a Render free-tier backend instance wakes from an idle state

---

## User Personas

### Persona 1: Customer (Buyer)

**Profile:** A consumer interested in home fragrance and wellness products, typically browsing on desktop or mobile.

**Goals:**
- Discover products that match a specific scent, mood, or use-case
- Quickly understand product details, variants, and pricing
- Add items to a cart and place an order with minimal friction
- Track what they have ordered

**Pain Points:**
- Difficulty finding products without clear filtering by scent or purpose
- Uncertainty about product sizes and which variant to choose
- Slow or confusing checkout flows that cause abandonment
- Lack of trust signals (product descriptions, clear pricing)

**Usage Patterns:**
- Browses catalog by category or mood tag
- Uses filters to narrow down by scent family or use-case
- Views product detail page before adding to cart
- Expects checkout to complete in under 3 minutes

---

### Persona 2: Admin (Business Owner)

**Profile:** The small business owner or a trusted staff member managing the online store.

**Goals:**
- Add new products and variants quickly without technical knowledge
- Update stock levels as inventory changes
- View incoming orders and their details to fulfill them
- Keep the catalog accurate and up to date

**Pain Points:**
- Time-consuming manual catalog updates
- No visibility into which orders are pending or fulfilled
- Risk of overselling when inventory is not tracked
- Difficulty managing product variants (sizes, quantities) per product

**Usage Patterns:**
- Logs into the admin panel to add or edit products
- Updates inventory counts after receiving or shipping stock
- Reviews the order list daily to identify new orders
- Occasionally deletes discontinued products from the catalog

---

## User Journeys

### Journey 1: Customer — Browse and Filter Products

1. Customer lands on the homepage, which displays featured products and category links.
2. Customer clicks a category (e.g., "Oils") or uses the navigation to reach the product listing page.
3. Customer applies filters: selects a scent tag (e.g., "Lavender"), a mood tag (e.g., "Calming"), and a price range.
4. The product listing updates to show only matching products.
5. Customer scrolls through results and clicks a product card to view details.

### Journey 2: Customer — View Product and Add to Cart

1. Customer views the product detail page showing name, description, images, tags, and available variants.
2. Customer selects a variant (e.g., 30ml bottle).
3. Customer clicks "Add to Cart".
4. The cart icon updates to reflect the new item count.
5. Customer continues browsing or proceeds to the cart.

### Journey 3: Customer — Checkout and Place Order

1. Customer opens the cart and reviews items, quantities, and subtotal.
2. Customer updates a quantity or removes an item if needed.
3. Customer clicks "Proceed to Checkout".
4. If not logged in, the customer is prompted to log in or continue as guest (guest checkout is in scope for MVP).
5. Customer enters shipping details (name, address, phone).
6. Customer reviews the order summary and clicks "Place Order".
7. The system creates an order record and displays a confirmation with an order ID.

### Journey 4: Admin — Add a Product

1. Admin navigates to the admin panel and logs in with admin credentials.
2. Admin clicks "Add Product" and fills in the product form: name, description, category, tags, and images.
3. Admin adds one or more variants, each with a size/quantity label, price, and initial stock count.
4. Admin submits the form.
5. The product appears in the public catalog immediately.

### Journey 5: Admin — Manage Inventory

1. Admin navigates to the product list in the admin panel.
2. Admin selects a product and views its variants with current stock levels.
3. Admin updates the stock count for one or more variants.
4. The system saves the updated inventory values.

### Journey 6: Admin — View Orders

1. Admin navigates to the Orders section of the admin panel.
2. Admin sees a list of all orders sorted by date, with order ID, customer name, status, and total.
3. Admin clicks an order to view its full details: items, quantities, shipping address, and order status.
4. Admin can update the order status (e.g., from "Pending" to "Fulfilled").

---

## Functional Requirements

### Requirement 1: Product Catalog — Listing and Display

**User Story:** As a customer, I want to browse all available products in a structured catalog, so that I can discover items relevant to my needs.

#### Acceptance Criteria

1. THE Frontend SHALL display a product listing page showing all active products as cards with name, primary image, starting price, and category.
2. WHEN a customer selects a category, THE Frontend SHALL display only products belonging to that category.
3. THE Frontend SHALL render the product listing page using SSR so that product data is available to search engine crawlers.
4. WHEN no products match the applied filters, THE Frontend SHALL display a "No products found" message.
5. THE Backend SHALL expose a paginated product listing API that accepts filter parameters for category, tags, and price range.

---

### Requirement 2: Product Catalog — Filtering and Search

**User Story:** As a customer, I want to filter products by scent, mood, use-case, and price, so that I can quickly find products that match my preferences.

#### Acceptance Criteria

1. THE Frontend SHALL provide filter controls for: category, scent tag, mood tag, use-case tag, and price range (min/max).
2. WHEN a customer applies one or more filters, THE Frontend SHALL send the filter parameters to the Backend and display the filtered results.
3. WHEN a customer enters a search term, THE Backend SHALL return products whose name or description contains the search term (case-insensitive).
4. WHEN a customer clears all filters, THE Frontend SHALL display the full unfiltered product listing.
5. THE Backend SHALL support combining multiple filter parameters in a single query (AND logic across filter types).

---

### Requirement 3: Product Catalog — Product Detail Page

**User Story:** As a customer, I want to view detailed information about a product including its variants, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE Frontend SHALL display a product detail page with: name, full description, all images, category, all associated tags, and all available variants.
2. WHEN a customer views a product detail page, THE Frontend SHALL display each variant with its label (e.g., "30ml"), price, and availability status.
3. WHEN a variant is out of stock, THE Frontend SHALL display that variant as unavailable and prevent it from being added to the cart.
4. THE Frontend SHALL render the product detail page using SSR so that product metadata is indexable by search engines.
5. THE Backend SHALL expose a product detail API that returns a single product with all its variants and tags.

---

### Requirement 4: Product Catalog — Tags and Categorization

**User Story:** As a customer, I want products to be tagged with scent, mood, and use-case labels, so that I can find products suited to a specific purpose or preference.

#### Acceptance Criteria

1. THE System SHALL support three tag dimensions: scent (e.g., Lavender, Sandalwood, Rose), mood (e.g., Calming, Energizing, Romantic), and use-case (e.g., Meditation, Sleep, Home Decor).
2. THE Backend SHALL allow each product to be associated with multiple tags across all tag dimensions.
3. THE Frontend SHALL display all tags associated with a product on its detail page.
4. WHEN a customer clicks a tag on a product card or detail page, THE Frontend SHALL navigate to the product listing filtered by that tag.

---

### Requirement 5: Product Catalog — Variants

**User Story:** As a customer, I want to select a specific size or quantity variant of a product, so that I can purchase the exact configuration I need.

#### Acceptance Criteria

1. THE System SHALL support product variants defined by a label (e.g., "10ml", "30ml", "Pack of 6") and a price.
2. THE Frontend SHALL require the customer to select a variant before enabling the "Add to Cart" action.
3. THE Backend SHALL store price and stock quantity independently for each variant.
4. WHEN a product has only one variant, THE Frontend SHALL pre-select that variant automatically.

---

### Requirement 6: Cart — Add, Remove, and Update Items

**User Story:** As a customer, I want to manage items in my cart before checkout, so that I can control what I purchase.

#### Acceptance Criteria

1. WHEN a customer clicks "Add to Cart" with a variant selected, THE Frontend SHALL add the item to the cart and update the cart item count in the navigation.
2. WHEN a customer adds a product variant that is already in the cart, THE Frontend SHALL increment the quantity of that item rather than adding a duplicate entry.
3. WHEN a customer updates the quantity of a cart item to zero, THE Frontend SHALL remove that item from the cart.
4. WHEN a customer clicks "Remove" on a cart item, THE Frontend SHALL remove that item from the cart immediately.
5. THE Frontend SHALL persist the cart state in Zustand and maintain it across page navigations within the same session.
6. THE Frontend SHALL display the cart subtotal, calculated as the sum of (variant price × quantity) for all cart items.

---

### Requirement 7: Checkout — Order Placement

**User Story:** As a customer, I want to place an order by providing my shipping details, so that I can receive the products I selected.

#### Acceptance Criteria

1. THE Frontend SHALL display a checkout form collecting: full name, email address, phone number, shipping address (street, city, state, postal code, country).
2. WHEN a customer submits the checkout form with missing required fields, THE Frontend SHALL display inline validation errors and prevent order submission.
3. WHEN a customer submits a valid checkout form, THE Backend SHALL create an Order record with status "Pending" and associated OrderItems.
4. WHEN an order is successfully created, THE Frontend SHALL display an order confirmation page with the order ID and a summary of items ordered.
5. IF the Backend returns an error during order creation, THEN THE Frontend SHALL display an error message and allow the customer to retry.
6. WHEN an order is placed, THE Backend SHALL decrement the inventory count for each ordered product variant by the ordered quantity.
7. IF a customer attempts to order a quantity exceeding available stock, THEN THE Backend SHALL return a validation error and THE Frontend SHALL display the stock limitation to the customer.

---

### Requirement 8: Authentication — Customer Signup and Login

**User Story:** As a customer, I want to create an account and log in, so that I can access my order history and have a personalized experience.

#### Acceptance Criteria

1. THE Frontend SHALL provide a signup form collecting: full name, email address, and password.
2. WHEN a customer submits the signup form, THE Backend SHALL validate that the email address is not already registered.
3. IF the email address is already registered, THEN THE Backend SHALL return an error and THE Frontend SHALL display a message indicating the email is taken.
4. WHEN a customer successfully registers, THE Backend SHALL store the password as a bcrypt hash and issue a JWT.
5. THE Frontend SHALL provide a login form accepting email address and password.
6. WHEN a customer submits valid login credentials, THE Backend SHALL return a JWT and THE Frontend SHALL store it for use in authenticated requests.
7. IF a customer submits invalid login credentials, THEN THE Backend SHALL return a 401 response and THE Frontend SHALL display an "Invalid credentials" message.
8. WHEN a customer logs out, THE Frontend SHALL clear the stored JWT and redirect to the homepage.

---

### Requirement 9: Authentication — Role-Based Access Control

**User Story:** As the business owner, I want admin-only routes to be protected, so that only authorized users can manage the catalog and orders.

#### Acceptance Criteria

1. THE System SHALL assign each user account one of two roles: CUSTOMER or ADMIN.
2. WHEN a request is made to an admin API endpoint without a valid JWT, THE Backend SHALL return a 401 Unauthorized response.
3. WHEN a request is made to an admin API endpoint with a valid JWT belonging to a CUSTOMER role, THE Backend SHALL return a 403 Forbidden response.
4. THE Frontend SHALL redirect any unauthenticated user who attempts to access an admin route to the login page.
5. THE Frontend SHALL redirect any authenticated CUSTOMER who attempts to access an admin route to the homepage.

---

### Requirement 10: Admin Panel — Product CRUD

**User Story:** As an admin, I want to create, edit, and delete products in the catalog, so that I can keep the store up to date.

#### Acceptance Criteria

1. THE Frontend SHALL provide an admin product list page showing all products with name, image, category, starting price, and active status.
2. THE Frontend SHALL provide an "Add Product" form allowing the admin to enter: name, description, category, image URLs (with live preview), and one or more variants (each with label, price, and initial stock), and tags.
3. WHEN an admin submits a valid "Add Product" form and clicks "Save & Publish", THE Backend SHALL persist the product and all its variants and THE Frontend SHALL navigate to the product list. The product appears in the public catalog immediately.
4. THE Frontend SHALL provide an "Edit Product" form pre-populated with the existing product data, allowing the admin to modify any field including prices, stock, images, and tags.
5. WHEN an admin submits a valid "Edit Product" form and clicks "Save & Publish", THE Backend SHALL update the product record and changes SHALL be visible in the public storefront on the next page load.
6. WHEN an admin deactivates a product, THE Backend SHALL mark the product as inactive (`active = false`) rather than permanently deleting it, so that existing order history referencing the product remains intact.
7. IF an admin submits a product form with missing required fields (name, category, at least one variant with price), THEN THE Backend SHALL return a validation error and THE Frontend SHALL display the errors inline.
8. THE admin product search SHALL match product names only (not descriptions), so that searching "lavender" returns only products named "Lavender Essential Oil" and not products whose description mentions lavender.

---

### Requirement 11: Admin Panel — Inventory Management

**User Story:** As an admin, I want to update stock levels for product variants, so that the catalog accurately reflects available inventory.

#### Acceptance Criteria

1. THE Frontend SHALL display current stock quantities for each variant on the product edit page.
2. WHEN an admin updates the stock quantity for a variant and saves, THE Backend SHALL persist the new stock value.
3. WHEN a variant's stock quantity reaches zero, THE Backend SHALL mark that variant as out of stock and THE Frontend SHALL reflect this status on the product detail page.
4. THE Backend SHALL prevent stock quantities from being set to a negative value and return a validation error if attempted.

---

### Requirement 12: Admin Panel — Order Management

**User Story:** As an admin, I want to view and manage all customer orders, so that I can fulfill them accurately.

#### Acceptance Criteria

1. THE Frontend SHALL display an admin order list page showing all orders with: order ID, customer name, order date, item count, total amount, and current status.
2. THE Frontend SHALL support filtering the order list by status (All, PENDING, PROCESSING, SHIPPED, FULFILLED, CANCELLED).
3. WHEN an admin clicks an order row, THE Frontend SHALL expand the row to display the full order detail: customer shipping address, all order items with variant labels and quantities, and the order total.
4. THE Frontend SHALL allow the admin to update the order status from a defined set: Pending → Processing, Processing → Shipped, Shipped → Fulfilled, and Pending/Processing → Cancelled.
5. WHEN an admin updates an order status, THE Backend SHALL persist the new status and THE Frontend SHALL reflect the change immediately without a page reload.
6. THE admin dashboard SHALL display a "Recent Orders" table showing the 5 most recent orders across all statuses, with a Refresh button and a "Last updated" timestamp.
7. THE admin order and product tables SHALL support horizontal scrolling on mobile devices so all columns are accessible.

---

## Non-Functional Requirements

### Requirement 13: Performance

**User Story:** As a customer, I want pages to load quickly, so that I can browse without frustration.

#### Acceptance Criteria

1. THE Frontend SHALL achieve a Time to First Byte (TTFB) of under 800ms for SSR product listing and detail pages under normal load conditions.
2. THE Frontend SHALL achieve a Largest Contentful Paint (LCP) of under 3 seconds on a standard broadband connection for product listing and detail pages.
3. THE Backend SHALL respond to product listing API requests within 500ms for catalogs of up to 500 products.
4. THE Backend SHALL respond to order creation API requests within 1000ms under normal load.

---

### Requirement 14: Scalability

**User Story:** As the business owner, I want the system to handle growth in traffic and catalog size without requiring immediate re-architecture.

#### Acceptance Criteria

1. THE Backend SHALL support a product catalog of up to 500 active products without degradation in API response time beyond the limits defined in Requirement 13.
2. THE Database schema SHALL be designed to support up to 10,000 order records without requiring structural changes.
3. THE Backend SHALL be stateless so that horizontal scaling (adding more instances) is possible without session-sharing concerns.

---

### Requirement 15: Security

**User Story:** As a user of the system, I want my data and account to be protected, so that I can trust the platform with my personal information.

#### Acceptance Criteria

1. THE Backend SHALL authenticate all protected API endpoints using JWT validation on every request.
2. THE Backend SHALL store all user passwords using bcrypt with a minimum cost factor of 10.
3. THE Backend SHALL validate and sanitize all user-supplied input before processing or persisting it.
4. THE Backend SHALL enforce HTTPS for all API communication (handled at the Render hosting layer).
5. THE Backend SHALL include CORS configuration that restricts API access to the registered Frontend origin.
6. THE Backend SHALL not expose internal stack traces or database error details in API error responses.

---

### Requirement 16: Availability

**User Story:** As a customer, I want the application to be available when I want to shop, so that I am not blocked by downtime.

#### Acceptance Criteria

1. THE Frontend, hosted on Vercel, SHALL target 99.9% uptime as provided by the Vercel platform SLA.
2. THE Backend, hosted on Render free tier, SHALL be expected to experience cold start delays of up to 30 seconds after periods of inactivity; this is an accepted constraint of the free-tier deployment.
3. THE Frontend SHALL display a user-friendly loading state when the Backend is slow to respond due to a cold start, rather than showing an unhandled error.
4. THE Database, hosted on Neon free tier, SHALL be expected to have connection limits consistent with the Neon free-tier plan; the Backend SHALL use a connection pool sized within those limits.

---

### Requirement 17: SEO

**User Story:** As the business owner, I want product pages to be discoverable by search engines, so that organic traffic can reach the store.

#### Acceptance Criteria

1. THE Frontend SHALL use Next.js SSR to render product listing and product detail pages with full HTML content on the server before sending to the client.
2. THE Frontend SHALL set unique `<title>` and `<meta name="description">` tags for each product detail page using the product name and description.
3. THE Frontend SHALL set Open Graph meta tags (`og:title`, `og:description`, `og:image`) on product detail pages to support social sharing previews.
4. THE Frontend SHALL generate a sitemap that includes URLs for all active product detail pages.

---

## Data Requirements

### Conceptual Entities and Attributes

**Product**
- Unique identifier
- Name
- Description (long-form text)
- Primary image URL and additional image URLs
- Category (reference to Category)
- Active status (boolean, defaults to true)
- Created and updated timestamps

**ProductVariant**
- Unique identifier
- Reference to parent Product
- Label (e.g., "10ml", "30ml", "Pack of 6")
- Price (decimal, in the store's base currency)
- Stock quantity (integer, non-negative)
- Active status

**Category**
- Unique identifier
- Name (e.g., Oils, Incense, Diffusers, Kits, Rose Water)
- Slug (URL-safe identifier)
- Description (optional)

**Tag**
- Unique identifier
- Name (e.g., "Lavender", "Calming", "Meditation")
- Dimension (enum: SCENT, MOOD, USE_CASE)

**ProductTag** (association)
- Reference to Product
- Reference to Tag

**User**
- Unique identifier
- Full name
- Email address (unique)
- Password hash
- Role (enum: CUSTOMER, ADMIN)
- Created timestamp

**Order**
- Unique identifier
- Reference to User (nullable for guest orders)
- Customer name (denormalized for guest support)
- Customer email
- Customer phone
- Shipping address (street, city, state, postal code, country)
- Status (enum: PENDING, PROCESSING, SHIPPED, FULFILLED, CANCELLED)
- Total amount (decimal, calculated at time of order)
- Created and updated timestamps

**OrderItem**
- Unique identifier
- Reference to Order
- Reference to ProductVariant
- Variant label snapshot (denormalized to preserve order history if variant is later changed)
- Unit price snapshot (denormalized to preserve price at time of purchase)
- Quantity

### Key Relationships

- A Product belongs to one Category; a Category has many Products.
- A Product has one or more ProductVariants.
- A Product is associated with zero or more Tags through the ProductTag association.
- An Order has one or more OrderItems.
- Each OrderItem references one ProductVariant.
- An Order optionally references a User (null for guest checkout).
- A User has zero or more Orders.

---

## API Requirements

### Authentication APIs

**POST /api/auth/register**
- Purpose: Register a new customer account
- Input: Full name, email address, password
- Output: Created user profile (excluding password hash), JWT
- Errors: 409 if email already exists, 400 for validation failures

**POST /api/auth/login**
- Purpose: Authenticate an existing user
- Input: Email address, password
- Output: JWT, user role
- Errors: 401 for invalid credentials

---

### Product APIs

**GET /api/products**
- Purpose: Retrieve a paginated, filterable list of active products
- Input (query params): page, size, categoryId, tagIds (multi-value), minPrice, maxPrice, search (text)
- Output: Paginated list of products with name, primary image, starting price, category, and tags
- Access: Public

**GET /api/products/{id}**
- Purpose: Retrieve full details of a single product including all variants and tags
- Input: Product ID (path param)
- Output: Full product object with variants and tags
- Access: Public
- Errors: 404 if product not found or inactive

**POST /api/admin/products**
- Purpose: Create a new product with variants and tags
- Input: Product fields, array of variants, array of tag IDs
- Output: Created product with variants and tags
- Access: ADMIN only
- Errors: 400 for validation failures, 401/403 for unauthorized access

**PUT /api/admin/products/{id}**
- Purpose: Update an existing product's fields, variants, and tags
- Input: Updated product fields, variants, tag IDs
- Output: Updated product
- Access: ADMIN only
- Errors: 404 if not found, 400 for validation failures

**DELETE /api/admin/products/{id}**
- Purpose: Soft-delete a product (set active = false)
- Input: Product ID (path param)
- Output: 204 No Content
- Access: ADMIN only

---

### Category and Tag APIs

**GET /api/categories**
- Purpose: Retrieve all product categories
- Output: List of categories with name and slug
- Access: Public

**GET /api/tags**
- Purpose: Retrieve all tags grouped by dimension (SCENT, MOOD, USE_CASE)
- Output: Tags grouped by dimension
- Access: Public

---

### Cart APIs

> The cart is managed entirely on the client side using Zustand state. No server-side cart persistence is required for MVP. These APIs are therefore not applicable for MVP; cart state is local to the browser session.

---

### Order APIs

**POST /api/orders**
- Purpose: Place a new order from the current cart contents
- Input: Customer details (name, email, phone, shipping address), array of order items (variant ID, quantity)
- Output: Created order with order ID, items, and total
- Access: Public (supports guest checkout); optionally associates with authenticated user if JWT is present
- Errors: 400 for validation failures, 409 if any variant has insufficient stock

**GET /api/orders/{id}**
- Purpose: Retrieve a specific order's details
- Input: Order ID (path param)
- Output: Full order with items, shipping details, and status
- Access: Authenticated user who owns the order, or ADMIN

**GET /api/admin/orders**
- Purpose: Retrieve a paginated list of all orders
- Input (query params): page, size, status filter, sort by date
- Output: Paginated list of orders with summary fields
- Access: ADMIN only

**PUT /api/admin/orders/{id}/status**
- Purpose: Update the status of an order
- Input: New status value
- Output: Updated order
- Access: ADMIN only
- Errors: 400 for invalid status transition, 404 if order not found

---

### Inventory APIs

**PUT /api/admin/products/{productId}/variants/{variantId}/inventory**
- Purpose: Update the stock quantity for a specific product variant
- Input: New stock quantity (non-negative integer)
- Output: Updated variant with new stock quantity
- Access: ADMIN only
- Errors: 400 if quantity is negative, 404 if variant not found

---

## Constraints and Assumptions

### Hosting Constraints

1. The Backend is deployed on Render's free tier, which spins down instances after 15 minutes of inactivity. Cold start latency of up to 30 seconds is an accepted constraint.
2. The Database is hosted on Neon's free tier, which has a maximum connection limit. The Backend connection pool MUST be configured to stay within this limit (maximum 10 concurrent connections assumed).
3. The Frontend is deployed on Vercel's free tier, which has bandwidth and build minute limits. These are not expected to be exceeded under MVP traffic volumes.

### Traffic Assumptions

1. MVP traffic is assumed to be low volume: fewer than 100 concurrent users and fewer than 1,000 daily page views.
2. No CDN configuration beyond Vercel's default edge network is required for MVP.

### Payment Assumptions

1. No payment gateway is integrated in MVP. Orders are placed and recorded without payment processing.
2. Payment integration (e.g., Razorpay, Stripe) is deferred to a post-MVP phase and MUST NOT be designed into the MVP data model in a way that blocks future addition.

### Technical Assumptions

1. All monetary values are stored and displayed in a single currency (INR assumed; currency symbol configurable).
2. Image assets are hosted externally (e.g., Cloudinary, S3, or direct URLs) and referenced by URL in the database. Image upload infrastructure is out of scope for MVP.
3. Email notifications (order confirmation emails) are out of scope for MVP.
4. The Admin user account is seeded directly in the database during deployment; there is no self-service admin registration flow.

---

## Out of Scope (MVP)

The following capabilities are explicitly excluded from the MVP and deferred to future phases:

- Payment gateway integration and payment status tracking
- Subscription or recurring order management
- Product recommendation engine (collaborative filtering, ML-based)
- Advanced analytics dashboard (sales trends, revenue reports, conversion metrics)
- Multi-vendor or marketplace support
- Customer-facing order history page (deferred post-auth enhancement)
- Product reviews and ratings
- Wishlist or saved items functionality
- Discount codes, coupons, or promotional pricing
- Email or SMS notification system
- Mobile native application (iOS/Android)
- Real-time inventory sync or WebSocket-based notifications
- Internationalization (i18n) and multi-currency support
- Complex tax calculation or GST invoice generation

---

## Acceptance Criteria Summary

### Product Catalog

1. WHEN a customer visits the product listing page, THE Frontend SHALL display all active products with name, image, price, and category, rendered via SSR.
2. WHEN a customer applies a scent, mood, use-case, or price filter, THE Frontend SHALL display only products matching all applied filters.
3. WHEN a customer views a product detail page, THE Frontend SHALL display all variants with prices and stock availability.
4. WHEN a variant is out of stock, THE Frontend SHALL prevent the customer from adding it to the cart.

### Cart

5. WHEN a customer adds a product variant to the cart, THE Frontend SHALL update the cart item count and persist the cart state across page navigations within the session.
6. WHEN a customer updates a cart item quantity to zero or clicks "Remove", THE Frontend SHALL remove that item from the cart.
7. THE Frontend SHALL display an accurate cart subtotal at all times.

### Checkout and Order Placement

8. WHEN a customer submits a valid checkout form, THE Backend SHALL create an Order with status "Pending" and decrement inventory for each ordered variant.
9. WHEN an order is successfully placed, THE Frontend SHALL display an order confirmation page with the order ID.
10. IF a customer attempts to order more units than are in stock, THEN THE Backend SHALL return a validation error and THE Frontend SHALL display the stock limitation.

### Admin — Product Management

11. WHEN an admin submits a valid "Add Product" form, THE Backend SHALL persist the product and all variants and THE Frontend SHALL reflect the new product in the catalog.
12. WHEN an admin edits a product and saves, THE Backend SHALL update the product record and THE Frontend SHALL display the updated data.
13. WHEN an admin deletes a product, THE Backend SHALL soft-delete it and THE Frontend SHALL remove it from the public catalog.

### Admin — Order Management

14. WHEN an admin views the order list, THE Frontend SHALL display all orders with ID, customer name, date, total, and status.
15. WHEN an admin updates an order status, THE Backend SHALL persist the new status and THE Frontend SHALL reflect the change immediately.

### Deployment

16. THE Frontend SHALL be deployable to Vercel by running the standard Next.js build and deploy process.
17. THE Backend SHALL be deployable to Render as a Spring Boot JAR with environment variables for database connection and JWT secret.
18. THE Database SHALL be provisioned on Neon PostgreSQL and accessible to the Backend via a standard JDBC connection string.
