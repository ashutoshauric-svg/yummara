# Yummara — Agent Context

## What is Yummara?
Yummara is a **home-cook food delivery marketplace** for Indian cities. Connects customers with verified home cooks (not restaurants). Think Swiggy/Zomato but for Padma-aunty's Tamilian thali or Rukmini's Mangalorean fish curry.

Target city: Bangalore (HSR Layout, Koramangala, Indiranagar, Whitefield).

---

## How to run (always do this first)

```bash
# Terminal 1 — backend
cd /sfs/yummara-v1/backend
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
pkill -f "node server.js" 2>/dev/null; sleep 1; node server.js

# Terminal 2 — frontend
cd /sfs/yummara-v1/frontend
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npm run dev
```

- Customer app: http://localhost:5173
- Cook dashboard: http://localhost:5173/cook.html
- Mobile view: Chrome DevTools → Cmd+Shift+M (or Ctrl+Shift+M)

**NVM is required** — `node` is not in PATH without it.

**Port 3001 busy?** Run: `pkill -f "node server.js"`

**Disk full?** Clear pip cache: `rm -rf /home/jovyan/.cache/pip`

---

## Build Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Design prototype (frontend only, static data) | ✅ Done |
| 1 | Order flow: place → cook receives → cook accepts | ✅ Done |
| 2 | Phone OTP auth, JWT, cook dish CRUD, customer profile | ✅ Done |
| 2.5 | Vite migration, search, WhatsApp OTP, two-way chat | ✅ Done |
| 3 | Cook registration, cook profile, Borzo delivery dispatch | ✅ Done |
| 4 | Real OTP (Fast2SMS/WhatsApp), Payments (Razorpay/UPI) | ⬜ Pending |

---

## Tech Stack

### Frontend — Vite + React 18
- **Entry points**: `src/main.jsx` (customer), `src/cook-main.jsx` (cook)
- **Port**: 5173 (Vite dev server)
- **Proxy**: `/api/*` and `/socket.io` proxied to `localhost:3001` (see vite.config.js)
  - This means the frontend never calls `localhost:3001` directly — always relative `/api/...`
- **Responsive**: `useIsMobile()` hook in App.jsx (< 768px = mobile layout)

### Backend — Node.js + Express + SQLite
- **Port**: 3001
- **Database**: `better-sqlite3` (synchronous), file at `backend/yummara.db`
- **Auth**: JWT (7-day), stored in localStorage as `yum_auth`
- **Real-time**: Socket.io v4
- **OTP**: WhatsApp Cloud API (Meta) → fallback devCode in response if fails
- **CORS**: allows localhost:5173 and localhost:8080

---

## Directory Layout

