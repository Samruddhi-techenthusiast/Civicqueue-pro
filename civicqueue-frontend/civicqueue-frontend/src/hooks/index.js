import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSocket } from '../services/socket'

export const useAppDispatch = () => useDispatch()
export const useAppSelector = (selector) => useSelector(selector)

export const useAuth          = () => useAppSelector(s => s.auth)
export const useQueue         = () => useAppSelector(s => s.queue)
export const useDepartments   = () => useAppSelector(s => s.departments)
export const useNotifications = () => useAppSelector(s => s.notifications)
export const useUI            = () => useAppSelector(s => s.ui)

export const useSocketEvent = (event, handler) => {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const cb = (...args) => handlerRef.current(...args)
    socket.on(event, cb)
    return () => socket.off(event, cb)
  }, [event])
}

export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debouncedValue
}
