'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'

interface Announcement {
  _id: string
  title: string
  description: string
  link?: string
  linkText: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  startAt: string
  endAt: string
  isActive: boolean
  targetAudienceType: 'all' | 'selected' | 'workingRole'
  targetAudienceData: string[]
}

interface EditAnnouncementProps {
  announcement: Announcement
  onClose: () => void
}

export default function EditAnnouncement({ announcement, onClose }: EditAnnouncementProps) {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const [show, setShow] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: announcement.title,
    description: announcement.description,
    link: announcement.link || '',
    linkText: announcement.linkText,
    type: announcement.type,
    startAt: new Date(announcement.startAt).toISOString().slice(0, 16),
    endAt: new Date(announcement.endAt).toISOString().slice(0, 16),
    targetAudienceType: announcement.targetAudienceType || 'all',
    targetAudienceData: announcement.targetAudienceData || [],
    isActive: announcement.isActive
  })

  useEffect(() => {
    setShow(true)
  }, [])

  const updateAnnouncement = async () => {
    // Validation
    if (!form.title.trim()) {
      error('Please enter a title')
      return
    }
    if (!form.description.trim()) {
      error('Please enter a description')
      return
    }

    const startDate = new Date(form.startAt)
    const endDate = new Date(form.endAt)

    if (endDate <= startDate) {
      error('End date must be after start date')
      return
    }

    // Validate URL if provided
    if (form.link) {
      try {
        new URL(form.link)
      } catch {
        error('Please enter a valid URL')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/admin/announcements/${announcement._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          link: form.link || null,
          linkText: form.linkText,
          type: form.type,
          startAt: form.startAt,
          endAt: form.endAt,
          targetAudienceType: form.targetAudienceType,
          targetAudienceData: form.targetAudienceData,
          isActive: form.isActive
        })
      })

      const data = await res.json()

      if (data.success) {
        success('Announcement updated successfully!')
        onClose()
      } else {
        error(data.message || 'Failed to update announcement')
      }
    } catch (err) {
      error('Error updating announcement. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center'
    }}>
      {/* SLIDE PANEL */}
      <div style={{
        width: '40%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: 20,
        marginRight: '4rem',
        borderRadius: 18,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 8px 30px rgba(59,130,246,0.3)',
        border: theme === 'dark'
          ? '1px solid rgba(59,130,246,0.3)'
          : '1px solid rgba(59,130,246,0.2)',
        background: theme === 'dark'
          ? 'rgba(17,24,39,0.25)'
          : 'rgba(255,255,255,0.25)',
        transform: show ? 'translateX(0)' : 'translateX(120%)',
        transition: 'all 0.45s ease',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      className="hide-scrollbar"
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme === 'dark' ? '#fff' : '#111'
          }}>
            Edit Announcement
          </h2>
          <button
            onClick={onClose}
            style={{
              color: theme === 'dark' ? '#ccc' : '#555',
              fontSize: 18
            }}
          >✖</button>
        </div>

        {/* CONTENT */}
        <div style={{ marginTop: 25 }}>
          {/* BASIC INFO */}
          <Box theme={theme} title="Basic Information">
            <Input
              label="Title *"
              value={form.title}
              onChange={(v: string) => setForm({ ...form, title: v })}
              theme={theme}
            />
            <Textarea
              label="Description *"
              value={form.description}
              onChange={(v: string) => setForm({ ...form, description: v })}
              theme={theme}
            />
          </Box>

          {/* LINK */}
          <Box theme={theme} title="Link (Optional)" mt>
            <Row>
              <Input
                label="URL"
                value={form.link}
                onChange={(v: string) => setForm({ ...form, link: v })}
                theme={theme}
                placeholder="https://..."
              />
              <Input
                label="Link Text"
                value={form.linkText}
                onChange={(v: string) => setForm({ ...form, linkText: v })}
                theme={theme}
              />
            </Row>
          </Box>

          {/* TYPE */}
          <Box theme={theme} title="Type" mt>
            <Select
              label="Type"
              value={form.type}
              options={[
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'success', label: 'Success' },
                { value: 'urgent', label: 'Urgent' }
              ]}
              onChange={(v: string) => setForm({ ...form, type: v as any })}
              theme={theme}
            />
          </Box>

          {/* SCHEDULE */}
          <Box theme={theme} title="Schedule" mt>
            <Row>
              <Input
                label="Start At *"
                type="datetime-local"
                value={form.startAt}
                onChange={(v: string) => setForm({ ...form, startAt: v })}
                theme={theme}
              />
              <Input
                label="End At *"
                type="datetime-local"
                value={form.endAt}
                onChange={(v: string) => setForm({ ...form, endAt: v })}
                theme={theme}
              />
            </Row>
          </Box>

          {/* TARGET AUDIENCE */}
          <TargetAudienceSection form={form} setForm={setForm} theme={theme} />

          {/* STATUS */}
          <Box theme={theme} title="Status" mt>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" style={{
                fontSize: 14,
                color: theme === 'dark' ? '#fff' : '#111'
              }}>
                Active
              </label>
            </div>
          </Box>

          {/* ACTIONS */}
          <div style={{ marginTop: 25, display: 'flex', gap: 10 }}>
            <Btn theme={theme} onClick={onClose} disabled={isSubmitting}>Cancel</Btn>
            <Btn primary onClick={updateAnnouncement} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Announcement'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- TARGET AUDIENCE SECTION ---------------- */

