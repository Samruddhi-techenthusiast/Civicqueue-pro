import { useEffect, useState } from 'react'
import { Calendar, Search, CheckCircle } from 'lucide-react'
import { Card, Table, Pagination, Select } from '../../components/ui/index.jsx'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { formatTime, getApptBadge } from '../../utils'
import { useAuth } from '../../hooks'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function StaffAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const deptId = user?.department

  const load = async () => {
    if (!deptId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/appointments/department/${deptId}`, { params: { date, page, limit: 15 } })
      setAppointments(data.data || [])
      setPagination(data.pagination)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, date])

  const handleCheckIn = async (id) => {
    try {
      const { data } = await api.post(`/appointments/${id}/checkin`)
      toast.success(`Checked in — Token: ${data.data?.token?.tokenNumber}`)
      load()
    } catch { }
  }

  const columns = [
    { key: 'timeSlot', label: 'Time', render: (_, row) => <span className="font-mono font-medium text-[var(--text-primary)]">{row.timeSlot?.start}</span> },
    { key: 'citizen', label: 'Citizen', render: (_, row) => (
      <div>
        <p className="font-medium text-[var(--text-primary)]">{row.citizen?.name || '—'}</p>
        <p className="text-xs text-[var(--text-muted)]">{row.citizen?.phone || row.citizen?.email}</p>
      </div>
    )},
    { key: 'serviceType', label: 'Service' },
    { key: 'status', label: 'Status', render: v => <span className={getApptBadge(v)}>{v?.replace('_', ' ')}</span> },
    { key: 'actions', label: '', render: (_, row) => (
      ['scheduled', 'confirmed'].includes(row.status) && (
        <Button size="sm" onClick={() => handleCheckIn(row._id)}>
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Check In
        </Button>
      )
    )},
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title">Today's Appointments</h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage appointment check-ins</p>
      </div>
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <Input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1) }} className="w-44" />
        </div>
        <Table columns={columns} data={appointments} loading={loading} emptyMessage="No appointments for this date" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>
    </div>
  )
}
