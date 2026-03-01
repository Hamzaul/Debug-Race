import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('debugrace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('📥 API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================
export const authAPI = {
  guestLogin: (username) => 
    api.post('/auth/guest', { username }),
  
  register: (data) => 
    api.post('/auth/register', data),
  
  login: (data) => 
    api.post('/auth/login', data),
  
  getProfile: () => 
    api.get('/auth/profile')
};

// ============================================
// Team API
// ============================================
export const teamAPI = {
  create: (data) => 
    api.post('/team/create', data),
  
  join: (code) => 
    api.post('/team/join', { code }),
  
  get: (code) => 
    api.get(`/team/${code}`),
  
  leave: (code) => 
    api.post(`/team/${code}/leave`)
};

// ============================================
// Race API
// ============================================
export const raceAPI = {
  start: (teamCode) => 
    api.post('/race/start', { teamCode }),
  
  get: (raceId) => 
    api.get(`/race/${raceId}`),
  
  submitAnswer: (raceId, data) => 
    api.post(`/race/${raceId}/answer`, data),
  
  finish: (raceId) => 
    api.post(`/race/${raceId}/finish`),
  
  getResults: (raceId) => 
    api.get(`/race/${raceId}/results`)
};

// ============================================
// Questions API
// ============================================
export const questionAPI = {
  generate: (data) => 
    api.post('/ai/generate-question', data),
  
  getAll: (params) => 
    api.get('/ai/questions', { params }),
  
  test: () => 
    api.get('/ai/test')
};

// ============================================
// Health Check
// ============================================
export const healthCheck = () => 
  api.get('/test');

export default api;