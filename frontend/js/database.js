/**
 * API Configuration and Database Service
 * Connects frontend to Django backend API
 */

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:5001/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Storage Keys
const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  RESUMES: 'resume_ai_resumes',
  TEMPLATES: 'resume_ai_templates',
  CURRENT_RESUME: 'resume_ai_current_resume'
};

/**
 * API Service Class
 * Handles all HTTP requests to backend
 */
class APIService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.headers = API_CONFIG.HEADERS;
    this.token = this.getToken();
  }

  /**
   * Get stored authentication token
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      this.token = token;
    }
  }

  /**
   * Remove authentication token (logout)
   */
  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    this.token = null;
  }

  /**
   * Get authorization headers
   */
  getHeaders() {
    const headers = { ...this.headers };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: error.error || error.detail || response.statusText,
          data: error
        };
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw { message: 'Request timeout', status: 'TIMEOUT' };
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH request
   */
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

/**
 * Database Service Class
 * Handles business logic and data operations
 */
class DatabaseService {
  constructor() {
    this.api = new APIService();
    this.currentUser = this.loadUser();
  }

  // ========== USER MANAGEMENT ==========

  /**
   * Register new user
   */
  async registerUser(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      this.api.setToken(response.token);
      this.setUser(response.user || response);
      return { success: true, data: response.user || response };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  async loginUser(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      this.api.setToken(response.token);
      this.setUser(response.user || response);
      return { success: true, data: response.user || response };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_RESUME);
    this.api.removeToken();
    this.currentUser = null;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    if (!this.currentUser?.id) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      const response = await this.api.get('/profile');
      this.setUser(response);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData) {
    if (!this.currentUser?.id) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      const response = await this.api.put('/profile', userData);
      this.setUser(response);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Set current user in memory and storage
   */
  setUser(userData) {
    if (!userData) return;

    const user = userData.user || userData;
    if (userData.token) {
      this.api.setToken(userData.token);
    }

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Load user from storage
   */
  loadUser() {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser && !!this.currentUser.id;
  }

  // ========== RESUME MANAGEMENT ==========

  /**
   * Create new resume
   */
  async createResume(resumeData) {
    if (!this.currentUser?.id) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      const data = {
        user_id: this.currentUser.id,
        ...resumeData
      };
      const response = await this.api.post('/resumes/', data);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all resumes for current user
   */
  async getUserResumes() {
    if (!this.currentUser?.id) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      const response = await this.api.get(`/resumes/?user_id=${this.currentUser.id}`);
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(response));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get single resume by ID
   */
  async getResume(resumeId) {
    try {
      const response = await this.api.get(`/resumes/${resumeId}/`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update resume
   */
  async updateResume(resumeId, resumeData) {
    try {
      const response = await this.api.put(`/resumes/${resumeId}/`, resumeData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete resume
   */
  async deleteResume(resumeId) {
    try {
      await this.api.delete(`/resumes/${resumeId}/`);
      return { success: true, message: 'Resume deleted' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Publish resume
   */
  async publishResume(resumeId) {
    try {
      const response = await this.api.post(`/resumes/${resumeId}/publish/`, {});
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Unpublish resume
   */
  async unpublishResume(resumeId) {
    try {
      const response = await this.api.post(`/resumes/${resumeId}/unpublish/`, {});
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save resume locally and to database
   */
  async saveResumeLocally(resumeData) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_RESUME, JSON.stringify(resumeData));
    return { success: true, message: 'Resume saved locally' };
  }

  /**
   * Load resume from local storage
   */
  loadResumeLocally() {
    try {
      const resume = localStorage.getItem(STORAGE_KEYS.CURRENT_RESUME);
      return resume ? JSON.parse(resume) : null;
    } catch {
      return null;
    }
  }

  // ========== TEMPLATE MANAGEMENT ==========

  /**
   * Get all available templates
   */
  async getTemplates(category = null) {
    try {
      let endpoint = '/templates/';
      if (category) {
        endpoint += `?category=${category}`;
      }
      const response = await this.api.get(endpoint);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(response));
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get single template
   */
  async getTemplate(templateId) {
    try {
      const response = await this.api.get(`/templates/${templateId}/`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cached templates
   */
  getCachedTemplates() {
    try {
      const templates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return templates ? JSON.parse(templates) : [];
    } catch {
      return [];
    }
  }

  // ========== UTILITY FUNCTIONS ==========

  /**
   * Check backend connection
   */
  async checkBackendConnection() {
    try {
      const response = await this.api.get('/');
      return { connected: true };
    } catch {
      return { connected: false };
    }
  }

  /**
   * Format API error message
   */
  formatError(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An error occurred';
  }
}

// Create global instance
const db = new DatabaseService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIService, DatabaseService, db };
}
