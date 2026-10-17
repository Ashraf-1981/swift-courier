import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../apiClient';
import { STATUS, formatTime } from '../utils/deliveryStatus';

function TrackDelivery() {
  const { id } = useParams(); 
  const [d, setD] = useState(null); // d = one delivery (from deliveriesSer)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/deliveries/${id}`);
        setD(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Delivery not found'); // not hers, or doesn't exist
        } else {
          setError('Cannot load this delivery');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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
          <p className="mb-0">
            Payment: {d.payment_method === 'cod' ? 'Cash on delivery' : d.payment_status}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TrackDelivery;