const fileSer = require('./servicesLayer/fileSer');

(async () => {
  // tiny 1x1 PNG
  const img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  console.log(await fileSer.saveImage(img));

  // wrong type → error
  try {
    await fileSer.saveImage('hello');
  } catch (err) {
    console.log('Error:', err.message);
  }
  process.exit();
})();