const Database = require('better-sqlite3');
const path = require('path');

// ── Seed data (mirrors prototype) — declared first so seeding block can use it ─
const SEED_COOKS = [
  {
    id: 'padma', name: 'Padma Sundaram', short: 'Padma', phone: '9900000001',
    area: 'Indiranagar', distance: '1.2 km', tags: 'South Indian · Tamil · Tiffin',
    rating: 4.9, count: 312, prepTime: '25–35 min', tone: 'warm', online: true,
    languages: 'Tamil · English · Kannada', schedule: 'Mon–Sat · 6am–9pm', minOrder: 95,
    bio: "I cook the way my paati did — every morning I grind sambhar masala fresh, and the tamarind comes from my brother's farm in Theni.",
    dishes: [
      { id: 'pad-1', name: 'Bisi Bele Bath',          subtitle: 'With aloo bonda + curd. Recipe from Mysore.', price: 145, tone: 'warm',  veg: true,  tag: 'reorder' },
      { id: 'pad-2', name: 'Tamilian Thali',          subtitle: 'Rice, sambar, rasam, kootu, poriyal, payasam', price: 245, tone: 'warm',  veg: true,  tag: 'highly' },
      { id: 'pad-3', name: 'Curd Rice + Pickle',      subtitle: 'Pongal-style, with kothavarangai', price: 95,  tone: 'warm',  veg: true,  tag: null },
      { id: 'pad-4', name: 'Vendakkai Puli Kuzhambu', subtitle: 'Tamarind okra · ghee rice on the side', price: 165, tone: 'clay', veg: true,  tag: null },
      { id: 'pad-5', name: 'Lemon Rice',              subtitle: 'Iyer-style, with peanuts + curry leaves', price: 110, tone: 'warm',  veg: true,  tag: null },
      { id: 'pad-6', name: 'Rasam Sadham',            subtitle: 'Pepper rasam, papad, curd · soulful', price: 85,  tone: 'warm',  veg: true,  tag: null },
      { id: 'pad-7', name: 'Avalakki Upma',           subtitle: 'With grated coconut and curry leaves', price: 95,  tone: 'green', veg: true,  tag: null },
      { id: 'pad-8', name: 'Filter Coffee · 200ml',   subtitle: 'Mysore filter brew, frothed with sugar', price: 40,  tone: 'warm',  veg: true,  tag: null },
    ],
  },
  {
    id: 'rukmini', name: "Rukmini D'Souza", short: 'Rukmini', phone: '9900000002',
    area: 'Koramangala', distance: '0.8 km', tags: 'Mangalorean · Coastal',
    rating: 4.7, count: 178, prepTime: '35–45 min', tone: 'green', online: true,
    languages: 'Konkani · English', schedule: 'Tue–Sun · 11am–9pm', minOrder: 150,
    bio: "Mangalore coast on a plate. I cure my own seafood masala, source neer dosa rice from Udupi.",
    dishes: [
      { id: 'ruk-1', name: 'Neer Dosa Combo',         subtitle: '3 dosas + chicken sukka', price: 220, tone: 'clay',  veg: false, tag: 'reorder' },
      { id: 'ruk-2', name: 'Mangalorean Fish Curry',  subtitle: 'Anjal in coconut + kokum', price: 280, tone: 'clay',  veg: false, tag: null },
      { id: 'ruk-3', name: 'Chicken Ghee Roast',      subtitle: 'Slow-cooked, blistered chillies', price: 290, tone: 'clay',  veg: false, tag: 'highly' },
      { id: 'ruk-4', name: 'Kori Rotti',              subtitle: 'Crisp rice wafers, red chicken gravy', price: 240, tone: 'clay',  veg: false, tag: null },
      { id: 'ruk-5', name: 'Goli Baje · 8 pcs',       subtitle: 'Mangalore bondas, coconut chutney', price: 110, tone: 'warm',  veg: true,  tag: null },
      { id: 'ruk-6', name: 'Prawn Sukka',             subtitle: 'Dry coconut masala, neer dosa side', price: 320, tone: 'clay',  veg: false, tag: null },
    ],
  },
  {
    id: 'aarti', name: 'Aarti Bisht', short: 'Aarti', phone: '9900000003',
    area: 'HSR Sector 2', distance: '1.6 km', tags: 'Pahadi · Garhwali',
    rating: 4.8, count: 92, prepTime: '30–40 min', tone: 'clay', online: false,
    languages: 'Garhwali · Hindi · English', schedule: 'Mon · Wed · Fri · Sat', minOrder: 140,
    bio: "Garhwal in a tiffin. Madua flour from my village in Pauri, jhangora I husk myself.",
    dishes: [
      { id: 'aar-1', name: 'Garhwali Thali',          subtitle: 'Madua roti, kafuli, jhangora kheer', price: 285, tone: 'green', veg: true,  tag: 'highly' },
      { id: 'aar-2', name: 'Kafuli',                  subtitle: 'Spinach-fenugreek gravy, rice', price: 140, tone: 'green', veg: true,  tag: null },
      { id: 'aar-3', name: 'Madua Roti · 4 pcs',      subtitle: 'Finger millet flour, ghee', price: 85,  tone: 'warm',  veg: true,  tag: null },
      { id: 'aar-4', name: 'Bhang ki Chutney',        subtitle: 'Hemp seed, mint, lemon · side', price: 60,  tone: 'green', veg: true,  tag: null },
      { id: 'aar-5', name: 'Jhangora Kheer',          subtitle: 'Barnyard millet, jaggery, almonds', price: 110, tone: 'warm',  veg: true,  tag: null },
      { id: 'aar-6', name: 'Rajma Chawal Box',        subtitle: 'Kashmiri rajma, jeera rice, ghee', price: 160, tone: 'warm',  veg: true,  tag: null },
    ],
  },
  {
    id: 'lakshmi', name: 'Lakshmi Iyer', short: 'Lakshmi', phone: '9900000004',
    area: 'HSR Sector 6', distance: '1.0 km', tags: 'Tam Brahm · Iyer · Tiffin',
    rating: 4.9, count: 401, prepTime: '20–30 min', tone: 'warm', online: true,
    languages: 'Tamil · English', schedule: 'Daily · 6am–9pm', minOrder: 85,
    bio: "Iyer kitchen, no compromises. No onion, no garlic, no shortcuts. Pongal at 6am, curd rice by 1pm.",
    dishes: [
      { id: 'lak-1', name: 'Pongal + Vada',           subtitle: '2 vadas, sambhar, coconut chutney', price: 120, tone: 'warm',  veg: true,  tag: 'reorder' },
      { id: 'lak-2', name: 'Curd Rice + Pickle',      subtitle: 'Pongal-style, with kothavarangai',   price: 95,  tone: 'warm',  veg: true,  tag: null },
      { id: 'lak-3', name: 'Sambar Rice',             subtitle: 'Tuvar dal, drumstick, ghee',         price: 130, tone: 'warm',  veg: true,  tag: null },
      { id: 'lak-4', name: 'Rasam Rice',              subtitle: 'Pepper-cumin rasam, papad',          price: 110, tone: 'warm',  veg: true,  tag: null },
      { id: 'lak-5', name: 'Mor Kuzhambu',            subtitle: 'Buttermilk gravy, ash gourd',        price: 145, tone: 'green', veg: true,  tag: null },
      { id: 'lak-6', name: 'Filter Coffee · 200ml',   subtitle: 'Steel tumbler, decoction-strong',    price: 40,  tone: 'warm',  veg: true,  tag: null },
    ],
  },
  {
    id: 'bhumi', name: 'Bhumi Patel', short: 'Bhumi', phone: '9900000005',
    area: 'Koramangala 5th', distance: '1.3 km', tags: 'Gujarati · Sattvik',
    rating: 5.0, count: 4, prepTime: '30–40 min', tone: 'green', online: true,
    languages: 'Gujarati · Hindi · English', schedule: 'Mon–Fri · 11am–8pm', minOrder: 120,
    bio: "Bhavnagar daughter cooking out of her Koramangala flat. Theplas rolled at 5am, dhokla steamed by 8.",
    dishes: [
      { id: 'bhu-1', name: 'Methi Thepla Box',        subtitle: '6 theplas, dahi, mango chunda', price: 165, tone: 'green', veg: true,  tag: 'new' },
      { id: 'bhu-2', name: 'Egg Curry + 4 Roti',      subtitle: 'Bengali jhol style',            price: 180, tone: 'clay',  veg: false, tag: null },
      { id: 'bhu-3', name: 'Dhokla',                  subtitle: '12 pieces, steamed fresh, chutney', price: 140, tone: 'green', veg: true,  tag: 'new' },
      { id: 'bhu-4', name: 'Khichdi + Kadhi',         subtitle: 'Gujarati comfort, ghee on top',  price: 120, tone: 'warm',  veg: true,  tag: null },
      { id: 'bhu-5', name: 'Undhiyu · Limited',       subtitle: 'Winter special · valor papdi',   price: 245, tone: 'green', veg: true,  tag: 'new' },
    ],
  },
  {
    id: 'krishnan', name: 'Krishnan Pillai', short: 'Krishnan', phone: '9900000006',
    area: 'Whitefield', distance: '4.1 km', tags: 'Kerala · Sadhya',
    rating: 5.0, count: 2, prepTime: '45–60 min', tone: 'warm', online: true,
    languages: 'Malayalam · English · Hindi', schedule: 'Thu–Sun · 12pm–8pm', minOrder: 180,
    bio: "Palakkad kitchen, in Whitefield. I cook a full sadhya every Onam. Coconut oil is non-negotiable.",
    dishes: [
      { id: 'kri-1', name: 'Onam Sadhya Mini',        subtitle: '8-item leaf meal · banana on request', price: 320, tone: 'green', veg: true,  tag: 'new' },
      { id: 'kri-2', name: 'Avial',                   subtitle: 'Coconut-curd, mixed vegetables',       price: 180, tone: 'green', veg: true,  tag: null },
      { id: 'kri-3', name: 'Kerala Fish Moilee',      subtitle: 'Karimeen, coconut milk, kokum',        price: 295, tone: 'clay',  veg: false, tag: 'new' },
      { id: 'kri-4', name: 'Puttu + Kadala',          subtitle: 'Steamed rice cylinder, black chickpea curry', price: 160, tone: 'warm', veg: true, tag: null },
    ],
  },
];

