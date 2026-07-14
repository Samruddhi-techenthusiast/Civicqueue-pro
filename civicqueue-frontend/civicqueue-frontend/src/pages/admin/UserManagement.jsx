import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Edit2, UserX, Shield, UserPlus } from 'lucide-react'
import { Card, Table, Pagination, Select } from '../../components/ui/index.jsx'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { formatDate, roleLabel } from '../../utils'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', role: 'citizen', isActive: true })
  const [createModal, setCreateModal] = useState(false)
  const [depts, setDepts] = useState([])
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', departmentId: '' })
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const { data } = await api.get('/users', { params })
      setUsers(data.data || [])
      setPagination(data.pagination)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, roleFilter])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load() }, 400)
    return () => clearTimeout(t)
  }, [search])

  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, role: u.role, isActive: u.isActive }) }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/users/${editing._id}`, form)
      toast.success('User updated')
      setEditing(null)
      load()
    } catch { } finally { setSaving(false) }
  }

  useEffect(() => {
    api.get('/departments', { params: { limit: 50 } })
      .then(({ data }) => setDepts(data.data || []))
      .catch(() => {})
  }, [])

  const handleCreateStaff = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error('Name, email and password are required')
      return
    }
    setCreating(true)
    try {
      await api.post('/auth/create-staff', createForm)
      toast.success('Staff account created')
      setCreateModal(false)
      setCreateForm({ name: '', email: '', phone: '', password: '', departmentId: '' })
      load()
    } catch { } finally { setCreating(false) }
  }

  const handleDeactivate = async (id) => {
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deactivated')
      load()
    } catch { }
  }

  const roleBadge = (role) => {
    const map = { citizen: 'badge-gray', staff: 'badge-blue', admin: 'badge-purple', super_admin: 'badge-red' }
    return map[role] || 'badge-gray'
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-civic-100 dark:bg-civic-950/40 flex items-center justify-center text-civic-600 dark:text-civic-400 font-bold text-sm flex-shrink-0">
          {v?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-[var(--text-primary)]">{v}</p>
          <p className="text-xs text-[var(--text-muted)]">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', label: 'Role', render: v => <span className={roleBadge(v)}>{roleLabel(v)}</span> },
    { key: 'department', label: 'Department', render: (_, row) => row.department?.name || '—' },
    { key: 'isActive', label: 'Status', render: v => <span className={v ? 'badge-green' : 'badge-red'}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'createdAt', label: 'Joined', render: v => <span className="text-[var(--text-muted)]">{formatDate(v)}</span> },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors">
          <Edit2 className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
        {row.isActive && (
          <button onClick={() => handleDeactivate(row._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <UserX className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>
    )},
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="section-title">User Management</h2>
          <Button onClick={() => setCreateModal(true)} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Create Staff
          </Button>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage all registered users</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <Input icon={Search} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          <Select options={[
            { value: '', label: 'All Roles' },
            { value: 'citizen', label: 'Citizens' },
            { value: 'staff', label: 'Staff' },
            { value: 'admin', label: 'Admins' },
          ]} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="w-36" />
        </div>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found" />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit User" size="sm"
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-surface-800 mb-4">
              <div className="w-10 h-10 rounded-full bg-civic-100 dark:bg-civic-950/40 flex items-center justify-center text-civic-600 font-bold">
                {editing.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{editing.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{editing.email}</p>
              </div>
            </div>
            <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <Select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              options={[
                { value: 'citizen',     label: 'Citizen' },
                { value: 'staff',       label: 'Staff' },
                { value: 'admin',       label: 'Admin' },
                { value: 'super_admin', label: 'Super Admin' },
              ]} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded accent-civic-500" />
              <label htmlFor="active" className="text-sm font-medium text-[var(--text-secondary)]">Account Active</label>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create Staff Modal ── */}
      {createModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-5">Create Staff Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
                <input className="input w-full" placeholder="Staff full name"
                  value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email *</label>
                <input className="input w-full" type="email" placeholder="staff@example.com"
                  value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                <input className="input w-full" type="tel" placeholder="10-digit mobile"
                  value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password *</label>
                <input className="input w-full" type="password" placeholder="Min 8 characters"
                  value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Assign Department</label>
                <select className="input w-full"
                  value={createForm.departmentId} onChange={e => setCreateForm(f => ({ ...f, departmentId: e.target.value }))}>
                  <option value="">— No department yet —</option>
                  {depts.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreateStaff} disabled={creating} className="btn-primary flex-1">
                {creating ? 'Creating...' : 'Create Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}