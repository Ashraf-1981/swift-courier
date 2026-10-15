const deliveryTypesDat = require('../dataLayer/deliveryTypesDat');

// Business rule: Vehicle upgrade
// vehicles to try, customer choose first 'number': [....]
const TRY_ORDER = {
    1: [1, 2, 3], // Bike → Car → Van
    2: [2, 3],    // Car → Van
    3: [3],       // Van
    4: [4, 5, 6], // 4-Hour Bike → 4-Hour Car → 4-Hour Van
    5: [5, 6],    // 4-Hour Car → 4-Hour Van
    6: [6],       // 4-Hour Van
};

/**
 * Business rule: does the parcel fit this vehicle?
 * Checks weight first, then each size limit
 * Returns the reason if it doesn't fit, or null if it fits
 */
function checkFit(type, parcel) {
    if (parcel.weightKg > Number(type.max_weight_kg)) {
        return `Too heavy for ${type.name} (max ${Number(type.max_weight_kg)} kg)`;
    }

    if (parcel.lengthCm > type.max_length_cm
        || parcel.widthCm > type.max_width_cm
        || parcel.heightCm > type.max_height_cm) {
        return `Too big for ${type.name} (max ${type.max_length_cm}×${type.max_width_cm}×${type.max_height_cm} cm)`;
    }

    return null; 
}

/**
 * Business rule: suggest a vehicle
 * Start with the customer's choice, move up until the parcel fits
 */
async function suggestVehicle({ deliveryTypeId, weightKg, lengthCm, widthCm, heightCm }) {
    const parcel = { weightKg, lengthCm, widthCm, heightCm };
    const tryIds = TRY_ORDER[deliveryTypeId];

    if (!tryIds) {
        throw new Error('Delivery type not found');
    }

    for (const id of tryIds) {
        const type = await deliveryTypesDat.getDeliveryTypeById(id);

        if (!checkFit(type, parcel)) {
            return { suggested: type.name, suggested_id: type.id, upgraded: id !== deliveryTypeId };
        }
    }
        throw new Error('Parcel too big for any vehicle');
}

module.exports = { suggestVehicle };