// For courier

const { nextStatuses } = require('../servicesLayer/couriersSer');

// Business rule: which status a courier may move a job to next
describe('nextStatuses', () => {
    const myZones = [1, 2];

    test('normal job: assigned → picked_up only', () => {
        const job = { status: 'assigned', delivery_type_id: 1, dropoff_zone_id: 9 };
        expect(nextStatuses(job, myZones)).toEqual(['picked_up']);
    });

    test('4-Hour job: assigned → straight out_for_delivery', () => {
        const job = { status: 'assigned', delivery_type_id: 4, dropoff_zone_id: 9 };
        expect(nextStatuses(job, myZones)).toEqual(['out_for_delivery']);
    });

    test('picked up, drop-off NOT in my zones → warehouse only', () => {
        const job = { status: 'picked_up', delivery_type_id: 1, dropoff_zone_id: 9 };
        expect(nextStatuses(job, myZones)).toEqual(['at_warehouse']);
    });

    test('picked up, drop-off in my zones → warehouse or deliver now', () => {
        const job = { status: 'picked_up', delivery_type_id: 1, dropoff_zone_id: 2 };
        expect(nextStatuses(job, myZones)).toEqual(['at_warehouse', 'out_for_delivery']);
    });

    test('1st failed try → back to warehouse', () => {
        const job = { status: 'failed', delivery_type_id: 1, dropoff_zone_id: 2 };
        expect(nextStatuses(job, myZones, 1)).toEqual(['at_warehouse']);
    });

    test('2nd failed try → returned to sender', () => {
        const job = { status: 'failed', delivery_type_id: 1, dropoff_zone_id: 2 };
        expect(nextStatuses(job, myZones, 2)).toEqual(['returned']);
    });

    test('delivered job → nothing next', () => {
        const job = { status: 'delivered', delivery_type_id: 1, dropoff_zone_id: 2 };
        expect(nextStatuses(job, myZones)).toEqual([]);
    });
});