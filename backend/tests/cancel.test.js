jest.mock('../dataLayer/deliveriesDat');
jest.mock('../dataLayer/deliveryStatusHistoryDat');

const deliveriesDat = require('../dataLayer/deliveriesDat');
const historyDat = require('../dataLayer/deliveryStatusHistoryDat');
const deliveriesSer = require('../servicesLayer/deliveriesSer');

const SITI = 5;

// a pending, unpaid order of Siti; tests change one field
function order(changes = {}) {
    return { id: 20, customer_id: SITI, status: 'pending', payment_status: 'unpaid', ...changes };
}

beforeEach(() => {
    jest.clearAllMocks();
    deliveriesDat.updateStatus.mockResolvedValue(1);
});

describe('cancelDelivery', () => {
    test("someone else's order → not found", async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(order({ customer_id: 99 }));
        await expect(deliveriesSer.cancelDelivery(SITI, 20)).rejects.toThrow('Delivery not found');
    });

    test('not pending → blocked', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(order({ status: 'assigned' }));
        await expect(deliveriesSer.cancelDelivery(SITI, 20)).rejects.toThrow('Only pending');
    });

    test('paid → blocked', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(order({ payment_status: 'paid' }));
        await expect(deliveriesSer.cancelDelivery(SITI, 20)).rejects.toThrow('Paid orders');
    });

    test('courier took it at the same moment → blocked', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(order());
        deliveriesDat.updateStatus.mockResolvedValue(0);
        await expect(deliveriesSer.cancelDelivery(SITI, 20)).rejects.toThrow('just taken');
    });

    test('pending + unpaid → cancelled with history row', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(order());
        await deliveriesSer.cancelDelivery(SITI, 20);
        expect(deliveriesDat.updateStatus).toHaveBeenCalledWith(20, 'pending', 'cancelled', null);
        expect(historyDat.addStatus).toHaveBeenCalledWith(expect.objectContaining({ newStatus: 'cancelled', changedBy: SITI }));
    });
});