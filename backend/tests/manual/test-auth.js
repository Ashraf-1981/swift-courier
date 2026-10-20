const authSer = require('../../servicesLayer/authSer');

(async () => {
  // new customer
  console.log(await authSer.register({
    name: 'Ali', email: 'ali@swift.com', phone: '91234567', password: 'password123',
  }));

  // ❌ same email again
  try {
    await authSer.register({ name: 'Ali 2', email: 'ali@swift.com', phone: '98765432', password: 'password123' });
  } catch (err) {
    console.log('Error:', err.message);
  }

  // ❌ short password
  try {
    await authSer.register({ name: 'Bob', email: 'bob@swift.com', phone: '91112222', password: '123' });
  } catch (err) {
    console.log('Error:', err.message);
  }

  process.exit();
})();