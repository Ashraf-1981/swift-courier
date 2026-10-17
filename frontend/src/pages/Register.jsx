import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleRegister() {
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, { name, email, phone, password });
            navigate('/login', { state: { message: 'Account created. Please log in.' } });
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error); // e.g. "Email already registered"
            } else {
                setError('Cannot reach the server'); // backend not running
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container-fluid px-4 py-5">
            <h2>Sign up</h2>
            <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" className="form-control"
                    value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control"
                    value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="mb-3">
                <label className="form-label">Password (at least 8 characters)</label>
                <input type="password" className="form-control"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
                {loading ? 'Signing up...' : 'Sign up'}
            </button>
        </div>
    );
}

export default Register;