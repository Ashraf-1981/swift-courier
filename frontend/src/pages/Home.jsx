import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api';

// one service column in the popup (standard or 4-hour)
function ServiceDetails({ title, service }) {
    if (!service) return null;
    return (
        <div className="col-12 col-md-6">
            <h6 className="text-primary">{title}</h6>
            <table className="table table-sm small">
                <tbody>
                    <tr><td>Base fee</td><td>${service.base_fee}</td></tr>
                    <tr><td>Per km</td><td>${service.per_km_rate}</td></tr>
                    <tr><td>Extra stop</td><td>+${service.extra_stop_fee}</td></tr>
                    <tr><td>Collect back</td><td>+${service.collect_back_fee}</td></tr>
                    <tr><td>Weight limit</td><td>Up to {service.max_weight_kg} kg</td></tr>
                    <tr><td>Size (L x W x H)</td><td>{service.max_length_cm} x {service.max_width_cm} x {service.max_height_cm} cm</td></tr>
                    <tr><td>Delivery time</td><td>{service.delivery_window_hours ? `Within ${service.delivery_window_hours} hours` : 'Same day'}</td></tr>
                    <tr><td>Suitable for</td><td>{service.suitable_for}</td></tr>
                    <tr><td>Remarks</td><td>{service.remarks}</td></tr>
                </tbody>
            </table>
        </div>
    );
}

function Home() {
    const [types, setTypes] = useState([]);
    const [selected, setSelected] = useState(null); // vehicle shown in the popup

    // load vehicles once when the page opens
    useEffect(() => {
        axios.get(`${API_URL}/delivery-types`)
            .then((res) => setTypes(res.data))
            .catch(() => setTypes([])); // home still works without them
    }, []);

    // 3 vehicles, each with its standard and 4-hour service
    const vehicles = ['Bike', 'Car', 'Van'].map((name) => ({
        name,
        standard: types.find((t) => t.name === name),
        express: types.find((t) => t.name === `4-Hour ${name}`),
    }));

    return (
        <div className="container-fluid px-3 px-md-5 py-5">
            <h1 className="text-primary">Deliver anything, anywhere in Singapore</h1>
            <p className="lead">Fast deliveries across Singapore.</p>
            <Link to="/book" className="btn btn-primary mb-5">Book a delivery</Link>

            <h3 className="mb-3">Our vehicles</h3>
            <div className="row g-3">
                {types.length > 0 && vehicles.map((v) => (
                    <div className="col-12 col-md-4" key={v.name}>
                        <div className="text-center" style={{ cursor: 'pointer' }} onClick={() => setSelected(v)}>
                            <img src={`/vehicles/${v.name.toLowerCase()}.jpg`} alt={v.name}
                                className="img-fluid"
                                style={{ height: 140, objectFit: 'contain', mixBlendMode: 'multiply' }} />
                            <h6 className="mt-2">{v.name}</h6>
                        </div>
                    </div>
                ))}
            </div>
            {selected && (
                <>
                    <div className="modal d-block" tabIndex="-1" onClick={() => setSelected(null)}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{selected.name}</h5>
                                    <button type="button" className="btn-close" onClick={() => setSelected(null)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <ServiceDetails title="Standard" service={selected.standard} />
                                        <ServiceDetails title="4-Hour Express" service={selected.express} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <Link to="/book" className="btn btn-primary">Book a {selected.name}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show"></div>
                </>
            )}
        </div>
    );
}

export default Home;