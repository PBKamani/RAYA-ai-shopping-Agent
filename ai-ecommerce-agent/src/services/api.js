/**
 * Central API Configuration and HTTP Client for RAYA ATELIER.
 */
export const API_BASE_URL = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8000/api'

export function getAuthHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}
