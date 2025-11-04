import axios from 'axios';
const base = process.env.NEXT_PUBLIC_API_BASE;
export const api = axios.create({ baseURL: base });
export const subscribeNewsletter = (email) => api.post('/api/newsletter/subscribe', { email });
export const worldClock = ({ q = '', sort = 'country', dir = 'asc', limit = 100, offset = 0, country, tz } = {}) =>
  api.get('/api/worldclock', { params: { q, sort, dir, limit, offset, country, tz } })
    .then(r => r.data);
export const worldClockDiff = (baseTz) => api.get('/api/worldclock/diff', { params: { base: baseTz } });
export const fetchClocks = (token) => api.get('/api/clocks', { headers: { Authorization: `Bearer ${token}` } });
export const createClock = (token, body) => api.post('/api/clocks', body, { headers: { Authorization: `Bearer ${token}` } });
export const updateClock = (token, id, body) => api.put(`/api/clocks/${id}`, body, { headers: { Authorization: `Bearer ${token}` } });
export const deleteClock = (token, id) => api.delete(`/api/clocks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
// ----- DST -----
export const fetchDST = ({
  q = '',
  sort = 'country',
  dir = 'asc',
  limit = 100,
  offset = 0,
  country,
  tz,
  active = false,
} = {}) =>
  api
    .get('/api/dst', { params: { q, sort, dir, limit, offset, country, tz, active } })
    .then((r) => r.data);

// ----- Events -----
export const fetchEvents = (token) =>
  api.get('/api/events', { headers: { Authorization: `Bearer ${token}` } });

export const createEvent = (token, body) =>
  api.post('/api/events', body, { headers: { Authorization: `Bearer ${token}` } });

export const deleteEvent = (token, id) =>
  api.delete(`/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export async function downloadEventPDF(token, id) {
  const res = await api.get(`/api/events/${id}/pdf`, {
    responseType: 'blob',
    headers: { Authorization: `Bearer ${token}` },
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `event-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadEventICS(token, id) {
  const res = await api.get(`/api/events/${id}/ics`, {
    responseType: 'blob',
    headers: { Authorization: `Bearer ${token}` },
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `event-${id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// NEW: create/disable share link via backend (uses baseURL)
export const createShareLink = (token, id, { expiresInDays = 30 } = {}) =>
  api.post(`/api/events/${id}/share`, { enable: true, expiresInDays }, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.data);

export const disableShareLink = (token, id) =>
  api.delete(`/api/events/${id}/share`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.data);

// ----- Timers -----
export const fetchTimers = (token) => api.get('/api/timers', { headers: { Authorization: `Bearer ${token}` } });
export const createTimer = (token, body) => api.post('/api/timers', body, { headers: { Authorization: `Bearer ${token}` } });
export const deleteTimer = (token, id) => api.delete(`/api/timers/${id}`, { headers: { Authorization: `Bearer ${token}` } });


// --- Admin helpers ---
export async function adminStats(token) {
  const { data } = await api.get('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data };
}

export async function adminRequests(token) {
  const { data } = await api.get('/api/admin/requests', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data };
}

export async function adminApproveReq(token, id) {
  const { data } = await api.post(`/api/admin/requests/${id}/approve`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data };
}

export async function adminRejectReq(token, id) {
  const { data } = await api.post(`/api/admin/requests/${id}/reject`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data };
}

export async function adminUnapproveReq(token, id) {
  const { data } = await api.post(`/api/admin/requests/${id}/unapprove`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data };
}

export async function adminSendNewsletter(token, payload) {
  const { data } = await api.post('/api/admin/newsletter/send', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data };
}

export async function adminListUsers(token, { page = 1, limit = 10, q = '' } = {}) {
  const { data } = await api.get('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit, q },
  });
  return { data };
}
// Public: submit contact form
export const submitContact = (payload) =>
  api.post('/api/contact', payload);

// Admin: list & delete contacts
export async function adminListContacts(token, { page = 1, limit = 20, q = '' } = {}) {
  const { data } = await api.get('/api/admin/contacts', {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit, q },
  });
  return { data };
}

export async function adminDeleteContact(token, id) {
  const { data } = await api.delete(`/api/admin/contacts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { data };
}
// --- Admin: update own email/password ---
export async function adminUpdateAccount(token, { email, currentPassword, newPassword }) {
  const { data } = await api.post(
    '/api/admin/account/update',
    { email, currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}