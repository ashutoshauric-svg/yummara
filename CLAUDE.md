# Yummara — Agent Context

## What is Yummara?
Yummara is a **home-cook food delivery marketplace** for Indian cities. It connects customers with verified home cooks (not restaurants). Think Swiggy/Zomato but for Padma-aunty's Tamilian thali or Rukmini's Mangalorean fish curry.

Target city: Bangalore (HSR Layout, Koramangala, Indiranagar, Whitefield).

---

## End Goal (full product)
1. Customer browses verified home cooks nearby → views menus → places order
2. Cook receives order in real-time → accepts/starts cooking → marks ready
3. Delivery partner picks up and tracks route
4. Customer pays via UPI/card/COD
5. Reviews and reorder system

**We are building incrementally. Do not build ahead of the current phase.**

---

## Current State
A complete pixel-perfect UI prototype lives in `/frontend/`. Built as a Claude Design handoff bundle using React 18 (CDN) + Babel standalone + vanilla CSS. No build step. Runs with:
```bash
cd /sfs/yummara-v1/frontend && python3 -m http.server 8080
```
All screens are already designed:
- Customer: Home feed → Cook profile → Dish modal → Cart → Checkout → Order tracking
- Cook: Landing page + Dashboard (cook.html)
- Design system canvas (colors, type, buttons, cards, etc.)

---

## MVP Scope — Phase 1 (what we are building NOW)
**No real auth. No real payments. No delivery routing.**

Exactly this:
1. Customer enters name + phone (stored in localStorage, no password, no OTP)
2. Customer browses cooks, adds to cart, places order
3. Order is saved to backend database
4. Cook logs in by phone (pre-seeded accounts, no password)
5. Cook sees incoming orders on their dashboard in real-time
6. Cook clicks Accept → customer tracking screen updates
7. Cook clicks Ready → order marked done

That is the entire Phase 1 scope. Nothing else.

---

## Build Phases (do not skip ahead)
| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Design prototype (frontend only, static data) | ✅ Done |
| 1 | Order flow: place order → cook receives → cook accepts | ✅ Done |
| 2 | Phone OTP auth (customers + cooks), JWT, cook dish CRUD, customer profile | ✅ Done |
| 3 | Delivery: partner app, live tracking | ⬜ Pending |
| 4 | Payments: Razorpay / UPI | ⬜ Pending |

---

## Tech Stack

### Frontend
- **Currently**: React 18 via CDN + Babel standalone, vanilla CSS, all JSX in `/project/`
- **Future**: Will migrate to Vite + React when backend integration makes CDN approach painful
- **Do NOT** mix Vite and Babel standalone in the same project — they conflict

### Backend (to be created at `/backend/`)
- **Runtime**: Node.js 20 + Express
- **Database**: SQLite via `better-sqlite3` (zero setup, file-based, perfect for local MVP)
- **Real-time**: Socket.io (cook dashboard ↔ customer tracking)
- **Auth (MVP)**: None. Just a phone number lookup. No JWT, no sessions for Phase 1.

### Directory layout
```
yummara-v1/
  frontend/                    # React 18 CDN app (no bundler)
    index.html                 # Customer entry point
    cook.html                  # Cook entry point
    styles.css                 # Design tokens + base styles
    assets/                    # Reference design images (ref-01..07.jpeg)
    src/
      app.jsx                  # Customer app root + routing + state
      components/
        ui.jsx                 # Icons (Ic), YButton, YBadge, YChip, Veg/NonVeg
        cards.jsx              # DishCard, CookCard, design-system card artboards
        design-canvas.jsx      # DesignCanvas, DCSection, DCArtboard
        tweaks-panel.jsx       # TweaksPanel, useTweaks — dev-only theme knobs
      screens/
        customer-home.jsx      # CustomerHomeMobile, CustomerHomeDesktop
        cook-landing.jsx       # CookLandingDesktop, CookLandingMobile (marketing)
        order-flow.jsx         # CookProfile, DishModal, CartSheet, CheckoutScreen, TrackingScreen
        cook-dashboard.jsx     # CookApp, CookLoginScreen, CookDashboardScreen, OrderCard
      data/
        cooks.jsx              # YUM_COOKS seed data, YUM_INDEX, yumFindCookByName
  backend/                     # Node.js + Express API
    server.js
    package.json
    yummara.db                 # SQLite database file
    src/
      db/index.js              # Schema creation + seeding (runs on startup)
      routes/cooks.js          # GET /api/cooks, POST /api/cooks/login
      routes/orders.js         # POST /api/orders, GET/PUT /api/orders
      socket/index.js          # Socket.io room handlers
  CLAUDE.md                    # This file
  progress.md                  # Daily build log
```

---

## Data conventions
- Currency: Indian Rupee `₹` always. Never use `$` or USD.
- Design tokens in `styles.css` (`--yum-primary`, `--yum-cream`, `--yum-border`, etc.) must be preserved.
- Prototype seed data (6 cooks, all dishes) is the starting DB seed.
- Cook IDs are strings: `padma`, `rukmini`, `aarti`, `lakshmi`, `bhumi`, `krishnan`
- Dish IDs follow `{cook-short}-{n}`: `pad-1`, `ruk-3`, `lak-6`, etc.
- All timestamps: ISO 8601 UTC stored, display in IST

