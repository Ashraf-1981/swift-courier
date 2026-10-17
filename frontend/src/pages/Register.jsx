import { useState } from 'react';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

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

            <button className="btn btn-primary">Sign up</button>
        </div>
    );
}

export default Register;