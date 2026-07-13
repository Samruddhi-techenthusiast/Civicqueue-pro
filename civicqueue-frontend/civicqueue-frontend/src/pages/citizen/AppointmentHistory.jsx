import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Plus, X, CheckCircle, ChevronDown, Search } from 'lucide-react'
import { Card, Table, Pagination, Badge, EmptyState, Select } from '../../components/ui/index.jsx'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { formatDate, formatTime, getApptBadge } from '../../utils'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showBook, setShowBook] = useState(false)
  const [depts, setDepts] = useState([])
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [cancelling, setCancelling] = useState(null)
  const [form, setForm] = useState({ departmentId: '', date: '', timeSlot: null, serviceType: 'General', notes: '' })
  const [booking, setBooking] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/appointments/my', { params })
      setAppointments(data.data || [])
      setPagination(data.pagination)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, statusFilter])
  useEffect(() => { api.get('/departments', { params: { limit: 50 } }).then(r => setDepts(r.data.data || [])) }, [])

  const fetchSlots = async () => {
    if (!form.departmentId || !form.date) return
    setSlotsLoading(true)
    try {
      const { data } = await api.get('/appointments/slots', { params: { departmentId: form.departmentId, date: form.date } })
      setSlots(data.data?.slots || [])
    } finally { setSlotsLoading(false) }
  }

  useEffect(() => { fetchSlots() }, [form.departmentId, form.date])

  const handleBook = async () => {
    if (!form.timeSlot) return toast.error('Please select a time slot')
    setBooking(true)
    try {
      await api.post('/appointments', { departmentId: form.departmentId, date: form.date, timeSlot: form.timeSlot, serviceType: form.serviceType, notes: form.notes })
      toast.success('Appointment booked!')
      setShowBook(false)
      setForm({ departmentId: '', date: '', timeSlot: null, serviceType: 'General', notes: '' })
      load()
    } catch { } finally { setBooking(false) }
  }

  const handleCancel = async (id) => {
    setCancelling(id)
    try {
      await api.patch(`/appointments/${id}/cancel`, { cancelReason: 'Cancelled by citizen' })
      toast.success('Appointment cancelled')
      load()
    } catch { } finally { setCancelling(null) }
  }

  const handleCheckIn = async (id) => {
    try {
      const { data } = await api.post(`/appointments/${id}/checkin`)
      toast.success(`Checked in! Token: ${data.data?.token?.tokenNumber}`)
      load()
    } catch { }
  }

  const columns = [
    { key: 'department', label: 'Department', render: (_, row) => <span className="font-medium text-[var(--text-primary)]">{row.department?.name || '—'}</span> },
    { key: 'date', label: 'Date & Time', render: (_, row) => (
      <div>
        <p className="font-medium text-[var(--text-primary)]">{formatDate(row.date)}</p>
        <p className="text-xs text-[var(--text-muted)]">{row.timeSlot?.start} – {row.timeSlot?.end}</p>
      </div>
    )},
    { key: 'serviceType', label: 'Service', render: v => <span className="text-[var(--text-secondary)]">{v || 'General'}</span> },
    { key: 'status', label: 'Status', render: v => <span className={getApptBadge(v)}>{v?.replace('_', ' ')}</span> },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex items-center gap-2">
        {row.status === 'confirmed' && (
          <Button size="sm" variant="outline" onClick={() => handleCheckIn(row._id)}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Check In
          </Button>
        )}
        {['scheduled', 'confirmed'].includes(row.status) && (
          <Button size="sm" variant="ghost" loading={cancelling === row._id} onClick={() => handleCancel(row._id)}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    )},
  ]

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Appointments</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your scheduled visits</p>
        </div>
        <Button icon={Plus} onClick={() => setShowBook(true)}>Book Appointment</Button>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Select options={[
            { value: '', label: 'All Status' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'checked_in', label: 'Checked In' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="w-44" />
        </div>
        <Table columns={columns} data={appointments} loading={loading} emptyMessage="No appointments found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      {/* Book Modal */}
      <Modal open={showBook} onClose={() => setShowBook(false)} title="Book Appointment" size="lg"
        footer={<><Button variant="secondary" onClick={() => setShowBook(false)}>Cancel</Button><Button onClick={handleBook} loading={booking}>Confirm Booking</Button></>}>
        <div className="space-y-4">
          <Select label="Department *" value={form.departmentId} onChange={e => setForm(p => ({ ...p, departmentId: e.target.value, timeSlot: null }))}
            options={[{ value: '', label: 'Select department...' }, ...depts.map(d => ({ value: d._id, label: d.name }))]} />
          <Input label="Date *" type="date" min={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value, timeSlot: null }))} />

          {form.departmentId && form.date && (
            <div>
              <label className="label">Available Time Slots *</label>
              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No slots available for this date</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {slots.map(s => (
                    <button key={s.start} disabled={!s.available}
                      onClick={() => setForm(p => ({ ...p, timeSlot: { start: s.start, end: s.end } }))}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all
                        ${!s.available ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-surface-800 border-[var(--border)] text-[var(--text-muted)]'
                        : form.timeSlot?.start === s.start ? 'bg-civic-500 text-white border-civic-500 shadow-glow'
                        : 'border-[var(--border)] hover:border-civic-400 hover:bg-civic-50 dark:hover:bg-civic-950/20 text-[var(--text-secondary)]'}`}>
                      {s.start}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Select label="Service Type" value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}
            options={['General', 'Certificate', 'Grievance', 'Payment', 'Enquiry'].map(s => ({ value: s, label: s }))} />
          <div>
            <label className="label">Notes (optional)</label>
            <textarea className="input resize-none" rows={3} placeholder="Any specific requirements..."
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
