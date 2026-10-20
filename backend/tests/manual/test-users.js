const usersDat = require('../../dataLayer/usersDat');

(async () => {
  const id = await usersDat.createUser({
    name: 'Test Customer',
    email: 'test@swift.com',
    phone: '91234567',
    passwordHash: 'fake-hash-for-test',
    role: 'customer',
  });
  console.log('New id:', id);

  console.log('By email:', await usersDat.getUserByEmail('test@swift.com'));
  console.log('By id:', await usersDat.getUserById(id));
  process.exit();
})();