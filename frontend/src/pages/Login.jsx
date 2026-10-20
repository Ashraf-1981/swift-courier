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

            // admin has its own dashboard (EJS), not this site
            if (res.data.user.role === 'admin') {
                setError('Admins log in at /admin/login');
                return;
            }
            setAuth(res.data);   // save tokens + user in the atom
            // courier → jobs page, others → Home
            navigate(res.data.user.role === 'courier' ? '/courier/jobs' : '/');
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
        <div className="d-flex justify-content-center align-items-center flex-grow-1 px-3 py-5">
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: 400 }}>
                <h1 className="h4 mb-3 text-center">Log in</h1>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="form-control mb-2"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="btn btn-dark w-100" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );

}

export default Login;