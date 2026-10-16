import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="container-fluid px-5 py-5">
            <h1 className="text-primary">Deliver anything, anywhere in Singapore</h1>
            <p className="lead">Fast deliveries across Singapore.</p>
            <Link to="/book" className="btn btn-primary">Book a delivery</Link>
        </div>
    );
}

export default Home;