import axios from 'axios'
import { API_BASE } from '../constants'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000
})

// Attach access token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})


let isRefreshing = false
let failedQueue = []


const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    error ? prom.reject(error) : prom.resolve(token)
  })

  failedQueue = []
}


// Auto refresh access token on 401
api.interceptors.response.use(
  response => response,

  async error => {

    const originalRequest = error.config


    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      if (isRefreshing) {

        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject
          })

        }).then(token => {

          originalRequest.headers.Authorization =
            `Bearer ${token}`

          return api(originalRequest)
        })
      }


      originalRequest._retry = true
      isRefreshing = true


      try {

        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          {
            withCredentials: true
          }
        )


        const { accessToken } = data.data


        localStorage.setItem(
          'accessToken',
          accessToken
        )


        processQueue(
          null,
          accessToken
        )


        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`


        return api(originalRequest)


      } catch (refreshError) {


        processQueue(
          refreshError,
          null
        )


        localStorage.clear()

        window.location.href = '/login'


        return Promise.reject(refreshError)


      } finally {

        isRefreshing = false

      }
    }



    if (
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout')
    ) {
      return Promise.reject(error)
    }


    if (!error.response) {
      return Promise.reject(error)
    }


    const message =
      error.response?.data?.message ||
      'Something went wrong'


    if (error.response.status !== 401) {
      toast.error(message)
    }


    return Promise.reject(error)
  }
)


export default api