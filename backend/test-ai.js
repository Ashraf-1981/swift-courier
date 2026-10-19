// As a start

// require('dotenv').config();
// const aiSer = require('./servicesLayer/aiSer');

// (async () => {
//   try {
//     const text = await aiSer.askText('Answer in one short sentence.', 'What is a courier?');
//     console.log('TEXT:', text);

//     const json = await aiSer.askJson('Reply as JSON: {"city": string}', 'Capital of Singapore?');
//     console.log('JSON:', json);
//   } catch (err) {
//     console.log('ERROR:', err.message);
//   }
//   process.exit();
// })();

require('dotenv').config();
const aiSer = require('./servicesLayer/aiSer');

(async () => {
  try {
    const v = await aiSer.embed('Can the courier leave my parcel at the door?');
    console.log('LENGTH:', v.length);
    console.log('FIRST 3:', v.slice(0, 3));
  } catch (err) {
    console.log('ERROR:', err.message);
  }
  
})();