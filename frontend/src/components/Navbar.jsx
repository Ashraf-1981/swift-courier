import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import axios from 'axios';
import { API_URL } from '../api';
import { authAtom } from '../atoms/authAtom';

function Navbar() {
    const [auth, setAuth] = useAtom(authAtom); // read AND write
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await axios.post(`${API_URL}/auth/logout`, { refreshToken: auth.refreshToken });
        } catch (err) {
            // server unreachable: still log out on this browser
        } finally {
            setAuth(null);        // clear the atom + localStorage
            navigate('/login');
        }
    }

    return (
        <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
            <Link to="/" className="navbar-brand">Swift-Courier</Link>
            <div className="navbar-nav ms-auto">
                <Link to="/" className="nav-link">Home</Link>
                {auth ? (
                    <>
                        <span className="nav-link">Hi {auth.user.name}</span>
                        <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                            Log out
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="nav-link">Log in</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;