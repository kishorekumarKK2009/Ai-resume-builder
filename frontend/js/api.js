const API_BASES = ['http://localhost:5001/api'];

const request = async (path, method = 'GET', body = null, auth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let lastError;
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : null });
      if (response.ok) return response.status === 204 ? null : response.json();

      // try to extract helpful error message from response body
      try {
        const payload = await response.json();
        lastError = new Error(payload.message || payload.error || `Request failed with ${response.status}`);
      } catch (e) {
        const text = await response.text();
        lastError = new Error(text || `Request failed with ${response.status}`);
      }
    } catch (error) {
      // network or CORS error
      lastError = error;
    }
  }
  throw lastError || new Error('API request failed');
};

export const login = (data) => request('/auth/login', 'POST', data, false);
export const register = (data) => request('/auth/register', 'POST', data, false);
export const getTemplates = () => request('/templates');
export const getResumes = () => request('/resumes');
export const getResume = (id) => request(`/resumes/${id}`);
export const createResume = (data) => request('/resumes', 'POST', data);
export const getAdminResumes = () => request('/admin/resumes');
export const getProfile = () => request('/profile');
export const updateProfile = (data) => request('/profile', 'PUT', data);
export const generateAIDraft = (prompt) => request('/resumes/ai/draft', 'POST', { prompt });
