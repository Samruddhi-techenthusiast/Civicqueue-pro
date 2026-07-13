export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000' // direct for socket.io

export const ROLES = { CITIZEN: 'citizen', STAFF: 'staff', ADMIN: 'admin', SUPER_ADMIN: 'super_admin' }

export const TOKEN_STATUS = {
  WAITING:   { label: 'Waiting',   color: 'amber',  dot: '#f59e0b' },
  SERVING:   { label: 'Serving',   color: 'blue',   dot: '#3366ff' },
  SERVED:    { label: 'Served',    color: 'green',  dot: '#10b981' },
  CANCELLED: { label: 'Cancelled', color: 'red',    dot: '#f43f5e' },
  NO_SHOW:   { label: 'No Show',   color: 'gray',   dot: '#94a3b8' },
}

export const QUEUE_STATUS = {
  OPEN:   { label: 'Open',   color: 'green' },
  PAUSED: { label: 'Paused', color: 'amber' },
  CLOSED: { label: 'Closed', color: 'gray'  },
}

export const APPT_STATUS = {
  SCHEDULED:  { label: 'Scheduled',  color: 'blue'   },
  CONFIRMED:  { label: 'Confirmed',  color: 'green'  },
  CHECKED_IN: { label: 'Checked In', color: 'purple' },
  COMPLETED:  { label: 'Completed',  color: 'gray'   },
  CANCELLED:  { label: 'Cancelled',  color: 'red'    },
  NO_SHOW:    { label: 'No Show',    color: 'red'    },
}

export const PRIORITY = {
  normal: { label: 'Normal', color: 'gray'   },
  high:   { label: 'High',   color: 'amber'  },
  urgent: { label: 'Urgent', color: 'red'    },
}

export const PAGE_SIZE = 10
