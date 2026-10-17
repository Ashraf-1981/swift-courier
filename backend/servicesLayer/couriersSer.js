const couriersDat = require('../dataLayer/couriersDat');
const deliveriesDat = require('../dataLayer/deliveriesDat');
const { FOUR_HOUR_TYPE_IDS } = require('./deliveriesSer');

// business rule: online jobs must be paid before going out; COD can go unpaid
function isPaymentReady(job) {
  return job.payment_method === 'cod' || job.payment_status === 'paid';
}

/**
 * Business rules: which jobs a courier can see
 * - Express courier: pending 4-Hour jobs, island-wide
 * - Normal courier: pickups in his zones (normal types only),
 *   and warehouse hand-overs going to his zones
 */
async function getAvailableJobs(courierId) {
  const courier = await couriersDat.getCourierById(courierId);
  if (!courier) throw new Error('Courier not found');

  const jobs = await deliveriesDat.getOpenJobs();

  if (courier.is_express) {
    return jobs
      .filter((j) => j.status === 'pending'
        && FOUR_HOUR_TYPE_IDS.includes(j.delivery_type_id)
        && isPaymentReady(j))
      .map((j) => ({ ...j, job_type: 'pickup' }));
  }

  const zones = await couriersDat.getZoneIds(courierId);

  const pickups = jobs
    .filter((j) => j.status === 'pending'
      && !FOUR_HOUR_TYPE_IDS.includes(j.delivery_type_id)
      && isPaymentReady(j)
      && zones.includes(j.pickup_zone_id))
    .map((j) => ({ ...j, job_type: 'pickup' }));

  const handovers = jobs
    .filter((j) => j.status === 'at_warehouse'
      && zones.includes(j.dropoff_zone_id))
    .map((j) => ({ ...j, job_type: 'delivery' }));

  return [...pickups, ...handovers];
}

module.exports = { getAvailableJobs };