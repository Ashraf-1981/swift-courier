const authSer = require('./servicesLayer/authSer');
const blacklistDat = require('./dataLayer/blacklistDat');

(async () => {
  const { refreshToken } = await authSer.login({ email: 'ali@swift.com', password: 'password123' });

  // real token: saved on the blacklist
  console.log(await authSer.logout(refreshToken));
  const row = await blacklistDat.findToken(refreshToken);
  console.log('On blacklist, expires:', row.expires_at);

  // logout twice: no error, not saved twice
  console.log(await authSer.logout(refreshToken));

  // fake token: nothing saved
  console.log(await authSer.logout('fake.token.here'));

  process.exit();
})();