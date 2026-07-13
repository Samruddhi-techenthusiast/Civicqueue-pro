// src/hooks/useQueueData.js — polling + Socket.IO real-time hybrid

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'
import { getSocket, joinDashboard } from '../services/socket'
import toast from 'react-hot-toast'

/**
 * Manages queue state for the Staff Dashboard.
 * Strategy: poll every N seconds (fallback) + Socket.IO for instant updates.
 * Socket events immediately trigger a lightweight state refresh.
 */
export function useQueueData(departmentId, pollInterval = 5000) {
  const [queueStatus, setQueueStatus] = useState(null)
  const [tokens,      setTokens]      = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  const pollRef    = useRef(null)
  const mountedRef = useRef(true)

  // ── Core fetch ─────────────────────────────────────────────────────────────
  const fetchQueueStatus = useCallback(async () => {
    if (!departmentId) return
    try {
      const { data } = await api.get(`/queue/${departmentId}/status`)
      if (!mountedRef.current) return
      setQueueStatus(data.data)
      setError(null)

      if (data.data?.queue?._id) {
        const tokenRes = await api.get(`/queue/${data.data.queue._id}/tokens`, {
          params: { limit: 50, sort: 'priorityOrder:-1,serial:1' },
        })
        if (mountedRef.current) setTokens(tokenRes.data.data || [])
      } else {
        if (mountedRef.current) setTokens([])
      }
    } catch (err) {
      if (mountedRef.current) setError(err.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [departmentId])

  const fetchAppointments = useCallback(async () => {
    if (!departmentId) return
    try {
      const { data } = await api.get(`/appointments/department/${departmentId}`, {
        params: { date: new Date().toISOString().slice(0, 10), limit: 50 },
      })
      if (mountedRef.current) setAppointments(data.data || [])
    } catch { /* non-critical */ }
  }, [departmentId])

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    fetchQueueStatus()
    fetchAppointments()

    // Poll as safety fallback
    pollRef.current = setInterval(fetchQueueStatus, pollInterval)

    // Socket.IO — join dashboard room for real-time updates
    const socket = getSocket()
    if (socket && departmentId) {
      joinDashboard(departmentId)

      const handleQueueUpdate = (data) => {
        if (!mountedRef.current) return
        // Instant refresh on any queue change
        fetchQueueStatus()

        // Show toast for key events
        if (data?.type === 'token:called') {
          toast(`Calling: ${data.token?.tokenNumber}`, { icon: '📢', duration: 3000 })
        }
        if (data?.type === 'token:issued') {
          // New token arrived — don't toast staff for every booking
        }
      }

      socket.on('queue:update', handleQueueUpdate)
      socket.on('token:your_turn', handleQueueUpdate)

      return () => {
        mountedRef.current = false
        clearInterval(pollRef.current)
        socket.off('queue:update', handleQueueUpdate)
        socket.off('token:your_turn', handleQueueUpdate)
      }
    }

    return () => {
      mountedRef.current = false
      clearInterval(pollRef.current)
    }
  }, [departmentId, pollInterval, fetchQueueStatus, fetchAppointments])

  // ── Actions ────────────────────────────────────────────────────────────────
  const openQueue = useCallback(async () => {
    await api.post(`/queue/${departmentId}/open`)
    await fetchQueueStatus()
  }, [departmentId, fetchQueueStatus])

  const callNext = useCallback(async (counter) => {
    const { data } = await api.post('/queue/tokens/call-next', { departmentId, counter })
    await fetchQueueStatus()
    return data.data
  }, [departmentId, fetchQueueStatus])

  const markServed = useCallback(async (tokenId) => {
    await api.patch(`/queue/tokens/${tokenId}/serve`)
    await fetchQueueStatus()
  }, [fetchQueueStatus])

  const updateStatus = useCallback(async (status, pauseReason) => {
    await api.patch(`/queue/${departmentId}/status`, { status, pauseReason })
    await fetchQueueStatus()
  }, [departmentId, fetchQueueStatus])

  const approveAppointment = useCallback(async (id) => {
    await api.patch(`/appointments/${id}/approve`)
    await fetchAppointments()
  }, [fetchAppointments])

  const rejectAppointment = useCallback(async (id, reason) => {
    await api.patch(`/appointments/${id}/reject`, { rejectReason: reason })
    await fetchAppointments()
  }, [fetchAppointments])

  const checkInAppointment = useCallback(async (id) => {
    const { data } = await api.post(`/appointments/${id}/checkin`)
    await Promise.all([fetchQueueStatus(), fetchAppointments()])
    return data.data
  }, [fetchQueueStatus, fetchAppointments])

  const skipToken = useCallback(async (tokenId, reason) => {
    await api.patch(`/queue/tokens/${tokenId}/skip`, { reason: reason || 'No show' })
    await fetchQueueStatus()
  }, [fetchQueueStatus])

  const recallToken = useCallback(async (tokenId, counter) => {
    await api.patch(`/queue/tokens/${tokenId}/recall`, { counter })
    await fetchQueueStatus()
  }, [fetchQueueStatus])

  const cancelToken = useCallback(async (tokenId, reason) => {
    await api.patch(`/queue/tokens/${tokenId}/cancel`, { cancelReason: reason || 'Cancelled by staff' })
    await fetchQueueStatus()
  }, [fetchQueueStatus])

  return {
    queueStatus,
    tokens,
    appointments,
    loading,
    error,
    refresh: fetchQueueStatus,
    actions: {
      openQueue,
      callNext,
      markServed,
      updateStatus,
      approveAppointment,
      rejectAppointment,
      checkInAppointment,
      skipToken,
      recallToken,
      cancelToken,
    },
  }
}
