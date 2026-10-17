const couriersDat = require('../dataLayer/couriersDat');
const deliveriesDat = require('../dataLayer/deliveriesDat');
const { FOUR_HOUR_TYPE_IDS } = require('./deliveriesSer');
const deliveryStatusHistoryDat = require('../dataLayer/deliveryStatusHistoryDat');

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

/**
 * Business rules: courier accepts a job
 * 1. Only a job he is allowed to see (same rules as the jobs list)
 * 2. If the status changed meanwhile, it's taken
 * 3. Every change writes a history row
 */
async function acceptJob(courierId, deliveryId) {
  const jobs = await getAvailableJobs(courierId);
  const job = jobs.find((j) => j.id === deliveryId);

  if (!job) {
    throw new Error('Job not available');
  }

  const changed = await deliveriesDat.assignCourier(deliveryId, courierId, job.status);
  if (changed === 0) {
    throw new Error('Job already taken');
  }

  await deliveryStatusHistoryDat.addStatus({
    deliveryId,
    oldStatus: job.status,          // 'pending' or 'at_warehouse'
    newStatus: 'assigned',
    changedBy: courierId,
    note: job.job_type === 'pickup' ? 'Courier accepted pickup' : 'Courier accepted delivery',
  });

  return { message: 'Job accepted', deliveryId, jobType: job.job_type };
}

module.exports = { getAvailableJobs, acceptJob };