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

/**
 * Business rule: ERP only on weekday peak hours
 * Mon–Fri, 7:30–9:30am and 5:30–8:
 * we use (pickupTime) as the best guess to replace live GPS
 */
function isErpPeak(pickupTime) {
  const time = new Date(pickupTime);
  const day = time.getDay(); // 0 = Sunday, 6 = Saturday

  if (day === 0 || day === 6) {
    return false; // weekend: no ERP
  }

  const minutes = time.getHours() * 60 + time.getMinutes(); // 8:30am → 510(Minutes since midnight)

  const morningPeak = minutes >= 7 * 60 + 30 && minutes < 9 * 60 + 30;
  const eveningPeak = minutes >= 17 * 60 + 30 && minutes < 20 * 60;

  return morningPeak || eveningPeak;
}

// One zone: outskirt + restricted always, ERP only at peak
function zoneSurchargeTotal(zone, pickupTime) {
  const erp = isErpPeak(pickupTime) ? Number(zone.erp_surcharge) : 0;

  return Number(zone.outskirt_surcharge)
    + Number(zone.restricted_surcharge)
    + erp;
}

// Two zones: pickup surcharges + drop-off surcharges (rule A)
async function calculateSurcharge(pickupZoneId, dropoffZoneId, pickupTime) {
  const pickup = await zonesDat.getZoneById(pickupZoneId);
  const dropoff = await zonesDat.getZoneById(dropoffZoneId);

  if (!pickup || !dropoff) {
    throw new Error('Zone not found');
  }

  return zoneSurchargeTotal(pickup, pickupTime) + zoneSurchargeTotal(dropoff, pickupTime);
}

/**
 * Haversine formula - to get only distance(km)
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
async function calculateTotalFee(deliveryTypeId, pickupZoneId, dropoffZoneId, extraStops = 0, pickupTime = new Date()) 
  {
    const type = await deliveryTypesDat.getDeliveryTypeById(deliveryTypeId);

    if (!type || !type.is_active) {
      throw new Error('Delivery type not found');
    }

    const distanceKm = await calculateDistance(pickupZoneId, dropoffZoneId);
    const surchargeTotal = await calculateSurcharge(pickupZoneId, dropoffZoneId, pickupTime);

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