const deliveriesDat = require('../dataLayer/deliveriesDat');
const couriersDat = require('../dataLayer/couriersDat');
const deliveryStatusHistoryDat = require('../dataLayer/deliveryStatusHistoryDat');

// Business rule: admin sees warehouse parcels, each with couriers who cover its drop-off zone
async function getWarehouseParcels() {
    const parcels = await deliveriesDat.getWarehouseParcels();
    for (const p of parcels) {
        p.couriers = await couriersDat.getCouriersForZone(p.dropoff_zone_id);
    }
    return parcels;
}

/**
 * Business rules: admin hands a warehouse parcel to a courier
    * 1. Parcel must still be at the warehouse
        * 2. Courier must cover the drop - off zone(normal couriers only)
            * 3. Status goes straight to out_for_delivery + history row
                */
async function assignParcel(adminId, deliveryId, courierId) {
    const parcel = await deliveriesDat.getDeliveryDetail(deliveryId);
    if (!parcel || parcel.status !== 'at_warehouse') {
        throw new Error('Parcel is not at the warehouse');
    }

    // rule 2
    const couriers = await couriersDat.getCouriersForZone(parcel.dropoff_zone_id);
    if (!couriers.some((c) => c.id === courierId)) {
        throw new Error('Courier does not cover this zone');
    }

    // rule 3: only if still at_warehouse (another admin may be faster)
    const changed = await deliveriesDat.updateStatus(deliveryId, 'at_warehouse', 'out_for_delivery', courierId);
    if (changed === 0) {
        throw new Error('Parcel was already handed out');
    }

    await deliveryStatusHistoryDat.addStatus({
        deliveryId,
        oldStatus: 'at_warehouse',
        newStatus: 'out_for_delivery',
        changedBy: adminId,
        note: 'Handed to courier at warehouse',
    });

    return { message: 'Parcel handed out', deliveryId, courierId };
}

module.exports = { getWarehouseParcels, assignParcel };