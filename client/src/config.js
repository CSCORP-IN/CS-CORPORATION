const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const rawBaseUrl = import.meta.env.VITE_API_URL ||
    (isLocalhost ? 'http://localhost:5000' : 'https://ankitchaudhary.onrender.com');

const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

export default API_BASE_URL;
