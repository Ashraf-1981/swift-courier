const deliveryTypesDat = require('../dataLayer/deliveryTypesDat');
/**
 * Business rules: vehicle list for customers
 * 1. Only active types (admin can switch one off, e.g. no vans this week)
 */
async function getActiveTypes() {
  const types = await deliveryTypesDat.getAllDeliveryTypes();
  return types.filter((type) => type.is_active);
}

module.exports = { getActiveTypes };