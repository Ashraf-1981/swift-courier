const blacklistDat = require('./dataLayer/blacklistDat');

(async () => {
  const id = await blacklistDat.addToken({
    token: 'fake-token-for-test',
    expiresAt: new Date('2026-10-23 08:00:00'),
  });
  console.log('New id:', id);

  console.log('Found:', await blacklistDat.findToken('fake-token-for-test'));
  console.log('Not found:', await blacklistDat.findToken('some-other-token'));

  process.exit();
})();