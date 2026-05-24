# Yummara — Build Progress Log

> Updated daily. Agents: read this before starting any session. It tells you what phase we're in, what was last done, and what errors to avoid repeating.

---

## 2026-05-14 — Day 1

### Status: Phase 0 complete → Phase 1 starting

### What exists
- `/project/` — complete UI prototype (React 18 CDN + Babel standalone)
- All screens designed and clickable: home, cook profile, dish modal, cart, checkout, tracking, design system
- 6 home cooks seeded in prototype data with full dish menus
- Tweaks panel: persona toggle (customer/cook), device (desktop/mobile), theme customization

### How to run the frontend right now
```bash
cd /sfs/yummara-v1/frontend
python3 -m http.server 8080
# open http://localhost:8080
```

### What is NOT built yet (Phase 1 TODO)
- [ ] Backend: Node.js + Express server at `/backend/`
- [ ] SQLite database with cooks + dishes seed data
- [ ] `POST /api/orders` — save order from frontend
- [ ] `GET /api/orders?cookId=X` — cook fetches their orders
- [ ] `PUT /api/orders/:id/status` — cook updates status
- [ ] Socket.io: `new_order` event to cook, `order_update` event to customer
- [ ] Cook dashboard screen (new screen — not in prototype)
- [ ] Frontend: wire "Place order" button to call API instead of static mock
- [ ] Frontend: wire tracking screen to poll/subscribe to real order status

