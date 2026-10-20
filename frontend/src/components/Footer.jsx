import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-dark text-white-50 px-3 px-md-5 py-3 mt-auto">
            <div className="row g-3 align-items-center">
                <div className="col-12 col-md-4 small text-center text-md-start">
                    © {new Date().getFullYear()} Swift-Courier
                </div>
                <div className="col-6 col-md-4 text-center">
                    <h6 className="text-white">Links</h6>
                    <Link to="/book" className="d-block small text-white-50 text-decoration-none">Book a delivery</Link>
                </div>
                <div className="col-6 col-md-4 text-center text-md-end">
                    <h6 className="text-white">Contact</h6>
                    {/* Clicking opens the user’s email app */}
                    <a href="mailto:support@swift.com" className="small text-white-50 text-decoration-none">support@swift.com</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;