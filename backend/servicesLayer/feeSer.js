const zonesDat = require('../dataLayer/zonesDat');
const deliveryTypesDat = require('../dataLayer/deliveryTypesDat');

/**
 * Business logic for calculating fees:
 * Surcharge
 * Add up all surcharges of one zone
 * Rule A: pickup surcharges + drop-off surcharges, 
 * DECIMAL comes back as strings, so convert with Number()
 * Each zone has a centre point, so I calculate km from pickup zone to drop-off zone
 */

// One zone
function zoneSurchargeTotal(zone) {
  return Number(zone.outskirt_surcharge)
    + Number(zone.restricted_surcharge)
    + Number(zone.erp_surcharge);
}

// Two zones                              (2 trips)
async function calculateSurcharge(pickupZoneId, dropoffZoneId) {
  const pickup = await zonesDat.getZoneById(pickupZoneId);
  const dropoff = await zonesDat.getZoneById(dropoffZoneId);

  if (!pickup || !dropoff) {
    throw new Error('Zone not found');
  }

  return zoneSurchargeTotal(pickup) + zoneSurchargeTotal(dropoff);
}

/**
 * Formula: haversine formula
 * replace a live maps API (no need to pay for Google Maps API calls)
 * Latitude and longitude are measured in degrees
 * 1 degree ≈ 111 km on Earth
 * So: difference in degrees × 111 = km
 */

/**
 * example lat and lng
 * (pickup.center_lat1),  (pickup.center_lng2)
 * (dropoff.center_lat1), (dropoff.center_lng2)
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180; // convert degrees to radians

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  // Math.sin and Math.cos only understand radians, not degrees
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a)); // turn the angle back into km
}

/**
 * Business rule: Distance
 * Distance = straight line between pickup and drop-off zone centres
 */
async function calculateDistance(pickupZoneId, dropoffZoneId) {
  const pickup = await zonesDat.getZoneById(pickupZoneId);
  const dropoff = await zonesDat.getZoneById(dropoffZoneId);

  if (!pickup || !dropoff) {
    throw new Error('Zone not found');
  }

  const km = haversineKm(
    Number(pickup.center_lat), Number(pickup.center_lng),
    Number(dropoff.center_lat), Number(dropoff.center_lng)
  );

  // round to whole number, if not its like 40.43621987 km
  return Math.round(km * 10) / 10;
}

/**
 * Business rule: Total fee
 * total = base fee + (km × per-km rate) + (extra stops × stop fee) + surcharge
 * Returns a breakdown so each part is saved in the deliveries table
 * Price snapshot: so changing rates later never changes an old delivery’s price
 */
async function calculateTotalFee(deliveryTypeId, pickupZoneId, dropoffZoneId, extraStops = 0) {
  const type = await deliveryTypesDat.getDeliveryTypeById(deliveryTypeId);

  if (!type || !type.is_active) {
    throw new Error('Delivery type not found');
  }

  const distanceKm = await calculateDistance(pickupZoneId, dropoffZoneId);
  const surchargeTotal = await calculateSurcharge(pickupZoneId, dropoffZoneId);

  const baseFee = Number(type.base_fee);
  const distanceFee = distanceKm * Number(type.per_km_rate);
  const stopsFee = extraStops * Number(type.extra_stop_fee);

  const totalFee = baseFee + distanceFee + stopsFee + surchargeTotal;

  // round money to 2 decimals, e.g. 48.480000001 → 48.48
  const round2 = (n) => Math.round(n * 100) / 100;

  return {
    distance_km: distanceKm,
    base_fee: round2(baseFee),
    distance_fee: round2(distanceFee),
    stops_fee: round2(stopsFee),
    surcharge_total: round2(surchargeTotal),
    total_fee: round2(totalFee),
  };
}

module.exports = { calculateSurcharge, calculateDistance, calculateTotalFee };