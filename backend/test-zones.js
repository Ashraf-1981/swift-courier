const dat = require('./dataLayer/zonesDat');

(async () => {
  console.log(await dat.getAllZones());
  console.log(await dat.getZoneById(1));
  process.exit();
})();