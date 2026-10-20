import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api';
import api from '../apiClient';
import { useAtomValue } from 'jotai';
import { authAtom } from '../atoms/authAtom';
import ZoneSelect from '../components/ZoneSelect';

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
    const [quote, setQuote] = useState(null);
    const [quoteError, setQuoteError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [allowDoorstep, setAllowDoorstep] = useState(false);
    const [collectBack, setCollectBack] = useState(false);
    const [collectBackNote, setCollectBackNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [booked, setBooked] = useState(null);

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

    // get a new price whenever a price-related field changes
    useEffect(() => {
        const ready = deliveryTypeId && pickupZoneId && dropoffZoneId && weightKg && lengthCm && widthCm && heightCm;
        if (!ready) {
            setQuote(null);
            setQuoteError('');
            return;
        }

        async function getQuote() {
            try {
                const res = await axios.get(`${API_URL}/fee`, {
                    params: {
                        type: deliveryTypeId,
                        pickup: pickupZoneId,
                        dropoff: dropoffZoneId,
                        weight: weightKg,
                        length: lengthCm,
                        width: widthCm,
                        height: heightCm,
                        stops: extraStops,
                        collect: collectBack,
                        time: scheduledPickupAt || undefined, // empty → backend uses "now"
                    },
                });
                setQuote(res.data);
                setQuoteError('');
            } catch (err) {
                setQuote(null);
                setQuoteError(err.response ? err.response.data.error : 'Cannot get a price');
            }
        }
        getQuote();
    }, [deliveryTypeId, pickupZoneId, dropoffZoneId, weightKg, lengthCm, widthCm, heightCm, extraStops, scheduledPickupAt, collectBack]);

    // the vehicle user picked (to show its limits)
    const selectedType = types.find((t) => t.id === deliveryTypeId);

    // earliest pickup = now, in the format the date picker needs: 'YYYY-MM-DDTHH:mm'
    const now = new Date();
    const minPickup = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    // Business rule: COD blocks doorstep
    function choosePayment(method) {
        setPaymentMethod(method);
        if (method === 'cod') setAllowDoorstep(false);
    }

    async function handleBook() {
        setSubmitError('');
        setSubmitting(true);
        try {
            const res = await api.post(
                '/deliveries',
                {
                    deliveryTypeId, pickupZoneId, dropoffZoneId,
                    pickupAddress, pickupContactName, pickupContactPhone,
                    dropoffAddress, dropoffContactName, dropoffContactPhone,
                    instructions, weightKg, lengthCm, widthCm, heightCm, extraStops,
                    scheduledPickupAt, paymentMethod, allowDoorstep, collectBack, collectBackNote,
                },
            );
            setBooked(res.data);
        } catch (err) {
            setSubmitError(err.response ? err.response.data.error : 'Cannot reach the server');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="container-fluid px-4 py-5">Loading...</div>;
    if (error) return <div className="container-fluid px-4 py-5"><div className="alert alert-danger">{error}</div></div>;
    // after booking: show the tracking number
    if (booked) {
        return (
            <div className="container-fluid px-4 py-5" style={{ maxWidth: 600 }}>
                <div className="alert alert-success">
                    <h4 className="alert-heading">Booked!</h4>
                    <p className="mb-1">Tracking number: <strong>{booked.tracking_no}</strong></p>
                    <p className="mb-0">Total: ${booked.total_fee}</p>
                </div>
            </div>
        );
    }

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
                <ZoneSelect label="Pickup area" zones={zones} value={pickupZoneId} onChange={setPickupZoneId} />
                <ZoneSelect label="Drop-off area" zones={zones} value={dropoffZoneId} onChange={setDropoffZoneId} />
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

            {/* 5. Price */}
            <h5>5. Price</h5>
            <div className="card mb-4">
                <div className="card-body">
                    {!quote && !quoteError && (
                        <p className="text-muted mb-0">Fill in vehicle, areas and parcel size to see the price.</p>
                    )}

                    {quoteError && <div className="alert alert-danger mb-0">{quoteError}</div>}

                    {quote && (
                        <>
                            {quote.vehicle.upgraded && (
                                <div className="alert alert-warning">
                                    Your parcel doesn't fit the vehicle you chose, so it's moved to{' '}
                                    <strong>{quote.vehicle.suggested}</strong>.
                                </div>
                            )}
                            <table className="table table-sm mb-0">
                                <tbody>
                                    <tr><td>Base fee ({quote.vehicle.suggested})</td><td className="text-end">${quote.fee.base_fee.toFixed(2)}</td></tr>
                                    <tr><td>Distance ({quote.fee.distance_km} km)</td><td className="text-end">${quote.fee.distance_fee.toFixed(2)}</td></tr>
                                    <tr><td>Extra stops</td><td className="text-end">${quote.fee.stops_fee.toFixed(2)}</td></tr>
                                    <tr><td>Surcharges</td><td className="text-end">${quote.fee.surcharge_total.toFixed(2)}</td></tr>
                                    {quote.fee.collect_back_fee > 0 && (
                                        <tr className="text-muted">
                                            <td>Collect-back (charged only after collection)</td>
                                            <td className="text-end">${quote.fee.collect_back_fee.toFixed(2)}</td>
                                        </tr>
                                    )}
                                    <tr className="fw-bold"><td>Total</td><td className="text-end">${quote.fee.total_fee.toFixed(2)}</td></tr>
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>

            {/* 6. Payment and options */}
            <h5>6. Payment and options</h5>
            <div className="mb-3">
                {[
                    { value: 'cod', label: 'Cash on delivery (receiver pays the courier)' },
                    { value: 'paynow', label: 'PayNow' },
                    { value: 'credit_card', label: 'Credit card' },
                ].map((m) => (
                    <div className="form-check" key={m.value}>
                        <input className="form-check-input" type="radio" id={m.value}
                            checked={paymentMethod === m.value} onChange={() => choosePayment(m.value)} />
                        <label className="form-check-label" htmlFor={m.value}>{m.label}</label>
                    </div>
                ))}
            </div>

            <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="doorstep"
                    checked={allowDoorstep} disabled={paymentMethod === 'cod'}
                    onChange={(e) => setAllowDoorstep(e.target.checked)} />
                <label className="form-check-label" htmlFor="doorstep">
                    Put at doorstep if the receiver is not there
                    {paymentMethod === 'cod' && <span className="text-muted"> (not for cash on delivery)</span>}
                </label>
            </div>

            <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="collect"
                    checked={collectBack} onChange={(e) => setCollectBack(e.target.checked)} />
                <label className="form-check-label" htmlFor="collect">
                    Collect an item back from the receiver
                </label>
            </div>
            {collectBack && (
                <input className="form-control mb-3" placeholder="What to collect, e.g. old printer"
                    value={collectBackNote} onChange={(e) => setCollectBackNote(e.target.value)} />
            )}

            {submitError && <div className="alert alert-danger mt-3">{submitError}</div>}

            <button className="btn btn-primary btn-lg w-100 mt-3"
                disabled={submitting || !quote} onClick={handleBook}>
                {submitting ? 'Booking...' : 'Book now'}
            </button>
        </div>
    );
}

export default Book;