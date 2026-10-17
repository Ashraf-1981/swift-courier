import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../apiClient';
import { STATUS, formatTime } from '../utils/deliveryStatus';

function TrackDelivery() {
    const { id } = useParams();
    const [d, setD] = useState(null); // d = one delivery (from deliveriesSer)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/deliveries/${id}`);
                setD(res.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError('Delivery not found');
                } else {
                    setError('Cannot load this delivery');
                }
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    async function handlePay() {
        setPayError('');
        setPaying(true);
        try {
            await api.post(`/deliveries/${id}/pay`);
            setD({ ...d, payment_status: 'paid' }); // show "Paid" without reloading
        } catch (err) {
            setPayError(err.response ? err.response.data.error : 'Cannot reach the server');
        } finally {
            setPaying(false);
        }
    }

    if (loading) return <div className="container-fluid px-4 py-5">Loading...</div>;

    if (error) {
        return (
            <div className="container-fluid px-4 py-5">
                <div className="alert alert-danger">{error}</div>
                <Link to="/my-deliveries">Back to My deliveries</Link>
            </div>
        );
    }

    const status = STATUS[d.status];

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: 800 }}>
            <Link to="/my-deliveries">← My deliveries</Link>

            <div className="d-flex justify-content-between align-items-start mt-3 mb-4">
                <h3 className="mb-0">{d.tracking_no}</h3>
                <span className={`badge bg-${status.color}`}>{status.label}</span>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <h6>Pickup</h6>
                    <p className="mb-0">{d.pickup_zone}</p>
                    <p className="small text-muted">{d.pickup_address}</p>

                    <h6>Drop-off</h6>
                    <p className="mb-0">{d.dropoff_zone}</p>
                    <p className="small text-muted mb-0">{d.dropoff_address}</p>
                </div>
            </div>

            <div className="card mb-3">
                <div className="card-body">
                    <p className="mb-1">Vehicle: {d.vehicle}</p>
                    <p className="mb-1">Pickup time: {formatTime(d.scheduled_pickup_at)}</p>
                    <p className="mb-1">Total: ${d.total_fee}</p>
                    {d.payment_method === 'cod' ? (
                        <p className="mb-0">Payment: Cash on delivery (receiver pays the courier)</p>
                    ) : d.payment_status === 'paid' ? (
                        <p className="mb-0">Payment: <span className="badge bg-success">Paid</span></p>
                    ) : (
                        <>
                            <p className="mb-2">Payment: <span className="badge bg-danger">Unpaid</span></p>
                            {payError && <div className="alert alert-danger py-2">{payError}</div>}
                            <button className="btn btn-primary" onClick={handlePay} disabled={paying}>
                                {paying ? 'Paying...' : `Pay $${d.total_fee}`}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Courier */}
            <div className="card mb-3">
                <div className="card-body">
                    <h6>Courier</h6>
                    {d.courier_name ? (
                        <>
                            <p className="mb-1">{d.courier_name}</p>
                            {d.courier_phone && (
                                <a href={`tel:${d.courier_phone}`} className="btn btn-outline-primary btn-sm">
                                    Call {d.courier_phone}
                                </a>
                            )}
                        </>
                    ) : (
                        <p className="text-muted mb-0">No courier assigned yet</p>
                    )}
                </div>
            </div>

            {/* Timeline (audit trail) */}
            <div className="card mb-3">
                <div className="card-body">
                    <h6>Timeline</h6>
                    <ul className="list-unstyled mb-0">
                        {d.history.map((h, i) => (
                            <li key={i} className="mb-2">
                                <span className={`badge bg-${STATUS[h.new_status].color} me-2`}>
                                    {STATUS[h.new_status].label}
                                </span>
                                <span className="small text-muted">{formatTime(h.created_at)}</span>
                                {h.note && <div className="small">{h.note}</div>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default TrackDelivery;