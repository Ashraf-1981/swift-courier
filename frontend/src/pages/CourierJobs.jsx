import { useEffect, useState } from 'react';
import api from '../apiClient';
import { STATUS, formatTime } from '../utils/deliveryStatus';
import SignaturePad from '../components/SignaturePad';

function CourierJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [myJobs, setMyJobs] = useState([]);
    const [proofJob, setProofJob] = useState(null); // job being marked delivered

    // load (or reload) the available jobs
    async function load() {
        const mine = await api.get('/couriers/my-jobs');
        setMyJobs(mine.data);
        try {
            const res = await api.get('/couriers/jobs');
            setJobs(res.data);
        } catch (err) {
            setError('Cannot load jobs');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleAccept(id) {
        setError('');
        setMessage('');
        try {
            await api.post(`/couriers/jobs/${id}/accept`);
            setMessage('Job accepted');
            load(); // the accepted job leaves this list
        } catch (err) {
            setError(err.response?.data?.error || 'Cannot accept job');
        }
    }

    async function handleStatus(id, status) {
        setError('');
        setMessage('');
        let reason;
        if (status === 'failed') {
            reason = window.prompt('Reason for failed delivery?');
            if (!reason) return; // courier cancelled
        }
        try {
            await api.post(`/couriers/jobs/${id}/status`, { status, reason });
            setMessage('Status updated');
            load();
        } catch (err) {
            setError(err.response?.data?.error || 'Cannot update status');
        }
    }

    // read the chosen picture as base64 text, then send it as proof
    function handleProofFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => sendProof(proofJob.allow_doorstep ? 'photo' : 'signature_paper', reader.result);
        reader.readAsDataURL(file);
    }

    async function sendProof(proofType, image) {
        setError('');
        setMessage('');
        try {
            await api.post(`/couriers/jobs/${proofJob.id}/delivered`, { proofType, image });
            setMessage('Delivered');
            setProofJob(null);
            load();
        } catch (err) {
            setError(err.response?.data?.error || 'Cannot mark delivered');
        }
    }

    if (loading) return <div className="container-fluid px-4 py-5">Loading...</div>;

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: 1000 }}>
            <h2 className="mb-4">My jobs</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            <h4 className="mt-2 mb-3">Jobs in hand</h4>
            {myJobs.length === 0 && <p>Nothing in hand.</p>}
            {myJobs.length > 0 && (
                <div className="table-responsive mb-5">
                    <table className="table align-middle">
                        <thead>
                            <tr className="table-secondary">
                                <th>Tracking no</th>
                                <th>Status</th>
                                <th>Pickup address</th>
                                <th>Drop-off address</th>
                                <th>Receiver</th>
                                <th>Payment</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myJobs.map((j) => (
                                <tr key={j.id}>
                                    <td>{j.tracking_no}</td>
                                    <td>{STATUS[j.status].label}</td>
                                    <td>{j.pickup_address}</td>
                                    <td>{j.dropoff_address}</td>
                                    <td>{j.dropoff_contact_name} · {j.dropoff_contact_phone}</td>
                                    <td>{j.payment_method === 'cod' ? `Collect $${j.total_fee}` : 'Paid'}</td>
                                    <td className="d-flex gap-2">
                                        {j.status === 'out_for_delivery' && (
                                            <button className="btn btn-success btn-sm" onClick={() => setProofJob(j)}>
                                                Delivered
                                            </button>
                                        )}
                                        {j.next.map((s) => (
                                            <button
                                                key={s}
                                                className={`btn btn-sm ${s === 'failed' ? 'btn-outline-danger' : 'btn-primary'}`}
                                                onClick={() => handleStatus(j.id, s)}
                                            >
                                                {STATUS[s].label}
                                            </button>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {proofJob && (
                <div className="card mb-5">
                    <div className="card-body">
                        <h6>Proof for {proofJob.tracking_no}</h6>
                        <p className="small text-muted">
                            {proofJob.allow_doorstep
                                ? 'Doorstep allowed: take a photo of the parcel at the door.'
                                : 'No doorstep: the receiver must sign.'}
                        </p>
                        {!proofJob.allow_doorstep && (
                            <>
                                <p className="mb-1">Receiver signs here:</p>
                                <SignaturePad onSave={(img) => sendProof('signature_digital', img)} />
                                    {/*Or sign on Paper on some cases */}
                                <p className="small text-muted mt-3 mb-1">Or upload a photo of the signed paper:</p>
                            </>
                        )}
                        {/* Choose File box */}
                        <input type="file" accept="image/png, image/jpeg" capture="environment"
                            className="form-control mb-2" onChange={handleProofFile} />
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setProofJob(null)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <h4 className="mb-3">Available jobs</h4>

            {jobs.length === 0 && <p>No jobs right now.</p>}

            {jobs.length > 0 && (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr className="table-secondary">
                                <th>Tracking no</th>
                                <th>Pickup</th>
                                <th>Drop-off</th>
                                <th>Vehicle</th>
                                <th>Pickup time</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((j) => (
                                <tr key={j.id}>
                                    <td>{j.tracking_no}</td>
                                    <td>{j.pickup_zone}</td>
                                    <td>{j.dropoff_zone}</td>
                                    <td>{j.vehicle}</td>
                                    <td>{formatTime(j.scheduled_pickup_at)}</td>
                                    <td>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleAccept(j.id)}>
                                            Accept
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CourierJobs;