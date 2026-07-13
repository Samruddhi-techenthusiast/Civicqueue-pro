import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Building2, Edit2, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import { useAppDispatch, useDepartments } from '../../hooks'
import { fetchDepartments, createDepartment, updateDepartment } from '../../store/slices/otherSlices'
import { Card, Table, Pagination, Badge } from '../../components/ui/index.jsx'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'
import api from '../../services/api'

const emptyForm = { name: '', code: '', description: '', location: '', activeCounters: 1, avgServiceTimeMinutes: 5, maxQueueSize: 200, contactEmail: '' }

export default function DepartmentManagement() {
  const dispatch = useAppDispatch()
  const { list, pagination, loading } = useDepartments()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchDepartments({ page, limit: 10, search: search || undefined }))
  }, [page, search])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit   = (d) => { setEditing(d); setForm({ name: d.name, code: d.code, description: d.description || '', location: d.location || '', activeCounters: d.activeCounters, avgServiceTimeMinutes: d.avgServiceTimeMinutes, maxQueueSize: d.maxQueueSize, contactEmail: d.contactEmail || '' }); setShowModal(true) }

  const handleSave = async () => {
    if (!form.name || !form.code) return toast.error('Name and code are required')
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updateDepartment({ id: editing._id, payload: form }))
        // Propagate queue settings to today's active queue
        try {
          await api.patch(`/departments/${editing._id}/settings`, {
            avgServiceTimeMinutes: parseInt(form.avgServiceTimeMinutes),
            maxQueueSize: parseInt(form.maxQueueSize),
            activeCounters: parseInt(form.activeCounters),
          })
        } catch { /* non-critical — queue may not exist today */ }
        toast.success('Department updated')
      } else {
        await dispatch(createDepartment(form))
        toast.success('Department created')
      }
      setShowModal(false)
    } catch { } finally { setSaving(false) }
  }

  const handleToggle = async (d) => {
    await dispatch(updateDepartment({ id: d._id, payload: { isActive: !d.isActive } }))
    toast.success(d.isActive ? 'Department deactivated' : 'Department activated')
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const columns = [
    { key: 'code', label: 'Code', render: v => <span className="font-mono font-bold text-civic-600 dark:text-civic-400">{v}</span> },
    { key: 'name', label: 'Name', render: v => <span className="font-medium text-[var(--text-primary)]">{v}</span> },
    { key: 'location', label: 'Location', render: v => v || '—' },
    { key: 'activeCounters', label: 'Counters', render: v => <span className="font-medium">{v}</span> },
    { key: 'avgServiceTimeMinutes', label: 'Avg Time', render: v => `${v} min` },
    { key: 'isActive', label: 'Status', render: v => <span className={v ? 'badge-green' : 'badge-gray'}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors">
          <Edit2 className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
        <button onClick={() => handleToggle(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors">
          {row.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="section-title">Department Management</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage government departments and services</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>New Department</Button>
      </div>

      <Card>
        <div className="mb-5">
          <Input icon={Search} placeholder="Search departments..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="max-w-sm" />
        </div>
        <Table columns={columns} data={list} loading={loading} emptyMessage="No departments found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Edit Department' : 'Create Department'} size="lg"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Create'}</Button></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Department Name *" value={form.name} onChange={set('name')} placeholder="Revenue Department" />
          <Input label="Code *" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="REV" hint="Short uppercase code" />
          <Input label="Location" value={form.location} onChange={set('location')} placeholder="Block A, Ground Floor" />
          <Input label="Contact Email" type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="dept@gov.in" />
          <Input label="Active Counters" type="number" min={1} max={50} value={form.activeCounters} onChange={set('activeCounters')} />
          <Input label="Avg Service Time (min)" type="number" min={1} value={form.avgServiceTimeMinutes} onChange={set('avgServiceTimeMinutes')} />
          <Input label="Max Queue Size" type="number" min={1} value={form.maxQueueSize} onChange={set('maxQueueSize')} />
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} placeholder="Brief description of services offered..." value={form.description} onChange={set('description')} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
