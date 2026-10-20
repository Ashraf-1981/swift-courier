require('dotenv').config();
const aiSer = require('../servicesLayer/aiSer');
const knowledgeDat = require('../dataLayer/knowledgeDat');
const helpTexts = require('../knowledge/helpTexts');

// run once (and again whenever helpTexts.js changes)
(async () => {
  await knowledgeDat.deleteAll();
  for (const t of helpTexts) {
    const vector = await aiSer.embed(t.title + '. ' + t.content);
    await knowledgeDat.addChunk(t.title, t.content, vector);
    console.log('Saved:', t.title);
  }
  console.log('Done:', helpTexts.length, 'texts');
  process.exit();
})();