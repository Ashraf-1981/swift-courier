// one-off: copy the laptop database dump (swift.sql) into the Aiven MySQL database
require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');

const DESKTOP = 'C:/Users/mdash/OneDrive/Desktop/';

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.AIVEN_HOST,
            port: process.env.AIVEN_PORT,
            user: 'avnadmin',
            password: process.env.AIVEN_PASSWORD,
            database: 'defaultdb',
            ssl: { ca: fs.readFileSync(DESKTOP + 'ca.pem') },
            multipleStatements: true, // the dump has many statements
        });

        // drop MariaDB-only lines (/*M! ... */), MySQL cannot read them
        const sql = fs.readFileSync(DESKTOP + 'swift.sql', 'utf8')
            .split('\n')
            .filter((line) => !line.startsWith('/*M!'))
            .join('\n')
            .replace(/CONSTRAINT `\d+` FOREIGN KEY/g, 'FOREIGN KEY'); // MySQL names them itself
        await conn.query(sql);

        const [tables] = await conn.query('SHOW TABLES');
        const [[users]] = await conn.query('SELECT COUNT(*) AS n FROM users');
        const [[chunks]] = await conn.query('SELECT COUNT(*) AS n FROM knowledge_chunks');
        console.log('TABLES:', tables.length, 'USERS:', users.n, 'CHUNKS:', chunks.n);
        await conn.end();
    } catch (err) {
        console.log('ERROR:', err.message);
    }
})();