```
yummara-v1/
  frontend/
    index.html                  # Customer app entry
    cook.html                   # Cook app entry
    styles.css                  # Design tokens + base styles
    vite.config.js              # Vite config — proxy, host, allowedHosts
    package.json
    src/
      main.jsx                  # ReactDOM.createRoot → <App/>
      cook-main.jsx             # ReactDOM.createRoot → <CookApp/>
      App.jsx                   # Customer app: routing, cart state, NavCtx.Provider
      lib/
        NavCtx.js               # React context for nav + cart + auth
        auth.js                 # loadAuth / saveAuth / clearAuth (localStorage)
      data/
        cooks.js                # YUM_COOKS, YUM_INDEX, yumFindCookByName, yumFindDish
      components/
        ui.jsx                  # Ic, YButton, YBadge, YChip, YImg, Veg, NonVeg, Spinner
        cards.jsx               # CookCard, DishCard
      screens/
        Auth.jsx                # AuthModal (phone OTP flow, customer + cook)
        CustomerHome.jsx        # CustomerHomeDesktop, CustomerHomeMobile
        CustomerProfile.jsx     # Order history, saved addresses, reorder
        OrderFlow.jsx           # CookProfile, DishModal, CartSheet, CheckoutScreen, TrackingScreen
        CookDashboard.jsx       # CookApp, CookDashboardScreen, DishManagerTab, DishForm
        Chat.jsx                # CustomerChatPanel, CookInbox
  backend/
    server.js                   # Express app, Socket.io, route mounting
    .env                        # Secrets — never commit (see .env.example)
    .env.example                # Template for required env vars
    yummara.db                  # SQLite database (gitignored)
    src/
      db/index.js               # Schema + seeding (runs on startup)
      middleware/auth.js        # requireAuth, optionalAuth (JWT)
      routes/
        auth.js                 # POST /api/auth/send-otp, verify-otp
        cooks.js                # GET /api/cooks, GET /api/cooks/:id, online toggle
        orders.js               # POST /api/orders, GET, PUT status
        users.js                # Profile, order history, addresses
        dishes.js               # Cook dish CRUD
        chat.js                 # Conversations + messages (two-way)
      socket/index.js           # Socket.io event handlers
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| cooks | Cook profiles (seeded + self-registered). Has `address` (Borzo pickup) and `status` columns |
| dishes | Cook menus (editable by cooks) |
| orders | Customer orders |
| order_items | Line items per order |
| users | Customer accounts (created on first OTP verify) |
| otps | 6-digit codes, 10-min expiry |
| saved_addresses | Customer delivery addresses |
| conversations | Chat threads (cook_id + user_phone, unique) |
| chat_messages | Individual messages, pruned after 3 days |
| pending_cook_registrations | Temp storage for cook signup data while OTP is pending. Deleted on verify. |
| deliveries | Borzo delivery per order: borzo_order_id, status, rider_name, rider_phone, price |

---

## API Reference

```
# Auth
POST   /api/auth/send-otp              body: { phone, role }         role=customer|cook
POST   /api/auth/verify-otp            body: { phone, code, role }   role=customer|cook|cook-register
POST   /api/auth/cook-register         body: { phone, name, area, address, tags, bio, ... }

# Cooks
GET    /api/cooks
GET    /api/cooks/:id
PUT    /api/cooks/:id/online           JWT cook

# Orders
POST   /api/orders                     optional JWT customer
GET    /api/orders?cookId=X
PUT    /api/orders/:id/status          JWT cook

# Customer
GET    /api/user/profile               JWT customer
PUT    /api/user/profile
GET    /api/user/orders
GET/POST /api/user/addresses
PUT/DELETE /api/user/addresses/:id

# Cooks
GET    /api/cooks
GET    /api/cooks/:id
PUT    /api/cooks/profile              JWT cook — edit bio, area, address, tags, schedule, min_order
PUT    /api/cooks/:id/online           JWT cook

# Dishes
POST   /api/dishes                     JWT cook
PUT    /api/dishes/:id                 JWT cook (own dish)
DELETE /api/dishes/:id                 JWT cook (own dish)
PUT    /api/dishes/:id/available       JWT cook

# Chat
POST   /api/chat/:cookId               customer sends message (no auth, needs user_phone)
GET    /api/chat/conversations         JWT cook — inbox
GET    /api/chat/conversations/:id     JWT cook — thread + marks read
POST   /api/chat/conversations/:id/reply  JWT cook — reply
GET    /api/chat/customer/:cookId?user_phone=X  customer fetches their thread

# Delivery (Borzo)
POST   /api/delivery/dispatch/:orderId JWT cook — creates Borzo order (order must be 'ready')
GET    /api/delivery/:orderId          get delivery status + rider info for an order
POST   /api/delivery/webhook           Borzo calls this on status changes (register URL in Borzo dashboard)
POST   /api/delivery/estimate          JWT — price estimate { cook_address, customer_address }
```

## Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_cook` | client → server | cookId |
| `join_order` | client → server | orderId |
| `new_order` | server → cook room | order object |
| `order_update` | server → order room | { id, status } |
| `new_message` | server → cook room + conv room | { conversation_id, message } |

---

