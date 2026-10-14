const feeSer = require('./servicesLayer/feeSer');

(async () => {
  console.log('Raffles → Tuas km:', await feeSer.calculateDistance(1, 7));    // (1=pick up, 7=drop off) about 24.0
  console.log('Changi → Tuas km:', await feeSer.calculateDistance(8, 7));     // (8=pick up, 7=drop off) about 40.4
  console.log('Yishun → Tampines km:', await feeSer.calculateDistance(3, 4)); // (3=pick up, 4=drop off) about 16.2
  process.exit();
})();