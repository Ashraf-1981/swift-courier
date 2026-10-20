import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-dark text-white-50 px-3 px-md-5 py-3 mt-auto">
            <div className="row g-3 align-items-center">
                <div className="col-12 col-md-4 small">
                    © {new Date().getFullYear()} Swift-Courier
                </div>
                <div className="col-6 col-md-4">
                    <h6 className="text-white">Links</h6>
                    <Link to="/book" className="d-block small text-white-50 text-decoration-none">Book a delivery</Link>
                </div>
                <div className="col-6 col-md-4">
                    <h6 className="text-white">Contact</h6>
                    <p className="small mb-0">support@swift.com</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;