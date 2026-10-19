// For admin order filter

// fake data layer + AI: no database or Gemini needed
jest.mock('../dataLayer/deliveriesDat');
jest.mock('../dataLayer/zonesDat');
jest.mock('../servicesLayer/aiSer');

const deliveriesDat = require('../dataLayer/deliveriesDat');
const zonesDat = require('../dataLayer/zonesDat');
const adminSer = require('../servicesLayer/adminSer');

beforeEach(() => {
    deliveriesDat.getOrders.mockResolvedValue([]);
    zonesDat.getAllZones.mockResolvedValue([]);
});

// Business rule: only known filter values reach the database
describe('adminSer.getOrders filters', () => {
    test('good values are passed through', async () => {
        const res = await adminSer.getOrders({ status: 'delivered', payment: 'paid', from: '2026-10-16' });
        expect(res.filters).toEqual({ status: 'delivered', payment: 'paid', from: '2026-10-16' });
        expect(deliveriesDat.getOrders).toHaveBeenCalledWith(res.filters);
    });

    test('bad values are dropped, not sent to SQL', async () => {
        const res = await adminSer.getOrders({
            status: 'hacked', payment: "x' OR 1=1", zoneId: 'abc', from: '19-10-2026', to: 'tomorrow',
        });
        expect(res.filters).toEqual({});
    });

    test('empty query → no filters, all orders', async () => {
        const res = await adminSer.getOrders({});
        expect(res.filters).toEqual({});
    });
});