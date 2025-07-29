import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { tokenStorage } from '../authConfig'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // Updated to common FastAPI default port
  // timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    
    if (token && !tokenStorage.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If token is expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Clear expired token
      tokenStorage.removeAccessToken()
      
      // Redirect to login or trigger re-authentication
      window.location.href = '/'
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api 