const couriersDat = require('../dataLayer/couriersDat');
const deliveriesDat = require('../dataLayer/deliveriesDat');
const { FOUR_HOUR_TYPE_IDS } = require('./deliveriesSer');
const deliveryStatusHistoryDat = require('../dataLayer/deliveryStatusHistoryDat');
const MAX_JOBS_IN_HAND = 8;
const deliveryPaymentsDat = require('../dataLayer/deliveryPaymentsDat');
const MAX_ATTEMPTS = 2; // normal jobs: 2 tries, then back to sender

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

    // parcels at the warehouse (sorted by staff) going to his zones
    const deliveries = jobs
        .filter((j) => j.status === 'at_warehouse'
            && zones.includes(j.dropoff_zone_id))
        .map((j) => ({ ...j, job_type: 'delivery' }));

    return [...pickups, ...deliveries];
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

    // rule 1: pick up the current job before taking another
    // rule 2: max jobs in hand
    const hand = await couriersDat.countJobsInHand(courierId);
    if (hand.notPickedUp > 0) {
        throw new Error('Pick up your current job first');
    }
    if (hand.inHand >= MAX_JOBS_IN_HAND) {
        throw new Error(`You already have ${MAX_JOBS_IN_HAND} jobs in hand`);
    }

    // pickup → assigned; from the warehouse → straight out for delivery
    const newStatus = job.job_type === 'delivery' ? 'out_for_delivery' : 'assigned';

    const changed = await deliveriesDat.assignCourier(deliveryId, courierId, job.status, newStatus);
    if (changed === 0) {
        throw new Error('Job already taken');
    }

    await deliveryStatusHistoryDat.addStatus({
        deliveryId,
        oldStatus: job.status,          // 'pending' or 'at_warehouse'
        newStatus,
        changedBy: courierId,
        note: job.job_type === 'pickup' ? 'Courier accepted pickup' : 'Courier accepted delivery',
    });

    return { message: 'Job accepted', deliveryId, jobType: job.job_type, status: newStatus };
}

/**
 * Business rules: which status a courier may move a job to next
 * Normal: assigned → picked_up → at_warehouse, or out_for_delivery if drop-off zone is his
 * 4-Hour: assigned → out_for_delivery (straight, never the warehouse)
 */
function nextStatuses(job, zones, failedCount = 0) {
    const isFourHour = FOUR_HOUR_TYPE_IDS.includes(job.delivery_type_id);

    if (job.status === 'assigned') {
        return isFourHour ? ['out_for_delivery'] : ['picked_up'];
    }
    if (job.status === 'picked_up' && !isFourHour) {
        const allowed = ['at_warehouse'];
        if (zones.includes(job.dropoff_zone_id)) {
            allowed.push('out_for_delivery'); // deliver directly, same shift
        }
        return allowed;
    }

    if (job.status === 'out_for_delivery') {
        return ['failed'];
    }
    if (job.status === 'failed') {
        // 4-Hour, or 2nd failed try → back to sender; else → warehouse to redeliver
        return isFourHour || failedCount >= MAX_ATTEMPTS ? ['returned'] : ['at_warehouse'];
    }
    return [];
}


const STATUS_NOTES = {
    picked_up: 'Parcel picked up',
    at_warehouse: 'Dropped at warehouse',
    out_for_delivery: 'Out for delivery',
    failed: 'Delivery failed',
    returned: 'Returned to sender',
};

async function updateJobStatus(courierId, deliveryId, newStatus, reason) {
    const job = await deliveriesDat.getDeliveryDetail(deliveryId);
    if (!job || job.courier_id !== courierId) {
        throw new Error('Job not found');
    }

    const zones = await couriersDat.getZoneIds(courierId);
    const failedCount = await deliveryStatusHistoryDat.countFailed(deliveryId);
    const allowed = nextStatuses(job, zones, failedCount);
    if (!allowed.includes(newStatus)) {
        throw new Error(`Cannot change from ${job.status} to ${newStatus}`);
    }

    // business rules for a failed delivery
    if (newStatus === 'failed') {
        if (job.allow_doorstep) {
            throw new Error('Doorstep is allowed: leave it at the door instead');
        }
        if (!reason) {
            throw new Error('Please give a reason for the failed delivery');
        }
    }

    // at the warehouse, the item leaves his hand (staff hand it out later)
    const newCourierId = newStatus === 'at_warehouse' ? null : courierId;

    const changed = await deliveriesDat.updateStatus(deliveryId, job.status, newStatus, newCourierId);
    if (changed === 0) {
        throw new Error('Job was updated by someone else');
    }

    // returned to sender: online pays full trip fee again, COD sender pays half
    if (newStatus === 'returned') {
        const fee = job.payment_method === 'cod' ? job.total_fee / 2 : job.total_fee;
        await deliveryPaymentsDat.setReturnFee(deliveryId, fee);
    }

    const isFourHour = FOUR_HOUR_TYPE_IDS.includes(job.delivery_type_id);
    await deliveryStatusHistoryDat.addStatus({
        deliveryId,
        oldStatus: job.status,
        newStatus,
        changedBy: courierId,
        note: newStatus === 'failed' ? `Failed: ${reason}`
            : newStatus === 'at_warehouse' && job.status === 'failed' ? 'Back at warehouse, redeliver next working day'
                : isFourHour && job.status === 'assigned' ? 'Picked up, on the way'
                    : STATUS_NOTES[newStatus],
    });

    return { message: 'Status updated', deliveryId, status: newStatus };
}

module.exports = { getAvailableJobs, acceptJob, nextStatuses, updateJobStatus };