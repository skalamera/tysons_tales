import axios from 'axios';

// In production, the API is served from the same domain
// In development, we use the proxy defined in package.json
export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:5000';

// Create an axios instance with the base URL
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Helper function to construct API endpoints
export const getApiUrl = (endpoint: string) => {
    return `${API_BASE_URL}${endpoint}`;
}; 