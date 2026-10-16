import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
      <Link to="/" className="navbar-brand">Swift-Courier</Link>
      <div className="navbar-nav ms-auto">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Log in</Link>
      </div>
    </nav>
  );
}

export default Navbar;