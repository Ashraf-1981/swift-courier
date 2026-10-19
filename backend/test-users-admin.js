const adminSer = require('./servicesLayer/adminSer');

(async () => {
  const all = await adminSer.getUsers({});
  console.log('ALL:', all.users.length);

  const couriers = await adminSer.getUsers({ role: 'courier' });
  couriers.users.forEach((u) => console.log('COURIER:', u.name, '|', u.zones, '| express:', u.is_express));

  const siti = await adminSer.getUsers({ search: 'siti' });
  siti.users.forEach((u) => console.log('SEARCH:', u.name, u.email, 'orders:', u.order_count));

  const bad = await adminSer.getUsers({ role: 'hacker' });
  console.log('BAD ROLE:', bad.filters, bad.users.length);

  process.exit();
})();