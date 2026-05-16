/**
 * Native fetch API client — replaces Axios.
 * Same interface: api.get/post/put/delete all return { data }.
 */
import { API_BASE_URL } from '../utils/constants';

const getToken = () => localStorage.getItem('token');

/** Build full URL from endpoint */
const url = (endpoint, params) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = `${baseUrl}${cleanEndpoint}`;

  if (!params || !Object.keys(params).length) return base;
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return qs ? `${base}?${qs}` : base;
};

/** Parse response — throws on HTTP errors */
const parse = async (res) => {
  // Only auto-logout on 401 for non-auth endpoints (token expired, etc.)
  // Do NOT intercept 401 on login/register — let the component handle it
  const isAuthRoute = res.url?.includes('/auth/login') || res.url?.includes('/auth/register');

  if (res.status === 401 && !isAuthRoute) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login'; // Fixed: was '/login' which doesn't exist
    return new Promise(() => {}); // Stop execution
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;

  // Safety check for empty bodies (204) or failed parsing
  if (res.status !== 204 && res.status !== 205) {
    try {
      data = contentType.includes('application/json') ? await res.json() : await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
  // Pass the entire 'data' object so the UI can access data.errors
  const message = data?.message || `HTTP ${res.status}`;
  const error = new Error(message);
  error.response = { status: res.status, data }; // Attach full Laravel payload
  throw error;
}
  return { data };
};

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json', // <--- CRITICAL for Laravel
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const api = {
  get: (endpoint, params) => 
    fetch(url(endpoint, params), { headers: headers() }).then(parse),

  post: (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const fetchHeaders = isFormData ? {} : headers();
    
    if (isFormData && getToken()) {
      fetchHeaders.Authorization = `Bearer ${getToken()}`;
    }

    return fetch(url(endpoint), {
      method: 'POST', // <--- DOIT ÊTRE 'POST'
      headers: fetchHeaders,
      body: isFormData ? body : JSON.stringify(body)
    }).then(parse);
  },

  put: (endpoint, body) => {
    // Note : Pour l'upload d'images en PUT avec Laravel, 
    // il faut souvent utiliser POST avec _method: 'PUT'
    return fetch(url(endpoint), {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body)
    }).then(parse);
  },

  delete: (endpoint) => 
    fetch(url(endpoint), { method: 'DELETE', headers: headers() }).then(parse),
};
// Exemple d'upload de photo de profil
// const handlePhotoUpload = (id, fileInput) => {
//   if (fileInput && fileInput.files[0]) {
//     const file = fileInput.files[0];
//     const formData = new FormData();
//     formData.append('photo', file);
//     formData.append('_method', 'PUT');
//     api.post(`/Personnel/${id}`, formData)
//       .then(response => {
//         console.log('Photo uploadée:', response.data);
//       })
//       .catch(error => {
//         console.error('Erreur upload:', error);
//       });
//   }
// };

export default api;
