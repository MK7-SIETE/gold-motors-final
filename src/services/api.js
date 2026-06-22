// API service - production build
const BASE_URL = 'https://gold-motors-api.onrender.com/api';

function getDealerToken() {
  try { return JSON.parse(sessionStorage.getItem('gm-dealer') || 'null')?.token || null; }
  catch { return null; }
}

function getSuperToken() {
  try { return JSON.parse(sessionStorage.getItem('gm-super') || 'null')?.token || null; }
  catch { return null; }
}

// Force all http:// URLs to https:// recursively in any response object
function httpsify(obj) {
  if (typeof obj === 'string') {
    return obj.startsWith('http://') ? obj.replace('http://', 'https://') : obj;
  }
  if (Array.isArray(obj)) return obj.map(httpsify);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, httpsify(v)]));
  }
  return obj;
}

// General request — dealer token takes priority, falls back to super
async function request(method, path, data = null, isFormData = false) {
  const headers = { Accept: 'application/json' };
  const token = getDealerToken() || getSuperToken() || null;
  if (token)       headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type']  = 'application/json';
  const options = { method, headers };
  if (data) options.body = isFormData ? data : JSON.stringify(data);
  const res  = await fetch(`${BASE_URL}${path}`, options);
  const json = await res.json().catch(() => ({ message: 'Server error' }));
  if (!res.ok) throw json;
  return httpsify(json);
}

// Super JSON request — always uses super token, always JSON
async function superRequest(method, path, data = null) {
  const token = getSuperToken();
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  const res  = await fetch(`${BASE_URL}${path}`, options);
  const json = await res.json().catch(() => ({ message: 'Server error' }));
  if (!res.ok) throw json;
  return httpsify(json);
}

// Super FormData request — always uses super token, no Content-Type (browser sets multipart boundary)
async function superFormRequest(method, path, data = null) {
  const token = getSuperToken();
  const headers = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (data) options.body = data;
  const res  = await fetch(`${BASE_URL}${path}`, options);
  const json = await res.json().catch(() => ({ message: 'Server error' }));
  if (!res.ok) throw json;
  return httpsify(json);
}

