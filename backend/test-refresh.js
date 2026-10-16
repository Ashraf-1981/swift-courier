const authSer = require('./servicesLayer/authSer');

(async () => {
  const { accessToken, refreshToken } = await authSer.login({ email: 'ali@swift.com', password: 'password123' });

  // real refresh token
  const result = authSer.refresh(refreshToken);
  console.log('New access token:', result.accessToken.slice(0, 20) + '...');

  // fake token
  try {
    authSer.refresh('fake.token.here');
  } catch (err) {
    console.log('Error:', err.message);
  }

  // access token used as refresh token (wrong secret)
  try {
    authSer.refresh(accessToken);
  } catch (err) {
    console.log('Error:', err.message);
  }

  process.exit();
})();