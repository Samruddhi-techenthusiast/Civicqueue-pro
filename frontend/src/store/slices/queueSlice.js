import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchQueueStatus = createAsyncThunk('queue/status', async (deptId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/queue/${deptId}/status`)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const issueToken = createAsyncThunk('queue/issue', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/queue/tokens/issue', payload)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const callNext = createAsyncThunk('queue/callNext', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/queue/tokens/call-next', payload)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const fetchMyTokens = createAsyncThunk('queue/myTokens', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/queue/tokens/my', { params })
    return data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const cancelToken = createAsyncThunk('queue/cancel', async ({ id, cancelReason }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/queue/tokens/${id}/cancel`, { cancelReason })
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const fetchQueueTokens = createAsyncThunk('queue/tokens', async ({ queueId, params }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/queue/${queueId}/tokens`, { params })
    return data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const updateQueueStatus = createAsyncThunk('queue/updateStatus', async ({ deptId, status, pauseReason }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/queue/${deptId}/status`, { status, pauseReason })
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const openQueue = createAsyncThunk('queue/open', async (deptId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/queue/${deptId}/open`)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

const queueSlice = createSlice({
  name: 'queue',
  initialState: {
    status:     null,
    tokens:     [],
    myTokens:   [],
    pagination: null,
    loading:    false,
    issuing:    false,
    error:      null,
    liveUpdate: null,
  },
  reducers: {
    setLiveUpdate: (s, a) => { s.liveUpdate = a.payload },
    applySocketUpdate: (s, a) => {
      const { type, token, queue } = a.payload
      if (queue && s.status?.queue) s.status.queue = { ...s.status.queue, ...queue }
      if (token) {
        const idx = s.tokens.findIndex(t => t._id === token._id)
        if (idx >= 0) s.tokens[idx] = token
      }
    },
  },
  extraReducers: b => {
    b.addCase(fetchQueueStatus.pending,  s => { s.loading = true })
    b.addCase(fetchQueueStatus.fulfilled, (s, a) => { s.loading = false; s.status = a.payload })
    b.addCase(fetchQueueStatus.rejected,  s => { s.loading = false })
    b.addCase(issueToken.pending,   s => { s.issuing = true })
    b.addCase(issueToken.fulfilled, s => { s.issuing = false })
    b.addCase(issueToken.rejected,  s => { s.issuing = false })
    b.addCase(fetchMyTokens.fulfilled, (s, a) => {
      s.myTokens = a.payload.data; s.pagination = a.payload.pagination
    })
    b.addCase(fetchQueueTokens.fulfilled, (s, a) => {
      s.tokens = a.payload.data; s.pagination = a.payload.pagination
    })
  },
})

export const { setLiveUpdate, applySocketUpdate } = queueSlice.actions
export default queueSlice.reducer


export const skipToken = createAsyncThunk('queue/skip', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/queue/tokens/${id}/skip`, { reason })
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const recallToken = createAsyncThunk('queue/recall', async ({ id, counter }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/queue/tokens/${id}/recall`, { counter })
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const markServed = createAsyncThunk('queue/markServed', async (tokenId, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/queue/tokens/${tokenId}/serve`)
    return data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})
