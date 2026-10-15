const authSer = require('./servicesLayer/authSer');

(async () => {
  // correct password
  const result = await authSer.login({ email: 'ali@swift.com', password: 'password123' });
  console.log('User:', result.user.name, result.user.role);
  console.log('Access token:', result.accessToken.slice(0, 20) + '...');
  console.log('Refresh token:', result.refreshToken.slice(0, 20) + '...');

  // ❌ wrong password
  try {
    await authSer.login({ email: 'ali@swift.com', password: 'wrongpass' });
  } catch (err) {
    console.log('Error:', err.message);
  }

  // ❌ email not registered
  try {
    await authSer.login({ email: 'nobody@swift.com', password: 'password123' });
  } catch (err) {
    console.log('Error:', err.message);
  }

  process.exit();
})();