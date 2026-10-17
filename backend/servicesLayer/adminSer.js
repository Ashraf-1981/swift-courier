const deliveriesDat = require('../dataLayer/deliveriesDat');

// Business rule: admin sees all parcels waiting at the warehouse
async function getWarehouseParcels() {
    return deliveriesDat.getWarehouseParcels();
}

module.exports = { getWarehouseParcels };