// require('dotenv').config();
// const assistantSer = require('./servicesLayer/assistantSer');

// (async () => {
//   const questions = [
//     'Can the driver leave it outside my door?',
//     'Nobody was home, what happens now?',
//     'How much is ERP?',
//   ];
//   for (const q of questions) {
//     const top = await assistantSer.findClosest(q);
//     // \n = new line
//     console.log('\nQ:', q);
//     top.forEach((t) => console.log('  ', t.score.toFixed(3), t.title));
//   }
//   process.exit();
// })();

require('dotenv').config();
const assistantSer = require('./servicesLayer/assistantSer');

const SITI_ID = 3;

(async () => {
  const questions = [
    'Nobody was home, what happens now?',
    'Which of my parcels are not paid yet?',
    'Do you deliver to Malaysia?',
  ];
  for (const q of questions) {
    const res = await assistantSer.ask(3, q);
    console.log('\nQ:', q);
    console.log('A:', res.answer);
    console.log('Sources:', res.sources.join(', '));
  }
  process.exit();
})();