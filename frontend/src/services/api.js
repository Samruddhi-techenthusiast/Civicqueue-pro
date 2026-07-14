import axios from 'axios'
import { API_BASE } from '../constants'
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: API_BASE, withCredentials: true, timeout: 15000 })

// Attach access token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        // The refresh token is no longer read from localStorage — it lives only in the
        // httpOnly cookie the backend sets on login, which JavaScript can never read.
        // `withCredentials: true` is what makes the browser attach that cookie here;
        // it was missing on this specific call before (it used plain `axios`, not the
        // `api` instance, so the cookie was never actually sent).
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
        const { accessToken } = data.data
        localStorage.setItem('accessToken', accessToken)
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (e) {
        processQueue(e, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    // Don't show toast for network timeouts on background/polling calls
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return Promise.reject(err) // silent timeout — backend may just be starting
    }
    // Don't show toast for network errors (backend not running)
    if (!err.response) {
      return Promise.reject(err) // silent network error
    }
    const message = err.response?.data?.message || 'Something went wrong'
    if (err.response?.status !== 401) toast.error(message)
    return Promise.reject(err)
  }
)

export default api
