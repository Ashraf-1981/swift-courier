jest.mock('../dataLayer/deliveriesDat');
jest.mock('../dataLayer/couriersDat');
jest.mock('../dataLayer/deliveryStatusHistoryDat');
jest.mock('../dataLayer/deliveryPaymentsDat');
jest.mock('../dataLayer/proofOfDeliveryDat');
jest.mock('../servicesLayer/fileSer');

const deliveriesDat = require('../dataLayer/deliveriesDat');
const couriersDat = require('../dataLayer/couriersDat');
const historyDat = require('../dataLayer/deliveryStatusHistoryDat');
const paymentsDat = require('../dataLayer/deliveryPaymentsDat');
const proofDat = require('../dataLayer/proofOfDeliveryDat');
const fileSer = require('../servicesLayer/fileSer');
const couriersSer = require('../servicesLayer/couriersSer');

const AHMAD = 9;
const IMG = 'data:image/png;base64,AAAA';

// a job out for delivery with Ahmad; tests change one field
function job(changes = {}) {
    return {
        id: 12, courier_id: AHMAD, status: 'out_for_delivery', delivery_type_id: 1, dropoff_zone_id: 2,
        allow_doorstep: 0, payment_method: 'paynow', total_fee: '20.00', ...changes,
    };
}

beforeEach(() => {
    jest.clearAllMocks();
    fileSer.saveImage.mockResolvedValue('/uploads/x.png');
    deliveriesDat.updateStatus.mockResolvedValue(1);
    couriersDat.getZoneIds.mockResolvedValue([1, 2]);
    historyDat.countFailed.mockResolvedValue(0);
});

describe('markDelivered', () => {
    test("someone else's job → not found", async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job({ courier_id: 99 }));
        await expect(couriersSer.markDelivered(AHMAD, 12, { proofType: 'signature_digital', image: IMG }))
            .rejects.toThrow('Job not found');
    });
    test('doorstep job with a signature → photo only', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job({ allow_doorstep: 1 }));
        await expect(couriersSer.markDelivered(AHMAD, 12, { proofType: 'signature_digital', image: IMG }))
            .rejects.toThrow('photo only');
    });
    test('no doorstep with a photo → signature required', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job());
        await expect(couriersSer.markDelivered(AHMAD, 12, { proofType: 'photo', image: IMG }))
            .rejects.toThrow('signature required');
    });
    test('signed delivery → status, proof and history saved', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job());
        await couriersSer.markDelivered(AHMAD, 12, { proofType: 'signature_digital', image: IMG });
        expect(deliveriesDat.updateStatus).toHaveBeenCalledWith(12, 'out_for_delivery', 'delivered', AHMAD);
        expect(proofDat.addProof).toHaveBeenCalledWith(expect.objectContaining({ proofType: 'signature_digital', fileUrl: '/uploads/x.png' }));
        expect(historyDat.addStatus).toHaveBeenCalled();
        expect(paymentsDat.markCodCollected).not.toHaveBeenCalled();
    });
    test('COD delivered → cash marked collected', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job({ payment_method: 'cod' }));
        await couriersSer.markDelivered(AHMAD, 12, { proofType: 'signature_paper', image: IMG });
        expect(paymentsDat.markCodCollected).toHaveBeenCalledWith(12, AHMAD);
    });
});

describe('updateJobStatus: failed and returned', () => {
    test('failed without a reason → error', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job());
        await expect(couriersSer.updateJobStatus(AHMAD, 12, 'failed', '')).rejects.toThrow('reason');
    });
    test('failed on a doorstep job → leave it at the door', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job({ allow_doorstep: 1 }));
        await expect(couriersSer.updateJobStatus(AHMAD, 12, 'failed', 'Nobody home')).rejects.toThrow('Doorstep');
    });
    test('COD returned after 2 fails → half fee charged', async () => {
        deliveriesDat.getDeliveryDetail.mockResolvedValue(job({ status: 'failed', payment_method: 'cod' }));
        historyDat.countFailed.mockResolvedValue(2);
        await couriersSer.updateJobStatus(AHMAD, 12, 'returned');
        expect(paymentsDat.setReturnFee).toHaveBeenCalledWith(12, 10);
    });
});