# Yummara — Build Progress Log

> Updated after every session. Read this before starting any new session.

---

## 2026-05-14 — Day 1 (Session 1)
### Status: Phase 0 complete → Phase 1 starting
- UI prototype complete (React 18 CDN + Babel standalone)
- All screens designed: home, cook profile, dish modal, cart, checkout, tracking
- 6 home cooks seeded with full dish menus
- **Error fixed**: `ReferenceError: SEED_COOKS` — moved declaration to top of db/index.js

---

## 2026-05-14 — Day 1 (Session 2)
### Status: Phase 1 complete — full order flow end-to-end
- Socket.io wired, placeOrder calls POST /api/orders
- CheckoutScreen: name + phone fields with validation
- TrackingScreen: driven by real socket order_update events
- cook.html + cook-dashboard.jsx: login, order cards, Accept/Cook/Ready flow, online toggle
- **Error**: EADDRINUSE — fix: `fuser -k 3001/tcp` or `pkill -f "node server.js"`

---

## 2026-05-22 — Day 2
### Status: Phase 2 complete — OTP auth, dish CRUD, customer profile
- Added users, otps, saved_addresses tables (migration-safe)
- JWT auth middleware (requireAuth / optionalAuth)
- POST /api/auth/send-otp + verify-otp (MSG91 SMS or console fallback)
- Cook dish CRUD: add/edit/delete/toggle availability
- CustomerProfileScreen: order history, saved addresses, reorder
- CookDashboard: OTP login via AuthModal, "My Menu" tab

---

## 2026-05-23 — Day 3
### Status: Vite migration complete + SMS/WhatsApp OTP + search + chat

### Vite migration
- Migrated frontend from CDN Babel to **Vite + React** (massive perf improvement)
- Removed tweaks panel (dev-only feature)
- New entry points: `src/main.jsx` (customer), `src/cook-main.jsx` (cook)
- All screens converted to ES modules with named exports
- `src/lib/NavCtx.js` — NavCtx extracted as proper ES module
- `src/lib/auth.js` — loadAuth/saveAuth/clearAuth
- `src/data/cooks.js` — cook seed data with named exports
- `useIsMobile()` hook replaces JS device toggle — reads real window.innerWidth
- Vite proxy: all `/api` and `/socket.io` calls proxied to backend:3001
  - **This means no CORS issues and only one port (5173) needs to be forwarded**
- `vite.config.js`: host:true, allowedHosts:'all' for remote access

### OTP / SMS
- MSG91 integrated (auth key + template ID in .env)
- WhatsApp Cloud API (Meta) support added — no DLT registration needed
- `DEV_OTP=true` in .env returns OTP code in API response (shown on screen in modal)
- OTP appears as "Dev mode OTP: XXXXXX" banner in the auth modal
- Priority: WhatsApp → fallback to devCode if fails

### Search
- Search bar on home page (desktop + mobile) now live-filters cooks
- Searches across: cook name, dish names, cuisine tags, area
- Chip filters (All/Open now/Veg) stack with search
- Clear (×) button resets query
- "No results" empty state shown

### Chat (two-way messaging)
- New DB tables: `conversations`, `chat_messages`
- Messages auto-pruned after 3 days
- Customer: "Message cook" button on cook profile → slide-up chat panel
  - Works logged-in or with guest name+phone
  - Real-time cook replies appear via Socket.io
- Cook: new "Messages" tab in dashboard
  - Conversation list with unread badges
  - Click to open thread, reply inline
  - Messages marked read when opened
- Socket events: `new_message` → cook room + `conv_{id}` room

### Bug fixes
- **CORS**: updated to allow both :8080 and :5173
- **Vite blocked requests**: added `allowedHosts: 'all'`
- **Input focus lost on keystroke**: DishForm was defined inside DishManagerTab
  (React recreated it as new component on every render → unmount/remount → focus lost)
  Fixed by moving DishForm to module level with props
- **Port 3001 EADDRINUSE**: use `pkill -f "node server.js"` to reliably kill
- **Disk full**: /home/jovyan was 100% full — cleared 18GB of pip cache:
  `rm -rf /home/jovyan/.cache/pip`
- **Cook login from customer page**: added "Cook login" link in nav (desktop + mobile)
- **Mobile hero missing**: added hero section to CustomerHomeMobile
- **GitHub token**: pushed to github.com/ashutoshauric-svg/yummara — token since revoked

### How to run
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

- Customer: http://localhost:5173
- Cook:     http://localhost:5173/cook.html
- Mobile sim: Chrome DevTools → Cmd+Shift+M

### OTP in dev mode
With `DEV_OTP=true` in .env, the OTP code appears directly in the sign-in modal.
No need to check the terminal.

### Cook test accounts
| Phone      | Cook      | Area            |
|------------|-----------|-----------------|
| 9900000001 | Padma     | Indiranagar     |
| 9900000002 | Rukmini   | Koramangala     |
| 9900000003 | Aarti     | HSR Sector 2    |
| 9900000004 | Lakshmi   | HSR Sector 6    |
| 9900000005 | Bhumi     | Koramangala 5th |
| 9900000006 | Krishnan  | Whitefield      |

### What's NOT done (next phases)
- [ ] Delivery partner app + live map tracking
- [ ] Real payments (Razorpay / UPI)
- [ ] Push notifications (order alerts when browser is closed)
- [ ] Cook profile editing (bio, photo, schedule)
- [ ] Multi-cook cart (currently only first cook's items sent to API)
- [ ] WhatsApp OTP template approval (currently using DEV_OTP mode)
- [ ] Real-time chat: customer side doesn't yet auto-receive cook replies via socket
      (needs socket join on conv_{id} room from customer chat panel)