// DB_PATH env var lets Railway (or any host) point to a persistent volume
// e.g. DB_PATH=/data/yummara.db on Railway, unset = local dev default
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../yummara.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS cooks (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    short       TEXT NOT NULL,
    phone       TEXT UNIQUE NOT NULL,
    area        TEXT NOT NULL,
    distance    TEXT,
    tags        TEXT,
    rating      REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    prep_time   TEXT,
    tone        TEXT,
    online      INTEGER DEFAULT 1,
    fssai       INTEGER DEFAULT 1,
    languages   TEXT,
    bio         TEXT,
    schedule    TEXT,
    min_order   INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS dishes (
    id          TEXT PRIMARY KEY,
    cook_id     TEXT NOT NULL REFERENCES cooks(id),
    name        TEXT NOT NULL,
    subtitle    TEXT,
    price       INTEGER NOT NULL,
    tone        TEXT,
    veg         INTEGER DEFAULT 1,
    tag         TEXT,
    available   INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    cook_id     TEXT NOT NULL REFERENCES cooks(id),
    status      TEXT NOT NULL DEFAULT 'pending',
    total       INTEGER NOT NULL,
    tip         INTEGER DEFAULT 0,
    address     TEXT,
    placed_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    dish_id     TEXT NOT NULL REFERENCES dishes(id),
    qty         INTEGER NOT NULL,
    unit_price  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phone       TEXT UNIQUE NOT NULL,
    name        TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS otps (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    phone       TEXT NOT NULL,
    code        TEXT NOT NULL,
    expires_at  TEXT NOT NULL,
    used        INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saved_addresses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    label       TEXT NOT NULL DEFAULT 'Home',
    address     TEXT NOT NULL,
    is_default  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Chat tables
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    cook_id         TEXT NOT NULL REFERENCES cooks(id),
    user_phone      TEXT NOT NULL,
    user_name       TEXT,
    last_message_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(cook_id, user_phone)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    sender          TEXT NOT NULL CHECK(sender IN ('customer','cook')),
    body            TEXT NOT NULL,
    read            INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migrate: add user_id to orders if it doesn't exist yet
try { db.exec('ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id)'); } catch (_) {}
// Migrate: add photo_url to dishes if it doesn't exist yet
try { db.exec('ALTER TABLE dishes ADD COLUMN photo_url TEXT'); } catch (_) {}

// Seed cooks and dishes if empty
const cookCount = db.prepare('SELECT COUNT(*) as n FROM cooks').get().n;
if (cookCount === 0) {
  const insertCook = db.prepare(`
    INSERT INTO cooks (id, name, short, phone, area, distance, tags, rating, review_count, prep_time, tone, online, fssai, languages, bio, schedule, min_order)
    VALUES (@id, @name, @short, @phone, @area, @distance, @tags, @rating, @review_count, @prep_time, @tone, @online, @fssai, @languages, @bio, @schedule, @min_order)
  `);
  const insertDish = db.prepare(`
    INSERT INTO dishes (id, cook_id, name, subtitle, price, tone, veg, tag)
    VALUES (@id, @cook_id, @name, @subtitle, @price, @tone, @veg, @tag)
  `);

  const seedMany = db.transaction((cooks) => {
    for (const cook of cooks) {
      insertCook.run({
        id: cook.id, name: cook.name, short: cook.short, phone: cook.phone,
        area: cook.area, distance: cook.distance, tags: cook.tags,
        rating: cook.rating, review_count: cook.count, prep_time: cook.prepTime,
        tone: cook.tone, online: cook.online ? 1 : 0, fssai: 1,
        languages: cook.languages, bio: cook.bio, schedule: cook.schedule,
        min_order: cook.minOrder,
      });
      for (const d of cook.dishes) {
        insertDish.run({
          id: d.id, cook_id: cook.id, name: d.name, subtitle: d.subtitle,
          price: d.price, tone: d.tone, veg: d.veg ? 1 : 0, tag: d.tag || null,
        });
      }
    }
  });

  seedMany(SEED_COOKS);
  console.log('[db] Seeded 6 cooks and all dishes.');
}

module.exports = db;
