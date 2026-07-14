import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// ── Departments ───────────────────────────────────────────────────────────────
export const fetchDepartments = createAsyncThunk('departments/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/departments', { params })
    return data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const createDepartment = createAsyncThunk('departments/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/departments', payload)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const updateDepartment = createAsyncThunk('departments/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/departments/${id}`, payload)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const departmentSlice = createSlice({
  name: 'departments',
  initialState: { list: [], pagination: null, loading: false, selected: null },
  reducers: { setSelected: (s, a) => { s.selected = a.payload } },
  extraReducers: b => {
    b.addCase(fetchDepartments.pending,   s => { s.loading = true })
    b.addCase(fetchDepartments.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.data; s.pagination = a.payload.pagination })
    b.addCase(fetchDepartments.rejected,  s => { s.loading = false })
    b.addCase(createDepartment.fulfilled, (s, a) => { s.list.unshift(a.payload) })
    b.addCase(updateDepartment.fulfilled, (s, a) => {
      const idx = s.list.findIndex(d => d._id === a.payload._id)
      if (idx >= 0) s.list[idx] = a.payload
    })
  },
})
export const { setSelected } = departmentSlice.actions

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications', { params })
    return data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const markAllRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.patch('/notifications/read-all')
})

export const markOneRead = createAsyncThunk('notifications/markOne', async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`)
  return data.data
})

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, pagination: null, loading: false },
  reducers: {
    addLiveNotification: (s, a) => {
      s.list.unshift(a.payload); s.unreadCount += 1
    },
  },
  extraReducers: b => {
    b.addCase(fetchNotifications.pending,   s => { s.loading = true })
    b.addCase(fetchNotifications.fulfilled, (s, a) => {
      s.loading = false; s.list = a.payload.data
      s.pagination = a.payload.pagination; s.unreadCount = a.payload.unreadCount || 0
    })
    b.addCase(markAllRead.fulfilled,  s => { s.list = s.list.map(n => ({ ...n, isRead: true })); s.unreadCount = 0 })
    b.addCase(markOneRead.fulfilled,  (s, a) => {
      const idx = s.list.findIndex(n => n._id === a.payload._id)
      if (idx >= 0) { s.list[idx] = a.payload; s.unreadCount = Math.max(0, s.unreadCount - 1) }
    })
  },
})
export const { addLiveNotification } = notificationSlice.actions

// ── UI ────────────────────────────────────────────────────────────────────────
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: true,
    mobileSidebarOpen: false,
  },
  reducers: {
    toggleTheme: s => {
      s.theme = s.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', s.theme)
      document.documentElement.classList.toggle('dark', s.theme === 'dark')
    },
    setSidebar: (s, a) => { s.sidebarOpen = a.payload },
    toggleMobileSidebar: s => { s.mobileSidebarOpen = !s.mobileSidebarOpen },
  },
})
export const { toggleTheme, setSidebar, toggleMobileSidebar } = uiSlice.actions
