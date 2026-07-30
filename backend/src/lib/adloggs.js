const BASE_URL = process.env.ADLOGGS_BASE_URL || 'https://dev.adloggs.com';
const API_KEY = process.env.ADLOGGS_API_KEY;

function pad(n) { return String(n).padStart(2, '0'); }

function nowIST() {
  // +15min buffer so the timestamp isn't already "past" by the time Adloggs processes the request
  const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000 + 15 * 60 * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function randomOtp() {
  return Math.floor(1000 + Math.random() * 9000);
}

async function call(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.status !== false, status: res.status, data };
}

// Yummara is Bangalore-only for now — city/state/country are safe hardcoded defaults until
// the app expands and these need to be collected from the cook/customer instead.
function addressDetails(streetText, areaText) {
  return {
    door_no: '',
    street_name: streetText || areaText || '',
    city_name: areaText || 'Bangalore',
    district_name: 'Bangalore Urban',
    state_name: 'Karnataka',
    country_name: 'India',
    pincode: '',
  };
}

// order: row from `orders` table (with delivery_lat/lng, address, customer_name/phone)
// cook: row from `cooks` table (with pickup_lat/lng, address, name, phone)
// items: [{ name, qty, price }]
async function createOrder(order, cook, items) {
  const body = {
    partner_order_id: String(order.id),
    partner_merchant_id: cook.id,
    partner_reference_id: `yum_${order.id}_${Date.now()}`,
    pickup_contact_name: cook.name,
    pickup_contact_no: Number(cook.phone),
    pickup_address: cook.address || cook.area,
    pickup_address_details: addressDetails(cook.address, cook.area),
    pickup_date_time: nowIST(),
    pickup_lat: cook.pickup_lat,
    pickup_long: cook.pickup_lng,
    delivery_contact_name: order.customer_name,
    delivery_contact_no: Number(order.customer_phone),
    delivery_address: order.address,
    delivery_address_details: addressDetails(order.address, null),
    delivery_lat: order.delivery_lat,
    delivery_long: order.delivery_lng,
    pickup_otp: randomOtp(),
    delivery_otp: randomOtp(),
    return_otp: randomOtp(),
    order_category: 'Food and Beverage',
    order_total_price: String(order.total),
    order_total_weight_in_kg: '1.5',
    items: items.map(i => ({ name: i.name, quantity: String(i.qty), price: String(i.price) })),
    order_description: `Yummara order #${order.id}`,
    utc_offset: 330,
    payment_type: 'Online',
    collectible_amount: 0,
  };
  return call('/aa/oporder/v2/create', body);
}

async function checkAvailability(pickupLat, pickupLng, deliveryLat, deliveryLng) {
  return call('/aa/oporder/v1.2/service/availability', {
    pickup_lat: pickupLat, pickup_long: pickupLng,
    delivery_lat: deliveryLat, delivery_long: deliveryLng,
  });
}

// Adloggs refuses to cancel orders already picked up or on the way.
async function cancelOrder(orderUuid, description) {
  return call('/aa/oporder/v1.2/cancel', {
    order_uuid: orderUuid,
    order_cancel_description: description || 'Cancelled by restaurant',
  });
}

async function getStatus(orderUuid) {
  return call('/aa/oporder/getcurrentstatus', { order_uuid: orderUuid });
}

module.exports = { createOrder, checkAvailability, cancelOrder, getStatus };
