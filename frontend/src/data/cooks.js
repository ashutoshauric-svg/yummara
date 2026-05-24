export const YUM_COOKS = [
  {
    id: 'padma', name: 'Padma Sundaram', short: 'Padma',
    area: 'Indiranagar', distance: '1.2 km', tags: 'South Indian · Tamil · Tiffin',
    rating: 4.9, count: 312, prepTime: '25–35 min', tone: 'warm', online: true, fssai: true, dishCount: 18,
    languages: 'Tamil · English · Kannada', yearsCooking: 'Cooking on Yummara since 2024',
    bio: "I cook the way my paati did — every morning I grind sambhar masala fresh, and the tamarind comes from my brother's farm in Theni. My kitchen is small, but my pressure cooker is mighty.",
    schedule: 'Mon–Sat · 6am–9pm · Closed Sundays', minOrder: 95,
    dishes: [
      { id: 'pad-1', name: 'Bisi Bele Bath',          subtitle: 'With aloo bonda + curd. Recipe from Mysore.', price: 145, tone:'warm',  veg:true,  tag:'reorder' },
      { id: 'pad-2', name: 'Tamilian Thali',          subtitle: 'Rice, sambar, rasam, kootu, poriyal, payasam', price: 245, tone:'warm',  veg:true,  tag:'highly' },
      { id: 'pad-3', name: 'Curd Rice + Pickle',      subtitle: 'Pongal-style, with kothavarangai', price: 95,  tone:'warm',  veg:true },
      { id: 'pad-4', name: 'Vendakkai Puli Kuzhambu', subtitle: 'Tamarind okra · ghee rice on the side', price: 165, tone:'clay',  veg:true },
      { id: 'pad-5', name: 'Lemon Rice',              subtitle: 'Iyer-style, with peanuts + curry leaves', price: 110, tone:'warm',  veg:true },
      { id: 'pad-6', name: 'Rasam Sadham',            subtitle: 'Pepper rasam, papad, curd · soulful', price: 85,  tone:'warm',  veg:true },
      { id: 'pad-7', name: 'Avalakki Upma',           subtitle: 'With grated coconut and curry leaves', price: 95,  tone:'green', veg:true },
      { id: 'pad-8', name: 'Filter Coffee · 200ml',   subtitle: 'Mysore filter brew, frothed with sugar', price: 40,  tone:'warm',  veg:true },
    ],
  },
  {
    id: 'rukmini', name: "Rukmini D'Souza", short: 'Rukmini',
    area: 'Koramangala', distance: '0.8 km', tags: 'Mangalorean · Coastal',
    rating: 4.7, count: 178, prepTime: '35–45 min', tone: 'green', online: true, fssai: true, dishCount: 11,
    languages: 'Konkani · English', yearsCooking: 'On Yummara since 2024',
    bio: "Mangalore coast on a plate. I cure my own seafood masala, source neer dosa rice from Udupi, and refuse to make anything in less than four steps. Worth the wait.",
    schedule: 'Tue–Sun · 11am–9pm', minOrder: 150,
    dishes: [
      { id: 'ruk-1', name: 'Neer Dosa Combo',         subtitle: '3 dosas + chicken sukka', price: 220, tone:'clay',  veg:false, tag:'reorder' },
      { id: 'ruk-2', name: 'Mangalorean Fish Curry',  subtitle: 'Anjal in coconut + kokum', price: 280, tone:'clay',  veg:false },
      { id: 'ruk-3', name: 'Chicken Ghee Roast',      subtitle: 'Slow-cooked, blistered chillies', price: 290, tone:'clay',  veg:false, tag:'highly' },
      { id: 'ruk-4', name: 'Kori Rotti',              subtitle: 'Crisp rice wafers, red chicken gravy', price: 240, tone:'clay',  veg:false },
      { id: 'ruk-5', name: 'Goli Baje · 8 pcs',       subtitle: 'Mangalore bondas, coconut chutney', price: 110, tone:'warm',  veg:true },
      { id: 'ruk-6', name: 'Prawn Sukka',             subtitle: 'Dry coconut masala, neer dosa side', price: 320, tone:'clay',  veg:false },
    ],
  },
  {
    id: 'aarti', name: 'Aarti Bisht', short: 'Aarti',
    area: 'HSR Sector 2', distance: '1.6 km', tags: 'Pahadi · Garhwali',
    rating: 4.8, count: 92, prepTime: '30–40 min', tone: 'clay', online: false, fssai: true, dishCount: 7,
    languages: 'Garhwali · Hindi · English', yearsCooking: 'On Yummara since 2025',
    bio: "Garhwal in a tiffin. Madua (finger millet) flour from my village in Pauri, jhangora I husk myself. Slow food from the hills — back at 7pm.",
    schedule: 'Mon · Wed · Fri · Sat · 12pm–3pm + 7pm–9:30pm', minOrder: 140,
    dishes: [
      { id: 'aar-1', name: 'Garhwali Thali',          subtitle: 'Madua roti, kafuli, jhangora kheer', price: 285, tone:'green', veg:true, tag:'highly' },
      { id: 'aar-2', name: 'Kafuli',                  subtitle: 'Spinach-fenugreek gravy, rice', price: 140, tone:'green', veg:true },
      { id: 'aar-3', name: 'Madua Roti · 4 pcs',      subtitle: 'Finger millet flour, ghee', price: 85,  tone:'warm',  veg:true },
      { id: 'aar-4', name: 'Bhang ki Chutney',        subtitle: 'Hemp seed, mint, lemon · side', price: 60,  tone:'green', veg:true },
      { id: 'aar-5', name: 'Jhangora Kheer',          subtitle: 'Barnyard millet, jaggery, almonds', price: 110, tone:'warm',  veg:true },
      { id: 'aar-6', name: 'Rajma Chawal Box',        subtitle: 'Kashmiri rajma, jeera rice, ghee', price: 160, tone:'warm',  veg:true },
    ],
  },
  {
    id: 'lakshmi', name: 'Lakshmi Iyer', short: 'Lakshmi',
    area: 'HSR Sector 6', distance: '1.0 km', tags: 'Tam Brahm · Iyer · Tiffin',
    rating: 4.9, count: 401, prepTime: '20–30 min', tone: 'warm', online: true, fssai: true, dishCount: 14,
    languages: 'Tamil · English', yearsCooking: 'On Yummara since 2023 · most-ordered cook in HSR',
    bio: "Iyer kitchen, no compromises. No onion, no garlic, no shortcuts. Pongal at 6am, curd rice by 1pm, filter kaapi all day. I deliver in steel dabbas — return them with the next order.",
    schedule: 'Daily · 6am–9pm', minOrder: 85,
    dishes: [
      { id: 'lak-1', name: 'Pongal + Vada',           subtitle: '2 vadas, sambhar, coconut chutney', price: 120, tone:'warm',  veg:true, tag:'reorder' },
      { id: 'lak-2', name: 'Curd Rice + Pickle',      subtitle: 'Pongal-style, with kothavarangai',   price: 95,  tone:'warm',  veg:true },
      { id: 'lak-3', name: 'Sambar Rice',             subtitle: 'Tuvar dal, drumstick, ghee',         price: 130, tone:'warm',  veg:true },
      { id: 'lak-4', name: 'Rasam Rice',              subtitle: 'Pepper-cumin rasam, papad',          price: 110, tone:'warm',  veg:true },
      { id: 'lak-5', name: 'Mor Kuzhambu',            subtitle: 'Buttermilk gravy, ash gourd',        price: 145, tone:'green', veg:true },
      { id: 'lak-6', name: 'Filter Coffee · 200ml',   subtitle: 'Steel tumbler, decoction-strong',    price: 40,  tone:'warm',  veg:true },
    ],
  },
  {
    id: 'bhumi', name: 'Bhumi Patel', short: 'Bhumi',
    area: 'Koramangala 5th', distance: '1.3 km', tags: 'Gujarati · Sattvik',
    rating: 5.0, count: 4, prepTime: '30–40 min', tone: 'green', online: true, fssai: true, dishCount: 9,
    languages: 'Gujarati · Hindi · English', yearsCooking: 'New on Yummara · joined last week',
    bio: "Bhavnagar daughter cooking out of her Koramangala flat. Theplas rolled at 5am, dhokla steamed by 8. The mango chunda is my mother-in-law's recipe and I will never tell anyone what's in it.",
    schedule: 'Mon–Fri · 11am–8pm', minOrder: 120,
    dishes: [
      { id: 'bhu-1', name: 'Methi Thepla Box',        subtitle: '6 theplas, dahi, mango chunda', price: 165, tone:'green', veg:true,  tag:'new' },
      { id: 'bhu-2', name: 'Egg Curry + 4 Roti',      subtitle: 'Bengali jhol style',            price: 180, tone:'clay',  veg:false },
      { id: 'bhu-3', name: 'Dhokla',                  subtitle: '12 pieces, steamed fresh, chutney', price: 140, tone:'green', veg:true,  tag:'new' },
      { id: 'bhu-4', name: 'Khichdi + Kadhi',         subtitle: 'Gujarati comfort, ghee on top',  price: 120, tone:'warm',  veg:true },
      { id: 'bhu-5', name: 'Undhiyu · Limited',       subtitle: 'Winter special · valor papdi',   price: 245, tone:'green', veg:true,  tag:'new' },
    ],
  },
  {
    id: 'krishnan', name: 'Krishnan Pillai', short: 'Krishnan',
    area: 'Whitefield', distance: '4.1 km', tags: 'Kerala · Sadhya',
    rating: 5.0, count: 2, prepTime: '45–60 min', tone: 'warm', online: true, fssai: true, dishCount: 6,
    languages: 'Malayalam · English · Hindi', yearsCooking: 'New on Yummara · joined this week',
    bio: "Palakkad kitchen, in Whitefield. I cook a full sadhya every Onam. Coconut oil is non-negotiable. Banana leaves available on request.",
    schedule: 'Thu–Sun · 12pm–8pm', minOrder: 180,
    dishes: [
      { id: 'kri-1', name: 'Onam Sadhya Mini',        subtitle: '8-item leaf meal · banana on request', price: 320, tone:'green', veg:true,  tag:'new' },
      { id: 'kri-2', name: 'Avial',                   subtitle: 'Coconut-curd, mixed vegetables',       price: 180, tone:'green', veg:true },
      { id: 'kri-3', name: 'Kerala Fish Moilee',      subtitle: 'Karimeen, coconut milk, kokum',        price: 295, tone:'clay',  veg:false, tag:'new' },
      { id: 'kri-4', name: 'Puttu + Kadala',          subtitle: 'Steamed rice cylinder, black chickpea curry', price: 160, tone:'warm', veg:true },
    ],
  },
];

export const YUM_INDEX = {
  byId: Object.fromEntries(YUM_COOKS.map(c => [c.id, c])),
  byName: Object.fromEntries(YUM_COOKS.map(c => [c.name, c])),
};
YUM_COOKS.forEach(c => { YUM_INDEX.byName[c.short] = c; });

export const YUM_ALL_DISHES = YUM_COOKS.flatMap(c =>
  c.dishes.map(d => ({ ...d, cookId: c.id, cookName: c.name, cookShort: c.short, cookArea: c.area }))
);
const YUM_DISH_BY_NAME = Object.fromEntries(YUM_ALL_DISHES.map(d => [d.name, d]));

export function yumFindCookByName(name) {
  if (!name) return null;
  if (YUM_INDEX.byName[name]) return YUM_INDEX.byName[name];
  const first = name.split(/\s|·/)[0].trim();
  return YUM_INDEX.byName[first] || null;
}

export function yumFindDish(name) {
  const d = YUM_DISH_BY_NAME[name];
  if (d) return d;
  return YUM_ALL_DISHES.find(x => x.name.toLowerCase() === (name || '').toLowerCase()) || null;
}
