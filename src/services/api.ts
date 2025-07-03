import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "https://pathemari-api-srv.onrender.com",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pathemari::authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("pathemari::authToken");
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiFunctions = {
  // Login function
  login: async (username: string, password: string) => {
    const response = await api.post("/login", {
      username,
      password,
    });
    return response.data;
  },

  // Logout function
  logout: async () => {
    try {
      await api.post("/logout");
    } catch {
      // Continue with local cleanup even if API call fails
    } finally {
      localStorage.removeItem("pathemari::authToken");
    }
  },

  // Get all trips
  listCamps: async () => {
    const response = await api.get("/api/camp");
    return response.data;
  },

  // Create a new camp
  createCamp: async ({ name, data }: { name: string; data: string }) => {
    const response = await api.post("/api/camp", { name, data });
    return response.data;
  },

  // Get all leads
  listLeads: async (campId: string) => {
    const response = await api.get(`/api/lead/${campId}`);
    return response.data;
  },

  // Create a new lead
  createLead: async ({
    name,
    countryCode,
    phone,
    camp,
    note,
  }: {
    name?: string;
    countryCode: string;
    phone: string;
    camp: string;
    note: string;
  }) => {
    const response = await api.post(`/api/lead`, {
      name,
      countryCode,
      phone,
      note,
      camp,
    });
    return response.data;
  },

  // Update a lead
  updateLead: async ({
    id,
    name,
    countryCode,
    phone,
    note,
    status,
  }: {
    id: string;
    name?: string;
    countryCode: string;
    phone: string;
    note: string;
    status: string;
  }) => {
    const response = await api.put(`/api/lead/${id}`, {
      name,
      countryCode,
      phone,
      note,
      status,
    });
    return response.data;
  },

  // Get all users
  listUsers: async () => {
    const response = await api.get("/api/user");
    return response.data;
  },
};

// Generic API functions
export const apiService = {
  get: async (url: string, config = {}) => {
    const response = await api.get(url, config);
    return response.data;
  },

  post: async (url: string, data = {}, config = {}) => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  put: async (url: string, data = {}, config = {}) => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  delete: async (url: string, config = {}) => {
    const response = await api.delete(url, config);
    return response.data;
  },
};

export default api;
