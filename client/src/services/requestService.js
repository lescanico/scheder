import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://scheder-backend.fly.dev/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const requestService = {
  // Get all requests with optional filters
  async getRequests(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/requests?${params.toString()}`);
    return response.data;
  },

  // Get single request by ID
  async getRequest(id) {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // Create new request
  async createRequest(requestData) {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  // Update existing request
  async updateRequest(id, requestData) {
    const response = await api.put(`/requests/${id}`, requestData);
    return response.data;
  },

  // Update request status
  async updateRequestStatus(id, status, notes = '', updatedBy = '') {
    const response = await api.patch(`/requests/${id}/status`, {
      status,
      notes,
      updatedBy
    });
    return response.data;
  },

  // Add admin notes
  async addAdminNotes(id, notes) {
    const response = await api.patch(`/requests/${id}/admin-notes`, { notes });
    return response.data;
  },

  // Add director notes
  async addDirectorNotes(id, notes) {
    const response = await api.patch(`/requests/${id}/director-notes`, { notes });
    return response.data;
  },

  // Upload PTO form
  async uploadPTOForm(id, file) {
    const formData = new FormData();
    formData.append('ptoForm', file);
    
    const response = await api.post(`/requests/${id}/upload-pto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Send clarification email
  async sendClarificationEmail(id, clarificationMessage, adminName) {
    const response = await api.post(`/requests/${id}/send-clarification`, {
      clarificationMessage,
      adminName
    });
    return response.data;
  },

  // Get conflicting appointments
  async getConflictingAppointments(id) {
    const response = await api.get(`/requests/${id}/conflicts`);
    return response.data;
  },

  // Delete request
  async deleteRequest(id) {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },

  // Get request statistics
  async getRequestStats() {
    const response = await api.get('/requests');
    const requests = response.data.data;
    
    const stats = {
      total: requests.length,
      byStatus: {},
      byType: {},
      byProvider: {},
      recentRequests: requests.slice(0, 5)
    };
    
    requests.forEach(request => {
      // Count by status
      stats.byStatus[request.status] = (stats.byStatus[request.status] || 0) + 1;
      
      // Count by type
      stats.byType[request.requestType] = (stats.byType[request.requestType] || 0) + 1;
      
      // Count by provider
      stats.byProvider[request.providerName] = (stats.byProvider[request.providerName] || 0) + 1;
    });
    
    return { success: true, data: stats };
  }
}; 