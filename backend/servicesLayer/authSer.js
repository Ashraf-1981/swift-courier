const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersDat = require('../dataLayer/usersDat');
const blacklistDat = require('../dataLayer/blacklistDat');

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

/**
 * Business rules: login
 * 1. Same error for wrong email or wrong password (don't tell hackers which one)
 * 2. Access token: 30 min, refresh token: 7 days
 * 3. Token only carries id and role, never the password
 */
async function login({ email, password }) {
    const user = await usersDat.getUserByEmail(email);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        throw new Error('Invalid email or password');
    }

    const payload = { id: user.id, role: user.role };

    const accessToken = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return {
        accessToken,
        refreshToken,
        user: await usersDat.getUserById(user.id), // without password_hash
    };
}

/**
 * Business rules: refresh
 * 1. It must be signed with REFRESH_TOKEN_SECRET and not expired
 * 2. A logged-out token (on the blacklist) is blocked
 * 3. Gives only a new access token (30 min), with the same id and role
 */
async function refresh(refreshToken) {
    if (!refreshToken) {
        throw new Error('Please log in again');
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new Error('Session expired, please log in again');
    }

    const blocked = await blacklistDat.findToken(refreshToken);
    if (blocked) {
        throw new Error('Session expired, please log in again');
    }

    // If (!blocked)
    const accessToken = jwt.sign(
        { id: payload.id, role: payload.role },
        process.env.TOKEN_SECRET,
        { expiresIn: '30m' }
    );

    return { accessToken };
}

/**
 * Business rules: logout
 * 1. Fake or expired token: nothing to block, still "logged out"
 * 2. Real token: save it on the blacklist until its own expiry date
 * 3. Logging out twice doesn't save it twice
 */
async function logout(refreshToken) {
    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return { message: 'Logged out' }; // token already useless
    }

    const alreadyBlocked = await blacklistDat.findToken(refreshToken);
    if (!alreadyBlocked) {
        await blacklistDat.addToken({
            token: refreshToken,
            expiresAt: new Date(payload.exp * 1000),
        });
    }

    return { message: 'Logged out' };
}

module.exports = { register, login, refresh, logout };