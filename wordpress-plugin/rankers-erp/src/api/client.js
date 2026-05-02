import axios from 'axios';

const BASE = window.rankersERP?.apiBase || '/wp-json/rankers/v1';

export function getToken() { return localStorage.getItem('rankers_token'); }
export function setToken(t) { localStorage.setItem('rankers_token', t); }
export function clearToken() { localStorage.removeItem('rankers_token'); }

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
    const t = getToken();
    if (t) cfg.headers['X-Rankers-Token'] = t;
    return cfg;
});

api.interceptors.response.use(
    r => r,
    err => {
        if (err.response?.status === 401) { clearToken(); window.location.reload(); }
        return Promise.reject(err);
    }
);