## Auth Conventions
- JWT: 7-day expiry, stored in localStorage key `yum_auth`
- Payload: `{ sub: userId|cookId, role: 'customer'|'cook', phone }`
- OTP: 6 digits, 10-min expiry, previous unused OTPs invalidated on new request
- `DEV_OTP=true` in .env → OTP returned in API response as `devCode`, shown in modal

---

## .env Variables

```
JWT_SECRET=                    # Change before production
PORT=3001
WHATSAPP_TOKEN=                # Meta WhatsApp Cloud API token
WHATSAPP_PHONE_NUMBER_ID=      # Meta phone number ID
WHATSAPP_TEMPLATE_NAME=yummara_otp
MSG91_AUTH_KEY=                # Fallback SMS (DLT registration needed for delivery)
MSG91_SENDER_ID=YUMMARA
MSG91_TEMPLATE_ID=
DEV_OTP=true                   # Remove in production — shows OTP on screen
BORZO_TOKEN=                   # From Borzo Personal Cabinet (test or prod)
BORZO_TEST=true                # true = sandbox API, false = live API
CORS_ORIGINS=                  # Comma-separated: https://yummara-iota.vercel.app,http://localhost:5173
DB_PATH=                       # Railway: /data/yummara.db  |  local: unset (uses backend/yummara.db)
```

---

## Cook Seed Accounts

| cookId | Name | Phone | Area |
|--------|------|-------|------|
| padma | Padma Sundaram | 9900000001 | Indiranagar |
| rukmini | Rukmini D'Souza | 9900000002 | Koramangala |
| aarti | Aarti Bisht | 9900000003 | HSR Sector 2 |
| lakshmi | Lakshmi Iyer | 9900000004 | HSR Sector 6 |
| bhumi | Bhumi Patel | 9900000005 | Koramangala 5th |
| krishnan | Krishnan Pillai | 9900000006 | Whitefield |

---

## Cook Registration Flow
1. Cook visits cook.html → clicks "Register as a new cook"
2. Fills form: name, phone, area, address, cuisine tags, bio
3. `POST /api/auth/cook-register` → stores in `pending_cook_registrations`, sends OTP
4. Enters OTP → `POST /api/auth/verify-otp` with `role=cook-register`
5. Cook account created with auto-generated ID (slugified from name), status='active'
6. JWT returned → logged into dashboard

Cook ID is slugified from name: "Priya Sharma" → "priyasharma". Suffix added if collision.

## Borzo Delivery Flow
1. Cook accepts order → cooks → marks "Ready"
2. "Dispatch Rider" button appears in OrderCard
3. Cook must have `address` set in Profile tab (shown as warning if missing)
4. Order must have customer `address` (set at checkout)
5. `POST /api/delivery/dispatch/:orderId` → Borzo creates order → stores in `deliveries`
6. Borzo webhook `POST /api/delivery/webhook` receives status updates → updates rider info
7. Customer tracking screen can poll `GET /api/delivery/:orderId` for rider name/phone
8. Register webhook URL in Borzo dashboard: `https://yummara-production.up.railway.app/api/delivery/webhook`

## Known Gotchas / Things to Avoid

- **Never call `localhost:3001` directly from frontend** — always use relative `/api/...` paths. Vite proxies them. Direct calls break in remote dev environments.
- **NVM required** — always source NVM before running node/npm commands
- **DishForm must stay at module level** — defining it inside DishManagerTab caused focus loss on every keystroke (React unmounts/remounts inline component definitions on each render)
- **`better-sqlite3` is synchronous** — don't use async/await with db calls, they return directly
- **Socket.io v4** — don't downgrade, v2/v3 have breaking API differences
- **CORS**: allowed origins are `['http://localhost:5173', 'http://localhost:8080']` in server.js
- **MSG91 returns success even when DLT blocks delivery** — use DEV_OTP=true or WhatsApp for testing
- **Old CDN files** (`src/screens/auth.jsx`, `cook-dashboard.jsx` etc.) still exist but are unused — Vite uses the PascalCase versions (`Auth.jsx`, `CookDashboard.jsx`)
