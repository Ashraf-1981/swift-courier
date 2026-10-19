// Deploy
// laptop (npm run dev): backend on port 3000; online: same server, so just /api
export const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';