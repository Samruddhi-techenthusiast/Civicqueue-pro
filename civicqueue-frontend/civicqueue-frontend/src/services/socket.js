import { io } from 'socket.io-client'
import { SOCKET_URL } from '../constants'

let socket = null

export const connectSocket = (token) => {
  // Don't double-connect
  if (socket?.connected) return socket
  // Disconnect any stale socket first
  if (socket) { socket.disconnect(); socket = null }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  })

  socket.on('connect',       () => console.log('[Socket] Connected:', socket.id))
  socket.on('disconnect',    (r) => console.log('[Socket] Disconnected:', r))
  socket.on('connect_error', (e) => console.warn('[Socket] Error:', e.message))

  return socket
}

export const getSocket    = () => socket
export const isConnected  = () => socket?.connected === true

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}

// Safe emit helpers — silently skip if not connected yet
export const joinQueueRoom = (departmentId) => {
  if (socket?.connected) socket.emit('join:queue', { departmentId })
}

export const leaveQueueRoom = (departmentId) => {
  if (socket?.connected) socket.emit('leave:queue', { departmentId })
}

export const joinDashboard = (departmentId) => {
  if (socket?.connected) {
    socket.emit('join:dashboard', { departmentId })
  } else {
    // Wait for connection then join
    socket?.once('connect', () => socket.emit('join:dashboard', { departmentId }))
  }
}

export const trackToken = (tokenId) => {
  if (socket?.connected) socket.emit('track:token', { tokenId })
}
