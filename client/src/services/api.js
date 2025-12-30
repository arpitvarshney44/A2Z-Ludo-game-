import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // User is blocked
      localStorage.removeItem('auth-storage');
      window.location.href = '/login?blocked=true';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOTP: (phoneNumber) => api.post('/auth/send-otp', { phoneNumber }),
  verifyOTP: (phoneNumber, otp, referralCode, deviceInfo) => 
    api.post('/auth/verify-otp', { phoneNumber, otp, referralCode, deviceInfo }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// User APIs
export const userAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  uploadAvatar: (formData) => api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/user/stats'),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  deposit: (amount, paymentMethod) => api.post('/wallet/deposit', { amount, paymentMethod }),
  withdraw: (amount, withdrawalDetails) => api.post('/wallet/withdraw', { amount, withdrawalDetails }),
  getTransactions: (page, limit) => api.get(`/wallet/transactions?page=${page}&limit=${limit}`),
  getTransactionById: (id) => api.get(`/wallet/transaction/${id}`),
};

// Game APIs
export const gameAPI = {
  createGame: (gameType, entryFee, maxPlayers) => 
    api.post('/game/create', { gameType, entryFee, maxPlayers }),
  joinGame: (roomCode) => api.post(`/game/join/${roomCode}`),
  getAvailableGames: () => api.get('/game/available'),
  getGameByRoomCode: (roomCode) => api.get(`/game/${roomCode}`),
  getGameHistory: (page, limit) => api.get(`/game/history?page=${page}&limit=${limit}`),
};

// Referral APIs
export const referralAPI = {
  getInfo: () => api.get('/referral/info'),
  getReferredUsers: () => api.get('/referral/users'),
};

// Support APIs
export const supportAPI = {
  createTicket: (subject, category, message) => 
    api.post('/support/ticket', { subject, category, message }),
  getMyTickets: () => api.get('/support/tickets'),
  getTicketById: (id) => api.get(`/support/ticket/${id}`),
  addMessage: (id, message) => api.post(`/support/ticket/${id}/message`, { message }),
};

// KYC APIs
export const kycAPI = {
  submitKYC: (formData) => api.post('/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStatus: () => api.get('/kyc/status'),
};

// Policy APIs (public)
export const policyAPI = {
  getPolicy: (policyKey) => api.get(`/policies/${policyKey}`),
};

export default api;
