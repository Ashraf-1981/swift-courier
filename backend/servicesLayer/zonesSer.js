const zonesDat = require('../dataLayer/zonesDat');

/**
 * Business rules: zone list for customers
 * 1. Sorted A–Z by name, easier to find in the dropdown
 */
async function getZones() {
  const zones = await zonesDat.getAllZones();
  return zones.sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = { getZones };