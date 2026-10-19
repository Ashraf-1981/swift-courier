jest.mock('../servicesLayer/aiSer');
jest.mock('../dataLayer/knowledgeDat');
jest.mock('../dataLayer/deliveriesDat');

const aiSer = require('../servicesLayer/aiSer');
const knowledgeDat = require('../dataLayer/knowledgeDat');
const deliveriesDat = require('../dataLayer/deliveriesDat');
const assistantSer = require('../servicesLayer/assistantSer');

// tiny 2-number "embeddings" so the maths is easy to follow
const CHUNKS = [
    { title: 'Doorstep delivery', content: 'Door rule', embedding: [1, 0] },
    { title: 'Return fee', content: 'Fee rule', embedding: [0, 1] },
    { title: 'Payment methods', content: 'Pay rule', embedding: [0.7, 0.7] },
];

beforeEach(() => {
    knowledgeDat.getAllChunks.mockResolvedValue(CHUNKS);
    aiSer.embed.mockResolvedValue([1, 0]); // question "points" the same way as Doorstep
    aiSer.askText.mockResolvedValue('Fake answer');
    deliveriesDat.getDeliveriesByCustomer.mockResolvedValue([
        { tracking_no: 'SC-1', status: 'pending', pickup_zone: 'A', dropoff_zone: 'B', vehicle: 'Bike', total_fee: '10.00', payment_method: 'paynow', payment_status: 'unpaid' },
    ]);
});

describe('findClosest (RAG retrieve)', () => {
    test('most similar text comes first', async () => {
        const top = await assistantSer.findClosest('Can you leave it at my door?', 2);
        expect(top.map((t) => t.title)).toEqual(['Doorstep delivery', 'Payment methods']);
        expect(top[0].score).toBeCloseTo(1); // same direction = 1
    });
});

describe('ask (RAG generate)', () => {
    test('empty question → error', async () => {
        await expect(assistantSer.ask(2, '   ')).rejects.toThrow('Please type a question');
    });
    test('too long question → error', async () => {
        await expect(assistantSer.ask(2, 'a'.repeat(301))).rejects.toThrow('too long');
    });
    test('prompt has the retrieved texts and MY deliveries only', async () => {
        const res = await assistantSer.ask(2, 'Where is my parcel?');
        const prompt = aiSer.askText.mock.calls[0][1];
        expect(deliveriesDat.getDeliveriesByCustomer).toHaveBeenCalledWith(2);
        expect(prompt).toContain('Doorstep delivery: Door rule');
        expect(prompt).toContain('SC-1: pending');
        expect(res).toEqual({ answer: 'Fake answer', sources: ['Doorstep delivery', 'Payment methods', 'Return fee'] });
    });
});