// const deliveriesDat = require('../../dataLayer/deliveriesDat');

// (async () => {
//   const all = await deliveriesDat.getOrders({});
//   console.log('ALL:', all.length);

//   const delivered = await deliveriesDat.getOrders({ status: 'delivered' });
//   console.log('DELIVERED:', delivered.map((o) => o.tracking_no + ' ' + o.status));

//   const unpaid = await deliveriesDat.getOrders({ payment: 'unpaid' });
//   console.log('UNPAID:', unpaid.map((o) => o.tracking_no + ' ' + o.pay_status));

//   const today = new Date().toISOString().slice(0, 10);
//   const todays = await deliveriesDat.getOrders({ from: today, to: today });
//   console.log('TODAY:', todays.length);

//   process.exit();
// })();


// Good filters pass through, and the bad ones are dropped, so you get all 8 orders.
// const adminSer = require('../../servicesLayer/adminSer');

// (async () => {
//   const good = await adminSer.getOrders({ status: 'delivered', payment: 'paid' });
//   console.log('GOOD:', good.filters, good.orders.length, 'zones:', good.zones.length);

//   const bad = await adminSer.getOrders({ status: 'hacked', payment: "x' OR 1=1", zoneId: 'abc', from: '19-10-2026' });
//   console.log('BAD:', bad.filters, bad.orders.length);

//   process.exit();
// })();

// Admin marks an unpaid order
// const adminSer = require('../../servicesLayer/adminSer');

// (async () => {
//   const { orders } = await adminSer.getOrders({ payment: 'unpaid' });
//   const id = orders[0].id;
//   console.log('TRY:', orders[0].tracking_no);

//   try { console.log('1st:', await adminSer.markOrderPaid(id)); }
//   catch (e) { console.log('1st ERROR:', e.message); }

//   try { console.log('2nd:', await adminSer.markOrderPaid(id)); }
//   catch (e) { console.log('2nd ERROR:', e.message); }

//   try { await adminSer.markOrderPaid(99999); }
//   catch (e) { console.log('MISSING:', e.message); }

//   process.exit();
// })();

require('dotenv').config();
const adminSer = require('../../servicesLayer/adminSer');

(async () => {
  const searches = [
    'unpaid orders',
    'delivered parcels going to Orchard',
    'orders from 16 October 2026',
  ];
  for (const s of searches) {
    const res = await adminSer.searchOrdersByText(s);
    console.log('\nSEARCH:', s);
    console.log('FILTERS:', res.filters, '→', res.orders.length, 'orders');
  }
  process.exit();
})();