function TargetAudienceSection({ form, setForm, theme }: any) {
  const [users, setUsers] = useState<any[]>([])
  const [workingRoles, setWorkingRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch users when 'selected' type is chosen
  useEffect(() => {
    if (form.targetAudienceType === 'selected' && users.length === 0) {
      setLoading(true)
      fetch('/api/admin/users/get-all-users?limit=1000')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUsers(data.data)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [form.targetAudienceType])

  // Fetch working roles from DB when 'workingRole' type is chosen
  useEffect(() => {
    if (form.targetAudienceType === 'workingRole' && workingRoles.length === 0) {
      setLoading(true)
      fetch('/api/admin/users/working-roles')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setWorkingRoles(data.data)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [form.targetAudienceType])

  const toggleEmail = (email: string) => {
    const current = form.targetAudienceData
    if (current.includes(email)) {
      setForm({ ...form, targetAudienceData: current.filter((e: string) => e !== email) })
    } else {
      setForm({ ...form, targetAudienceData: [...current, email] })
    }
  }

  const toggleRole = (role: string) => {
    const current = form.targetAudienceData
    if (current.includes(role)) {
      setForm({ ...form, targetAudienceData: current.filter((r: string) => r !== role) })
    } else {
      setForm({ ...form, targetAudienceData: [...current, role] })
    }
  }

  return (
    <Box theme={theme} title="Target Audience" mt>
      {/* Type Selection */}
      <Select
        label="Target Type"
        value={form.targetAudienceType}
        options={[
          { value: 'all', label: 'All Users' },
          { value: 'selected', label: 'Selected Users' },
          { value: 'workingRole', label: 'By Working Role' }
        ]}
        onChange={(v: string) => setForm({ ...form, targetAudienceType: v as any, targetAudienceData: [] })}
        theme={theme}
      />

      {/* Selected Users Dropdown */}
      {form.targetAudienceType === 'selected' && (
        <div style={{ marginTop: 12 }}>
          <label style={{
            fontSize: 12,
            color: theme === 'dark' ? '#aaa' : '#555',
            marginBottom: 5,
            display: 'block'
          }}>
            Select Users ({form.targetAudienceData.length} selected)
          </label>
          {loading ? (
            <div style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: 13 }}>Loading users...</div>
          ) : (
            <div style={{
              maxHeight: 200,
              overflowY: 'auto',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)',
              borderRadius: 8,
              padding: 8,
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'
            }}>
              {users.map((user: any) => (
                <div
                  key={user._id}
                  onClick={() => toggleEmail(user.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    background: form.targetAudienceData.includes(user.email)
                      ? theme === 'dark' ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.15)'
                      : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.targetAudienceData.includes(user.email)}
                    onChange={() => {}}
                    style={{ cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: 13, color: theme === 'dark' ? '#fff' : '#111' }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: theme === 'dark' ? '#aaa' : '#666' }}>{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Working Role Selection */}
      {form.targetAudienceType === 'workingRole' && (
        <div style={{ marginTop: 12 }}>
          <label style={{
            fontSize: 12,
            color: theme === 'dark' ? '#aaa' : '#555',
            marginBottom: 5,
            display: 'block'
          }}>
            Select Working Roles ({form.targetAudienceData.length} selected)
          </label>
          {loading ? (
            <div style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: 13 }}>Loading roles...</div>
          ) : workingRoles.length === 0 ? (
            <div style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: 13 }}>
              No working roles found in database.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              maxHeight: 200,
              overflowY: 'auto',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)',
              borderRadius: 8,
              padding: 12,
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'
            }}>
              {workingRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 16,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    background: form.targetAudienceData.includes(role)
                      ? '#3b82f6'
                      : theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    color: form.targetAudienceData.includes(role) ? '#fff' : theme === 'dark' ? '#ccc' : '#333'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {form.targetAudienceType === 'all' && (
        <div style={{ marginTop: 10, fontSize: 13, color: theme === 'dark' ? '#aaa' : '#666' }}>
          Announcement will be visible to all users.
        </div>
      )}
    </Box>
  )
}

/* ---------------- HELPERS ---------------- */

function Box({ children, theme, title, mt }: any) {
  return (
    <div style={{
      padding: 14,
      borderRadius: 14,
      marginTop: mt ? 22 : 0,
      background: theme === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.04)'
    }}>
      <b style={{
        fontSize: 13,
        color: theme === 'dark' ? '#aaa' : '#444'
      }}>{title}</b>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', theme, placeholder, min, max }: any) {
  return (
    <div style={{ marginBottom: 12, flex: 1 }}>
      <label style={{
        fontSize: 12,
        color: theme === 'dark' ? '#aaa' : '#555',
        marginBottom: 5,
        display: 'block'
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{
          ...inputStyle,
          border: theme === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.15)',
          background: theme === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.8)',
          color: theme === 'dark' ? '#fff' : '#111'
        }}
      />
    </div>
  )
}

function Textarea({ label, value, onChange, theme }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        fontSize: 12,
        color: theme === 'dark' ? '#aaa' : '#555',
        marginBottom: 5,
        display: 'block'
      }}>{label}</label>
      <textarea
        value={value}
        rows={4}
        onChange={e => onChange(e.target.value)}
        style={{
          ...inputStyle,
          border: theme === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.15)',
          background: theme === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.8)',
          color: theme === 'dark' ? '#fff' : '#111',
          resize: 'vertical'
        }}
      />
    </div>
  )
}

function Select({ label, value, options, onChange, theme }: any) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{
        fontSize: 12,
        color: theme === 'dark' ? '#aaa' : '#555',
        marginBottom: 5,
        display: 'block'
      }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...inputStyle,
          border: theme === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.15)',
          background: theme === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.8)',
          color: theme === 'dark' ? '#fff' : '#111'
        }}
      >
        {options.map((o: any) => (
          <option
            key={o.value}
            value={o.value}
            style={{
              background: theme === 'dark' ? '#1f2937' : '#fff',
              color: theme === 'dark' ? '#fff' : '#111'
            }}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Row({ children }: any) {
  return <div style={{ display: 'flex', gap: 10 }}>{children}</div>
}

function Btn({ children, onClick, primary, theme, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 8,
        border: primary ? 'none' : '1px solid rgba(0,0,0,0.2)',
        background: primary ? (disabled ? '#93c5fd' : '#3b82f6') : 'transparent',
        color: primary ? '#fff' : theme === 'dark' ? '#fff' : '#111',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1
      }}
    >
      {children}
    </button>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.15)',
  fontSize: 14
}
