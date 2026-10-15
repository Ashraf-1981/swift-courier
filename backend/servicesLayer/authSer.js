
// login	Check email + password, create the access and refresh tokens
// refresh	Give a new access token using the refresh token
// logout	Blacklist the refresh token

const bcrypt = require('bcrypt');
const usersDat = require('../dataLayer/usersDat');

/**
 * Business rules: register
 * 1. All fields required, password at least 8 characters
 * 2. Email must not be taken
 * 3. Password is hashed, never saved as plain text
 * 4. Public sign-up is always a customer (no one can register as admin)
 */
async function register({ name, email, phone, password }) {
    if (!name || !email || !phone || !password) {
        throw new Error('All fields are required');
    }

    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
    }

    const existing = await usersDat.getUserByEmail(email);
    if (existing) {
        throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const id = await usersDat.createUser({
        name, email, phone, passwordHash, role: 'customer',
    });

    return usersDat.getUserById(id); // without password_hash
}

module.exports = { register };