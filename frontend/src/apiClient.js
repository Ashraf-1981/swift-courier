// Refresh secretly, so the user doesn't have to log in again when the access token expires

import axios from 'axios';
import { getDefaultStore } from 'jotai';
import { API_URL } from './api';
import { authAtom } from './atoms/authAtom';

const store = getDefaultStore(); // lets this file read/write authAtom outside a page
const api = axios.create({ baseURL: API_URL });

// 1. Before every request: add the access token
api.interceptors.request.use((config) => {
  const auth = store.get(authAtom);
  if (auth) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// 2. After every answer: if 401, refresh once and retry
api.interceptors.response.use(
  (res) => res, // OK → pass it on
  async (err) => {
    const original = err.config;
    const auth = store.get(authAtom);

    if (err.response && err.response.status === 401 && auth && !original._retried) {
      original._retried = true; // only once, no endless loop
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: auth.refreshToken });
        store.set(authAtom, { ...auth, accessToken: res.data.accessToken }); // save the new one
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(original); // retry the same request
      } catch {
        store.set(authAtom, null); // refresh token dead too → logged out
      }
    }
    return Promise.reject(err);
  }
);

export default api;