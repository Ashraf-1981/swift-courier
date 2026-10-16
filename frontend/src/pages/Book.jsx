import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api';
import { useAtomValue } from 'jotai';
import { authAtom } from '../atoms/authAtom';

function Book() {
    // lists from the backend
    const [types, setTypes] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // the user's selections
    const [deliveryTypeId, setDeliveryTypeId] = useState(null);
    const [pickupZoneId, setPickupZoneId] = useState('');
    const [dropoffZoneId, setDropoffZoneId] = useState('');
    const auth = useAtomValue(authAtom);
    const [pickupAddress, setPickupAddress] = useState('');
    const [pickupContactName, setPickupContactName] = useState(auth.user.name);   // pre-filled
    const [pickupContactPhone, setPickupContactPhone] = useState(auth.user.phone); // pre-filled
    const [dropoffAddress, setDropoffAddress] = useState('');
    const [dropoffContactName, setDropoffContactName] = useState('');
    const [dropoffContactPhone, setDropoffContactPhone] = useState('');
    const [instructions, setInstructions] = useState('');
    const [weightKg, setWeightKg] = useState('');
    const [lengthCm, setLengthCm] = useState('');
    const [widthCm, setWidthCm] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [extraStops, setExtraStops] = useState(0);
    const [scheduledPickupAt, setScheduledPickupAt] = useState('');

    // runs once when the page opens: load vehicles and zones
    useEffect(() => {
        async function loadLists() {
            try {
                const typesRes = await axios.get(`${API_URL}/delivery-types`);
                const zonesRes = await axios.get(`${API_URL}/zones`);
                setTypes(typesRes.data);
                setZones(zonesRes.data);

            } catch (err) {
                setError('Cannot load vehicles and areas');

            } finally {
                setLoading(false);
            }
        }
        loadLists();
    }, []);

    // the zones users picked (to show their warning notes)
    const pickupZone = zones.find((z) => z.id === Number(pickupZoneId));
    const dropoffZone = zones.find((z) => z.id === Number(dropoffZoneId));
    // the vehicle user picked (to show its limits)
    const selectedType = types.find((t) => t.id === deliveryTypeId);

    // earliest pickup = now, in the format the date picker needs: 'YYYY-MM-DDTHH:mm'
    const now = new Date();
    const minPickup = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    if (loading) return <div className="container-fluid px-4 py-5">Loading...</div>;
    if (error) return <div className="container-fluid px-4 py-5"><div className="alert alert-danger">{error}</div></div>;

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: 900 }}>
            <h2 className="mb-4">Book a delivery</h2>

            {/* 1. Vehicle */}
            <h5>1. Choose a vehicle</h5>
            <div className="row g-3 mb-4">
                {types.map((type) => (
                    <div className="col-6 col-md-4" key={type.id}>
                        <div
                            className={`card h-100 ${deliveryTypeId === type.id ? 'border-primary border-2' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setDeliveryTypeId(type.id)}
                        >
                            <div className="card-body">
                                <h6 className="card-title">{type.name}</h6>
                                <p className="small text-muted mb-1">{type.suitable_for}</p>
                                <p className="small mb-0">From ${type.base_fee} - max {type.max_weight_kg} kg</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Areas */}
            <h5>2. Pickup and drop-off area</h5>
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label">Pickup area</label>
                    <select className="form-select" value={pickupZoneId} onChange={(e) => setPickupZoneId(e.target.value)}>
                        <option value="">Choose...</option>
                        {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    {pickupZone && pickupZone.restricted_note && (
                        <small className="text-danger">⚠ {pickupZone.restricted_note}</small>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Drop-off area</label>
                    <select className="form-select" value={dropoffZoneId} onChange={(e) => setDropoffZoneId(e.target.value)}>
                        <option value="">Choose...</option>
                        {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    {dropoffZone && dropoffZone.restricted_note && (
                        <small className="text-danger">⚠ {dropoffZone.restricted_note}</small>
                    )}
                </div>
            </div>

            {/* 3. Addresses and contacts */}
            <h5>3. Addresses and contacts</h5>
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <h6 className="text-muted">Pickup</h6>
                    <input className="form-control mb-2" placeholder="Pickup address (block, street, unit)"
                        value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
                    <input className="form-control mb-2" placeholder="Contact name"
                        value={pickupContactName} onChange={(e) => setPickupContactName(e.target.value)} />
                    <input className="form-control" type="tel" placeholder="Contact phone (8 digits)"
                        value={pickupContactPhone} onChange={(e) => setPickupContactPhone(e.target.value)} />
                </div>

                <div className="col-md-6">
                    <h6 className="text-muted">Drop-off</h6>
                    <input className="form-control mb-2" placeholder="Drop-off address (block, street, unit)"
                        value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} />
                    <input className="form-control mb-2" placeholder="Receiver name"
                        value={dropoffContactName} onChange={(e) => setDropoffContactName(e.target.value)} />
                    <input className="form-control" type="tel" placeholder="Receiver phone (8 digits)"
                        value={dropoffContactPhone} onChange={(e) => setDropoffContactPhone(e.target.value)} />
                </div>

                <div className="col-12">
                    <textarea className="form-control" rows="2"
                        placeholder="Instructions for the courier (optional), e.g. call when downstairs, loading bay at the back"
                        value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                </div>
            </div>

            {/* 4. Parcel and pickup time */}
            <h5>4. Parcel and pickup time</h5>
            <div className="row g-3 mb-2">
                <div className="col-6 col-md-3">
                    <label className="form-label">Weight (kg)</label>
                    <input type="number" min="0.1" step="0.1" className="form-control"
                        value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                    <label className="form-label">Length (cm)</label>
                    <input type="number" min="1" className="form-control"
                        value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                    <label className="form-label">Width (cm)</label>
                    <input type="number" min="1" className="form-control"
                        value={widthCm} onChange={(e) => setWidthCm(e.target.value)} />
                </div>
                <div className="col-6 col-md-3">
                    <label className="form-label">Height (cm)</label>
                    <input type="number" min="1" className="form-control"
                        value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                </div>
            </div>

            {selectedType && (
                <p className="small text-muted mb-3">
                    {selectedType.name} fits up to {selectedType.max_weight_kg} kg and{' '}
                    {selectedType.max_length_cm} × {selectedType.max_width_cm} × {selectedType.max_height_cm} cm.
                    Bigger parcels are moved to the next vehicle that fits.
                </p>
            )}

            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <label className="form-label">Extra stops</label>
                    <input type="number" min="0" max="5" className="form-control"
                        value={extraStops} onChange={(e) => setExtraStops(e.target.value)} />
                </div>
                <div className="col-12 col-md-5">
                    <label className="form-label">Pickup time</label>
                    <input type="datetime-local" min={minPickup} className="form-control"
                        value={scheduledPickupAt} onChange={(e) => setScheduledPickupAt(e.target.value)} />
                </div>
            </div>
        </div>
    );
}

export default Book;