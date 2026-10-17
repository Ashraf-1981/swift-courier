import { useState } from 'react';
import { API_URL } from '../api';
import { useSetAtom } from 'jotai';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAtom } from '../atoms/authAtom';
import axios from 'axios';

function Login() {
    const location = useLocation(); // reads the note sent by navigate()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);
    const setAuth = useSetAtom(authAtom);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault(); // stop the browser reloading the page
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });

            setAuth(res.data);   // save tokens + user in the atom
            navigate('/');       // go to Home
        } catch (err) {

            if (err.response) {
                setError(err.response.data.error); // e.g. "Invalid email or password"
            } else {
                setError('Cannot reach the server'); // backend not running
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container-fluid px-4 py-5" style={{ maxWidth: 420 }}>
            <h2 className="mb-4">Log in</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log in'}
                </button>
            </form>
        </div>
    );
}

export default Login;