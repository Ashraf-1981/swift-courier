import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

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
    </div>
  );
}

export default Book;