## API design (Phase 1 + 2)
```
POST   /api/auth/send-otp          — send OTP (body: phone, role=customer|cook)
POST   /api/auth/verify-otp        — verify OTP → returns JWT + user/cook

GET    /api/cooks                  — list all cooks
GET    /api/cooks/:id              — single cook + dishes
POST   /api/cooks/login            — legacy (Phase 1); use /api/auth/* for Phase 2+
PUT    /api/cooks/:id/online       — toggle cook online/offline

POST   /api/orders                 — customer places order (optional JWT)
GET    /api/orders?cookId=X        — cook fetches their pending orders
GET    /api/orders/:id             — single order
PUT    /api/orders/:id/status      — cook updates status (accepted|cooking|ready|cancelled)

GET    /api/user/profile           — customer profile (JWT required)
PUT    /api/user/profile           — update name (JWT required)
GET    /api/user/orders            — order history (JWT required)
GET    /api/user/addresses         — saved addresses (JWT required)
POST   /api/user/addresses         — add address (JWT required)
PUT    /api/user/addresses/:id     — update address (JWT required)
DELETE /api/user/addresses/:id     — delete address (JWT required)

POST   /api/dishes                 — cook adds dish (JWT required, cook only)
PUT    /api/dishes/:id             — cook edits dish (JWT required, own dish)
DELETE /api/dishes/:id             — cook deletes dish (JWT required, own dish)
PUT    /api/dishes/:id/available   — toggle dish availability (JWT required, own dish)
```

Socket.io events:
- `new_order`     — server → cook room when a new order arrives
- `order_update`  — server → customer when cook changes order status

## Auth conventions
- JWT tokens expire in 7 days, stored in `localStorage` under key `yum_auth`
- `window.YUM_AUTH` mirrors localStorage on page load (set by auth.jsx)
- Payload: `{ sub: userId|cookId, role: 'customer'|'cook', phone }`
- OTP: 6 digits, 10-minute expiry, previous unused OTPs invalidated on new request
- Dev mode: if MSG91_AUTH_KEY is empty in .env, OTP prints to server console

---

## Directory layout (updated for Phase 2)
```
yummara-v1/
  frontend/
    index.html          # Customer app — script load order is the "import graph"
    cook.html           # Cook app
    styles.css
    src/
      app.jsx           # Customer app root; authUser state, NavCtx provider
      components/
        ui.jsx          # Ic, YButton, YBadge, YChip, Veg/NonVeg, YumLogo
        cards.jsx
        design-canvas.jsx
        tweaks-panel.jsx
      screens/
        auth.jsx             # AuthModal (phone OTP, works for customer+cook), window.YUM_AUTH
        customer-home.jsx    # CustomerHomeMobile, CustomerHomeDesktop, CustomerNav
        customer-profile.jsx # CustomerProfileScreen — orders, addresses, reorder
        cook-landing.jsx
        cook-dashboard.jsx   # CookApp, CookLoginScreen→AuthModal, CookDashboardScreen, DishManagerTab
        order-flow.jsx       # CookProfile, DishModal, CartSheet, CheckoutScreen, TrackingScreen
      data/
        cooks.jsx            # YUM_COOKS prototype data (frontend fallback / design system)
  backend/
    server.js
    .env                     # JWT_SECRET, MSG91 keys, PORT
    package.json
    yummara.db
    src/
      db/index.js            # Tables: cooks, dishes, orders, order_items, users, otps, saved_addresses
      middleware/
        auth.js              # requireAuth, optionalAuth (JWT verify)
      routes/
        auth.js              # POST /api/auth/send-otp, POST /api/auth/verify-otp
        cooks.js             # GET /api/cooks, GET /api/cooks/:id, etc.
        orders.js
        users.js             # GET/PUT /api/user/profile, orders, addresses CRUD
        dishes.js            # Cook dish CRUD (JWT-protected)
      socket/index.js
```

## Known errors / things to avoid
- **CORS**: The frontend (port 8080) calls backend (port 3001). Always set `cors({ origin: 'http://localhost:8080' })` in Express.
- **file:// protocol**: Never open the CDN prototype via `file://` — Babel standalone can't load cross-origin JSX. Always use `python3 -m http.server`.
- **Window globals**: The prototype exposes components via `Object.assign(window, {...})`. This is intentional — Babel standalone doesn't support ES modules. Don't refactor this unless migrating fully to Vite.
- **better-sqlite3 vs sqlite3**: Use `better-sqlite3` (synchronous, simpler). Do not use the async `sqlite3` package — it adds unnecessary callback complexity for a local MVP.
- **Socket.io version**: Use socket.io v4. v2/v3 have breaking API changes.

---

## Cook seed data (Phase 1 pre-seeded accounts)
| cookId     | Name              | Phone (dummy) | Area          |
|------------|-------------------|---------------|---------------|
| padma      | Padma Sundaram    | 9900000001    | Indiranagar   |
| rukmini    | Rukmini D'Souza   | 9900000002    | Koramangala   |
| aarti      | Aarti Bisht       | 9900000003    | HSR Sector 2  |
| lakshmi    | Lakshmi Iyer      | 9900000004    | HSR Sector 6  |
| bhumi      | Bhumi Patel       | 9900000005    | Koramangala 5th|
| krishnan   | Krishnan Pillai   | 9900000006    | Whitefield    |

To log in as a cook in Phase 1: enter the phone number above, no password.
