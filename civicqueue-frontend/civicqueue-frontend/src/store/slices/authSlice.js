import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { connectSocket, disconnectSocket } from '../../services/socket'

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed') }
})

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed') }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    // No body needed anymore — the backend reads the refresh token from the
    // httpOnly cookie (sent automatically via withCredentials) rather than
    // from Redux state, which mirrors how login/refresh now work.
    await api.post('/auth/logout')
  } finally {
    localStorage.clear()
    disconnectSocket()
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

// refreshToken is intentionally NOT read from or written to localStorage anywhere in
// this file anymore — it lives only in the httpOnly cookie the backend sets, which
// JavaScript (and therefore any XSS payload) can never read. Only the short-lived
// access token and the (non-sensitive) user object are persisted client-side.
const saved = {
  user:        JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:         saved.user,
    accessToken:  saved.accessToken,
    loading:      false,
    error:        null,
    initialized:  false,
  },
  reducers: {
    clearError: s => { s.error = null },
    setTokens:  (s, a) => { s.accessToken = a.payload.accessToken },
  },
  extraReducers: b => {
    const setAuth = (s, a) => {
      s.loading = false; s.error = null
      s.user = a.payload.user
      s.accessToken = a.payload.accessToken
      localStorage.setItem('user', JSON.stringify(a.payload.user))
      localStorage.setItem('accessToken', a.payload.accessToken)
      connectSocket(a.payload.accessToken)
    }
    b.addCase(login.pending,    s => { s.loading = true; s.error = null })
    b.addCase(login.fulfilled,  setAuth)
    b.addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload })
    b.addCase(register.pending,   s => { s.loading = true; s.error = null })
    b.addCase(register.fulfilled, setAuth)
    b.addCase(register.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
    b.addCase(logout.fulfilled, s => {
      s.user = null; s.accessToken = null
    })
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.user = a.payload; s.initialized = true
      localStorage.setItem('user', JSON.stringify(a.payload))
    })
    b.addCase(fetchMe.rejected, s => { s.initialized = true })
  },
})

export const { clearError, setTokens } = authSlice.actions
export default authSlice.reducer