export const api = {

  // ── Public: cars ──────────────────────────────────────────────
  getPublicConfig: () => request('GET', '/config'),
  getCars: (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    const qs = new URLSearchParams(clean).toString();
    return request('GET', `/cars${qs ? '?' + qs : ''}`);
  },
  getCar:      (id) => request('GET', `/cars/${id}`),
  getFeatured: ()   => request('GET', '/cars/featured/list'),

  // ── Public: messages ──────────────────────────────────────────
  submitMessage:       (data) => request('POST', '/messages', data),
  submitContact:       (data) => request('POST', '/messages', { ...data, type: 'general' }),
  submitImportRequest: (data) => request('POST', '/messages', {
    name:    data.name,
    email:   data.email,
    phone:   data.phone || 'Not provided',
    subject: `Import request: ${data.make || ''} ${data.model || ''}`.trim(),
    message: [
      data.make             ? `Make: ${data.make}`               : '',
      data.model            ? `Model: ${data.model}`             : '',
      data.year             ? `Year: ${data.year}`               : '',
      data.budget           ? `Budget: ${data.budget}`           : '',
      data.preferred_market ? `Market: ${data.preferred_market}` : '',
      data.notes            ? `Notes: ${data.notes}`             : '',
    ].filter(Boolean).join('\n'),
    type: 'import_request',
  }),

  // ── Public: hero images ───────────────────────────────────────
  getHeroImages: () => request('GET', '/hero-images'),

  // ── Public: testimonials ──────────────────────────────────────
  getTestimonials:   ()     => request('GET',  '/testimonials'),
  submitTestimonial: (data) => request('POST', '/testimonials', data),

  // ── Public: newsletter subscribe ──────────────────────────────
  subscribe: (data) => request('POST', '/subscribe', data),

  // ── Dealer auth ───────────────────────────────────────────────
  dealerLogin:  (data) => request('POST', '/dealer/login', data),
  dealerLogout: ()     => request('POST', '/dealer/logout'),
  dealerMe:     ()     => request('GET',  '/dealer/me'),

  // ── Dealer: cars ──────────────────────────────────────────────
  getDealerCars: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/dealer/cars${qs ? '?' + qs : ''}`);
  },
  createCar: (data)     => request('POST',   '/dealer/cars', data),
  updateCar: (id, data) => request('PUT',    `/dealer/cars/${id}`, data),
  deleteCar: (id)       => request('DELETE', `/dealer/cars/${id}`),
  toggleCar: (id)       => request('PATCH',  `/dealer/cars/${id}/toggle`),

  // ── Dealer: images ────────────────────────────────────────────
  uploadImages: (carId, files) => {
    const fd = new FormData();
    files.forEach(f => fd.append('images[]', f));
    return request('POST', `/dealer/cars/${carId}/images`, fd, true);
  },
  deleteImage:   (carId, imgId) => request('DELETE', `/dealer/cars/${carId}/images/${imgId}`),
  reorderImages: (carId, order) => request('POST',   `/dealer/cars/${carId}/images/reorder`, { order }),

  // ── Dealer: messages ──────────────────────────────────────────
  getMessages:   ()    => request('GET',    '/dealer/messages'),
  getMessage:    (id)  => request('GET',    `/dealer/messages/${id}`),
  markRead:      (id)  => request('PATCH',  `/dealer/messages/${id}/read`),
  deleteMessage: (id)  => request('DELETE', `/dealer/messages/${id}`),

  // ── Dealer: notices ───────────────────────────────────────────
  getDealerNotices:  ()   => request('GET',   '/dealer/notices'),
  markNoticeRead:    (id) => request('PATCH', `/dealer/notices/${id}/read`),

  // ── Dealer: stats & profile ───────────────────────────────────
  getDealerStats: () => request('GET', '/dealer/stats'),
  getProfile:     () => request('GET', '/dealer/profile'),
  updateProfile:  (data) => request('PUT', '/dealer/profile', data),

  // ── Super auth ────────────────────────────────────────────────
  superLogin:  (data) => request('POST', '/super/login', data),
  superLogout: ()     => superRequest('POST', '/super/logout'),

  // ── Super: stats & dealers ────────────────────────────────────
  getSuperStats:   ()     => superRequest('GET',    '/super/stats'),
  getSuperDealers: ()     => superRequest('GET',    '/super/dealers'),
  getDealers:      ()     => superRequest('GET',    '/super/dealers'),
  createDealer:    (data) => superRequest('POST',   '/super/dealers', data),
  suspendDealer:   (id)   => superRequest('PATCH',  `/super/dealers/${id}/suspend`),
  deleteDealer:    (id)   => superRequest('DELETE', `/super/dealers/${id}`),

  // ── Super: data ───────────────────────────────────────────────
  getSuperCars:     () => superRequest('GET', '/super/cars'),
  getSuperMessages: () => superRequest('GET', '/super/messages'),
  superMarkRead:    (id) => superRequest('PATCH', `/super/messages/${id}/read`),

  // ── Super: testimonials ───────────────────────────────────────
  getSuperTestimonials:    ()           => superRequest('GET',    '/super/testimonials'),
  updateTestimonialStatus: (id, status) => superRequest('PATCH',  `/super/testimonials/${id}/status`, { status }),
  deleteTestimonial:       (id)         => superRequest('DELETE', `/super/testimonials/${id}`),

  // ── Super: profile & config ───────────────────────────────────
  getSuperProfile:    ()     => superRequest('GET', '/super/profile'),
  updateSuperProfile: (data) => superRequest('PUT', '/super/profile', data),
  getSuperConfig:     ()     => superRequest('GET', '/super/config'),
  getSiteConfig:      ()     => superRequest('GET', '/super/config'),
  updateSuperConfig:  (data) => superRequest('PUT', '/super/config', data),
  updateSiteConfig:   (data) => superRequest('PUT', '/super/config', data),

  // ── Super: hero images ────────────────────────────────────────
  uploadHeroImage: (formData) => superFormRequest('POST',   '/super/hero-images', formData),
  deleteHeroImage: (id)       => superRequest('DELETE', `/super/hero-images/${id}`),

  // ── Super: system ─────────────────────────────────────────────
  getSystemHealth: () => superRequest('GET', '/super/health'),
  getSecurityLog:  () => superRequest('GET', '/super/security-log'),

  // ── Super: subscribers ────────────────────────────────────────
  getSubscribers:   ()     => superRequest('GET',    '/super/subscribers'),
  deleteSubscriber: (id)   => superRequest('DELETE', `/super/subscribers/${id}`),

  // ── Super: newsletters ────────────────────────────────────────
  getNewsletters:   ()         => superRequest('GET',    '/super/newsletters'),
  createNewsletter: (data)     => superRequest('POST',   '/super/newsletters', data),
  updateNewsletter: (id, data) => superRequest('PUT',    `/super/newsletters/${id}`, data),
  deleteNewsletter: (id)       => superRequest('DELETE', `/super/newsletters/${id}`),
  sendNewsletter:   (id)       => superRequest('POST',   `/super/newsletters/${id}/send`, {}),

  // ── Super: notices ────────────────────────────────────────────
  getSuperNotices:  ()         => superRequest('GET',    '/super/notices'),
  createNotice:     (data)     => superRequest('POST',   '/super/notices', data),
  toggleNotice:     (id)       => superRequest('PATCH',  `/super/notices/${id}/toggle`),
  deleteNotice:     (id)       => superRequest('DELETE', `/super/notices/${id}`),
};
