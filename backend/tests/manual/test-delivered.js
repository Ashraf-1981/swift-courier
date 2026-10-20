const couriersSer = require('../../servicesLayer/couriersSer');
const img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

(async () => {
  try {
    console.log(await couriersSer.markDelivered(9, 5, { proofType: 'photo', image: img }));
  } catch (err) {
    console.log('Error:', err.message);
  }
  process.exit();
})();