const proofDat = require('./dataLayer/proofOfDeliveryDat');

(async () => {
  const id = await proofDat.addProof({
    deliveryId: 5,
    proofType: 'photo',
    fileUrl: '/uploads/test.png',
    receivedBy: null,
    recordedBy: 9,
  });
  console.log('New proof id:', id);
  process.exit();
})();