### Errors encountered so far
- **Error**: `ReferenceError: Cannot access 'SEED_COOKS' before initialization` in `src/db/index.js`
  **Cause**: `const SEED_COOKS` was declared after the code that uses it (hoisting doesn't apply to `const`)
  **Fix**: Move `SEED_COOKS` declaration to the top of the file, before the DB is opened
  **File**: `backend/src/db/index.js`

### Decisions made today
- Stack: Node.js + Express + SQLite (better-sqlite3) + Socket.io v4
- No auth in Phase 1 — cook logs in by phone number only (pre-seeded), customer just enters name
- Keep CDN frontend for now; migrate to Vite only when it becomes painful
- CORS: frontend on :8080, backend on :3001

---

---

## 2026-05-14 — Day 1 (Session 2)

### Status: Phase 1 complete — full order flow working end-to-end

### Done today
- Added Socket.io CDN to `index.html`
- Wired `placeOrder` in `app.jsx` to `POST /api/orders` (async), adds socket listener for `order_update`
- Added customer name + phone fields to `CheckoutScreen` (Block "00 · Your details") with 10-digit validation
- Replaced auto-advancing `setTimeout` stage in `TrackingScreen` with `statusToStage` map driven by real `order.status` from socket
- Created `cook.html` — separate entry point for cook-side app
- Created `yummara-cook-dashboard.jsx` — full cook app:
  - Login screen (phone-only, no password, shows test account numbers as clickable shortcuts)
  - Dashboard: stats row (pending / active / done today / earnings), order cards by section
  - OrderCard: shows items, totals, action buttons (Accept → Start cooking → Mark ready)
  - Real-time: Socket.io `join_cook` room, `new_order` event adds orders live
  - Online/Offline toggle with API call
  - Logout with socket disconnect

### How to run everything
```bash
# Terminal 1 — backend
cd /sfs/yummara-v1/backend && node server.js

# Terminal 2 — frontend
cd /sfs/yummara-v1/frontend && python3 -m http.server 8080

# Customer app: http://localhost:8080
# Cook app:     http://localhost:8080/cook.html
```

### Errors hit today
- **Error**: `listen EADDRINUSE :::3001` when starting backend a second time
  **Cause**: previous server process still running in background
  **Fix**: `fuser -k 3001/tcp` to free the port before restarting
  **Not a code bug** — just a dev workflow issue

### Cook test accounts (Phase 1)
| Phone      | Cook          |
|------------|---------------|
| 9900000001 | Padma         |
| 9900000002 | Rukmini       |
| 9900000004 | Lakshmi       |

### What's NOT done (next phase)
- Multi-cook cart support (currently only first cook's items are sent to API; Phase 1 scope)
- Cook dashboard: pull-to-refresh / auto-refresh button
- Customer: persist cart across page reload
- Customer: show order ID on tracking screen as a link or confirmation

---

---

## 2026-05-22 — Day 2

### Status: Phase 2 complete — OTP auth, cook dish CRUD, customer profile

### Done today
- Added `users`, `otps`, `saved_addresses` tables to SQLite schema (migration-safe ALTER TABLE)
- Created `backend/src/middleware/auth.js` — `requireAuth` / `optionalAuth` JWT middleware
- Created `backend/src/routes/auth.js` — `POST /api/auth/send-otp` + `POST /api/auth/verify-otp`
  - OTP: 6-digit, 10-min expiry, previous OTPs invalidated
  - SMS via MSG91; console fallback when MSG91_AUTH_KEY not set (dev mode)
  - `role=cook` validates phone is a registered cook before sending OTP
  - Returns JWT (7-day, `{ sub, role, phone }`) + user/cook record
- Created `backend/src/routes/users.js` — profile, order history, saved addresses CRUD
- Created `backend/src/routes/dishes.js` — cook dish add/edit/delete/toggle availability
- Updated `backend/server.js` — dotenv, new routes, CORS `allowedHeaders` for Authorization
- Created `frontend/src/screens/auth.jsx` — `AuthModal` (phone → OTP → JWT), `window.YUM_AUTH`, `loadAuth`/`saveAuth`/`clearAuth`
- Updated `frontend/src/screens/customer-home.jsx` — `CustomerNav` wired to NavCtx (real cart count, Sign In / profile avatar button)
- Updated `frontend/src/screens/order-flow.jsx` — `CheckoutScreen` pre-fills name/phone from authUser
- Updated `frontend/src/app.jsx` — `authUser` state, `openAuth`/`logout`, AuthModal overlay, profile screen route, passes token in `placeOrder`
- Created `frontend/src/screens/customer-profile.jsx` — order history, saved addresses CRUD, reorder button, sign out
- Updated `frontend/src/screens/cook-dashboard.jsx` — OTP login via `AuthModal`, "My Menu" tab with full dish CRUD (add/edit/delete/availability toggle), JWT token in API calls
- Updated `index.html` + `cook.html` — added auth.jsx and customer-profile.jsx script tags

### How to run everything
```bash
# Terminal 1 — backend
cd /sfs/yummara-v1/backend
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
node server.js

# Terminal 2 — frontend
cd /sfs/yummara-v1/frontend && python3 -m http.server 8080

# Customer app: http://localhost:8080
# Cook app:     http://localhost:8080/cook.html
```

### How to test OTP in dev mode
OTP is printed to the **server console** when MSG91_AUTH_KEY is empty.
Look for: `[OTP] Phone: 9900000001  Code: 123456`

### Errors hit today
- None new. Ensured no duplicate SEED_COOKS blocks remain in db/index.js.

### Cook test accounts (Phase 2)
All 6 cooks can log in via OTP. Use phone numbers from the seeded cooks table.
| Phone      | Cook          |
|------------|---------------|
| 9900000001 | Padma         |
| 9900000002 | Rukmini       |
| 9900000003 | Aarti         |
| 9900000004 | Lakshmi       |
| 9900000005 | Bhumi         |
| 9900000006 | Krishnan      |

### What's NOT done (next phase)
- Delivery partner app + live map tracking
- Real payment processing (Razorpay)
- Push notifications (order alerts to cook without open browser tab)
- Multi-cook cart: currently only first cook's items go to API
- Cook profile editing (bio, schedule, languages, photo)

---

## Template for future entries

### YYYY-MM-DD — Day N

**Phase**: X  
**Session goal**: what we tried to build today

**Done**:
- 

**Errors hit**:
- Error: [description] | Fix: [what fixed it] | File: [where]

**Blocked on**:
- 

**Next session start from**:
- 
