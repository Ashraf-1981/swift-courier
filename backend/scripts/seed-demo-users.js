require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../db');

// demo accounts for the assessors; password comes from .env, never from git
const PASSWORD = process.env.DEMO_PASSWORD;

const USERS = [
    // normal couriers: fixed zones
    { name: 'Ahmad', email: 'ahmad@swift.com', role: 'courier', zones: ['Raffles Place', 'Orchard', 'Sentosa'] },
    { name: 'Ali', email: 'ali@swift.com', role: 'courier', zones: ['Yishun', 'Woodlands', 'Hougang'] },
    { name: 'Sam', email: 'sam@swift.com', role: 'courier', zones: ['Tuas', 'Jurong Island', 'Choa Chu Kang'] },
    { name: 'Sally', email: 'sally@swift.com', role: 'courier', zones: ['Tampines', 'Changi Cargo Complex'] },
    // 4-hour couriers: island-wide
    { name: 'Bernard', email: 'bernard@swift.com', role: 'courier', express: true },
    { name: 'John', email: 'john@swift.com', role: 'courier', express: true },
    { name: 'Ash', email: 'ash@swift.com', role: 'courier', express: true },
    // customers
    { name: 'Siti', email: 'siti@swift.com', role: 'customer' },
    { name: 'Tom', email: 'tom@swift.com', role: 'customer' },
];

(async () => {
    if (!PASSWORD) {
        console.log('Set DEMO_PASSWORD in .env first');
        process.exit(1);
    }
    const hash = await bcrypt.hash(PASSWORD, 10);

    for (const u of USERS) {
        // keep existing users (their deliveries stay linked), only add new ones
        let [rows] = await db.query('SELECT id FROM users WHERE email = ?', [u.email]);
        let id = rows[0] && rows[0].id;
        if (!id) {
            const [result] = await db.query(
                'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
                [u.name, u.email, '91234567', hash, u.role],
            );
            id = result.insertId;
            console.log('Created:', u.email);
        } else {
            await db.query('UPDATE users SET password_hash = ?, role = ? WHERE id = ?', [hash, u.role, id]);
            console.log('Exists, password reset:', u.email);
        }

        if (u.role !== 'courier') continue;

        // express = 4-Hour, island-wide (no zones); normal = fixed zones
        await db.query('UPDATE users SET is_express = ? WHERE id = ?', [u.express ? 1 : 0, id]);
        await db.query('DELETE FROM courier_zones WHERE courier_id = ?', [id]);
        for (const zoneName of u.zones || []) {
            const [z] = await db.query('SELECT id FROM zones WHERE name = ?', [zoneName]);
            if (!z[0]) { console.log('  Zone not found:', zoneName); continue; }
            await db.query('INSERT INTO courier_zones (courier_id, zone_id) VALUES (?, ?)', [id, z[0].id]);
        }
        console.log('  Zones:', u.express ? 'express (island-wide)' : u.zones.join(', '));
    }
    process.exit();
})();