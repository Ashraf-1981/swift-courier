jest.mock('../dataLayer/usersDat');
jest.mock('../dataLayer/blacklistDat');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersDat = require('../dataLayer/usersDat');
const blacklistDat = require('../dataLayer/blacklistDat');
const authSer = require('../servicesLayer/authSer');

// test-only secrets, never the real ones
process.env.TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

let siti;
beforeAll(async () => {
    siti = { id: 3, name: 'Siti', email: 'siti@swift.com', role: 'customer', password_hash: await bcrypt.hash('password123', 10) };
});

beforeEach(() => {
    usersDat.getUserByEmail.mockImplementation(async (email) => (email === siti.email ? siti : undefined));
    usersDat.getUserById.mockResolvedValue({ id: 3, name: 'Siti', role: 'customer' });
    usersDat.createUser.mockResolvedValue(10);
    blacklistDat.findToken.mockResolvedValue(undefined);
});

describe('register', () => {
    test('short password → error', async () => {
        await expect(authSer.register({ name: 'A', email: 'a@x.com', phone: '1', password: '123' }))
            .rejects.toThrow('at least 8 characters');
    });
    test('email taken → error', async () => {
        await expect(authSer.register({ name: 'A', email: 'siti@swift.com', phone: '1', password: 'password123' }))
            .rejects.toThrow('Email already registered');
    });
    test('always saved as customer, password hashed', async () => {
        await authSer.register({ name: 'New', email: 'new@x.com', phone: '1', password: 'password123', role: 'admin' });
        const saved = usersDat.createUser.mock.calls[0][0];
        expect(saved.role).toBe('customer');
        expect(saved.passwordHash).not.toBe('password123');
    });
});

describe('login', () => {
    test('wrong email and wrong password give the SAME error', async () => {
        await expect(authSer.login({ email: 'nobody@x.com', password: 'password123' })).rejects.toThrow('Invalid email or password');
        await expect(authSer.login({ email: 'siti@swift.com', password: 'wrong' })).rejects.toThrow('Invalid email or password');
    });
    test('right password → tokens with id and role only', async () => {
        const res = await authSer.login({ email: 'siti@swift.com', password: 'password123' });
        const payload = jwt.verify(res.accessToken, 'test-access-secret');
        expect(payload.id).toBe(3);
        expect(payload.role).toBe('customer');
        expect(payload.password_hash).toBeUndefined();
    });
});

describe('refresh', () => {
    test('valid refresh token → new access token', async () => {
        const { refreshToken } = await authSer.login({ email: 'siti@swift.com', password: 'password123' });
        const res = await authSer.refresh(refreshToken);
        expect(jwt.verify(res.accessToken, 'test-access-secret').id).toBe(3);
    });
    test('logged-out (blacklisted) token → blocked', async () => {
        const { refreshToken } = await authSer.login({ email: 'siti@swift.com', password: 'password123' });
        blacklistDat.findToken.mockResolvedValue({ id: 1 });
        await expect(authSer.refresh(refreshToken)).rejects.toThrow('Session expired');
    });
    test('fake token → blocked', async () => {
        await expect(authSer.refresh('not-a-real-token')).rejects.toThrow('Session expired');
    });
});