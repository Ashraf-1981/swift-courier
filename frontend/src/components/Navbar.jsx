import { Link } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { authAtom } from '../atoms/authAtom';

function Navbar() {
    const auth = useAtomValue(authAtom);
    return (
        <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
            <Link to="/" className="navbar-brand">Swift-Courier</Link>
            <div className="navbar-nav ms-auto">
                <Link to="/" className="nav-link">Home</Link>
                {auth ? (
                    <span className="nav-link">Hi {auth.user.name}</span>
                ) : (
                    <Link to="/login" className="nav-link">Log in</Link>
                )}
            </div>
        </nav>
    );
}

export default Navbar;