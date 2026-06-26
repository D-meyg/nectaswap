import type { AxiosInstance } from 'axios'

/**
 * Separated from client.ts so interceptors can be tested in isolation
 * and swapped out without touching the axios instance setup.
 */
export function applyInterceptors(client: AxiosInstance) {

  // ── Request: attach Bearer token ──────────────────────
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    },
    (error) => Promise.reject(error)
  )

  // ── Response: global error handling ───────────────────
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status

      // 401 → token expired or invalid, force logout
      if (status === 401) {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }

      // 403 → user doesn't have permission
      if (status === 403) {
        console.warn('[Auth] Forbidden — insufficient permissions')
      }

      // 500+ → server error, let query hooks handle retry
      if (status >= 500) {
        console.error('[API] Server error', error.response?.data)
      }

      return Promise.reject(error)
    }
  )
}
