import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../apiClient';
import { STATUS, formatTime } from '../utils/deliveryStatus';

function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/deliveries');
        setDeliveries(res.data);
      } catch (err) {
        setError('Cannot load your deliveries');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="container-fluid px-4 py-5">Loading...</div>;

  return (
    <div className="container-fluid px-4 py-5" style={{ maxWidth: 800 }}>
      <h2 className="mb-4">My deliveries</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && deliveries.length === 0 && (
        <p>
          No deliveries yet. <Link to="/book">Book your first one</Link>
        </p>
      )}

      {deliveries.map((d) => {
        const status = STATUS[d.status];
        return (
          <div className="card mb-3" key={d.id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h6 className="mb-1">{d.tracking_no}</h6>
                <span className={`badge bg-${status.color}`}>{status.label}</span>
              </div>
              <p className="mb-1">{d.pickup_zone} → {d.dropoff_zone}</p>
              <p className="small text-muted mb-0">
                {d.vehicle} - pickup {formatTime(d.scheduled_pickup_at)} - ${d.total_fee}
                {d.payment_method === 'cod' ? ' - cash on delivery' : ` - ${d.payment_status}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MyDeliveries;