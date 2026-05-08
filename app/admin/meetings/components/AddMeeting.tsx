'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'

export default function AddMeeting({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const [show, setShow] = useState(false)

  const [projects, setProjects] = useState<any[]>([])
  const [admins, setAdmins] = useState<any[]>([])

  const [form, setForm] = useState({
    hostEmail: '',
    projectName: '',
    workingRole: '',
    userEmail: '',
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    isPinned: false
  })

  useEffect(() => {
    setShow(true)
    fetchProjects()
    fetchAdmins()
  }, [])

  /* -------- FETCH ADMIN EMAILS -------- */
  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/meetings/adminemail')
      const data = await res.json()
      if (data.success) setAdmins(data.data)
    } catch {
      error('Failed to load admin emails')
    }
  }
  /* -------- FETCH PROJECTS -------- */
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects/list')
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {
      error('Failed to load projects')
    }
  }

  /* -------- CREATE MEETING -------- */
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMeeting = async () => {
    if (!form.hostEmail) return error('Enter host email')
    // Any one of project, role, or user email required
    if (!form.projectName && !form.workingRole && !form.userEmail) {
      return error('Select at least one: Project, Working Role, or User Email')
    }

    // Date/Time validation only if NOT pinned
    if (!form.isPinned) {
      if (!form.date || !form.startTime || !form.endTime)
        return error('Select date & time')
    }

    if (!form.meetingLink) return error('Enter meeting link')

    setIsSubmitting(true)

    try {
      let startDateTime, endDateTime;

      if (form.isPinned) {
        // For pinned meetings, use a far-future date or just today's date as placeholder
        // Since the schema requires a Date, we provide one but UI will ignore it
        const today = new Date().toISOString().split('T')[0];
        startDateTime = new Date(`${today}T00:00:00`).toISOString();
        endDateTime = new Date(`${today}T23:59:59`).toISOString();
      } else {
        startDateTime = new Date(`${form.date}T${form.startTime}`).toISOString();
        endDateTime = new Date(`${form.date}T${form.endTime}`).toISOString();
      }

      const res = await fetch('/api/admin/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostEmail: form.hostEmail,
          projectName: form.projectName,
          workingRole: form.workingRole,
          userEmail: form.userEmail,
          meetingLink: form.meetingLink,
          startTime: startDateTime,
          endTime: endDateTime,
          isPinned: form.isPinned
        })
      })

      const data = await res.json()

      if (data.success) {
        success('Meeting scheduled successfully!')
        onClose()
      } else {
        error(data.message)
      }
    } catch {
      error('Failed to schedule meeting')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div
        style={{
          ...panelStyle(theme),
          transform: show ? 'translateX(0)' : 'translateX(120%)'
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={titleStyle(theme)}>
            Schedule Project Meeting
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: theme === 'dark' ? '#fff' : '#111'
            }}
          >
            ✖
          </button>
        </div>

        <div style={{ marginTop: 25 }}>

          <Box theme={theme} title="Meeting Details">

            {/* HOST EMAIL SELECT */}
            <Select
              label="Host Email"
              value={form.hostEmail}
              placeholder="Select Host"
              onChange={(v: string) =>
                setForm({ ...form, hostEmail: v })
              }
              options={admins.map(a => ({
                label: `${a.name} (${a.email})`,
                value: a.email
              }))}
              theme={theme}
            />

            {/* PROJECT & ROLE & USER EMAIL - Any one required */}
            {!form.workingRole && !form.userEmail && (
              <div style={{ marginBottom: 12 }}>
                <Select
                  label="Select Project (Optional)"
                  value={form.projectName}
                  onChange={(v: string) =>
                    setForm({ ...form, projectName: v, workingRole: '', userEmail: '' })
                  }
                  options={projects.map(p => ({
                    label: p.name,
                    value: p.name
                  }))}
                  theme={theme}
                />
              </div>
            )}

            {!form.projectName && !form.userEmail && (
              <div style={{ marginBottom: 12 }}>
                <Select
                  label="Select Working Role (Optional)"
                  value={form.workingRole}
                  onChange={(v: string) =>
                    setForm({ ...form, workingRole: v, projectName: '', userEmail: '' })
                  }
                  options={[
                    { label: 'Frontend Developer', value: 'Frontend Developer' },
                    { label: 'Backend Developer', value: 'Backend Developer' },
                    { label: 'Full Stack Developer', value: 'Full Stack Developer' },
                    { label: 'UI/UX Designer', value: 'UI/UX Designer' },
                    { label: 'Project Manager', value: 'Project Manager' },
                    { label: 'QA Engineer', value: 'QA Engineer' },
                    { label: 'DevOps Engineer', value: 'DevOps Engineer' },
                    { label: 'Mobile Developer', value: 'Mobile Developer' },
                    { label: 'Business Analyst', value: 'Business Analyst' },
                    { label: 'Developer', value: 'Developer' },
                  ]}
                  theme={theme}
                />
              </div>
            )}

            {!form.projectName && !form.workingRole && (
              <div style={{ marginBottom: 12 }}>
                <Input
                  label="User Email (Optional)"
                  placeholder="user@example.com"
                  value={form.userEmail}
                  onChange={(v: string) =>
                    setForm({ ...form, userEmail: v, projectName: '', workingRole: '' })
                  }
                  theme={theme}
                />
                <p style={{ fontSize: 10, color: theme === 'dark' ? '#888' : '#666', marginTop: 4 }}>
                  Fill any one: Project, Role, or User Email
                </p>
              </div>
            )}

            {/* MEETING LINK */}
            <Input
              label="Meeting Link"
              placeholder="https://meet.google.com/..."
              value={form.meetingLink}
              onChange={(v: string) =>
                setForm({ ...form, meetingLink: v })
              }
              theme={theme}
            />

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '15px',
              padding: '10px',
              borderRadius: '10px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(59,130,246,0.2)'
            }}>
              <label style={{ 
                fontSize: '13px', 
                fontWeight: 600, 
                color: theme === 'dark' ? '#fff' : '#111',
                flex: 1
              }}>
                📌 Pin this meeting (Permanent Room)
              </label>
              <input 
                type="checkbox" 
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            {!form.isPinned && (
              <>
                <Row>
                  <Input
                    type="date"
                    label="Date"
                    value={form.date}
                    onChange={(v: string) =>
                      setForm({ ...form, date: v })
                    }
                    theme={theme}
                  />
                </Row>

                <Row>
                  <Input
                    type="time"
                    label="Start Time"
                    value={form.startTime}
                    onChange={(v: string) =>
                      setForm({ ...form, startTime: v })
                    }
                    theme={theme}
                  />

                  <Input
                    type="time"
                    label="End Time"
                    value={form.endTime}
                    onChange={(v: string) =>
                      setForm({ ...form, endTime: v })
                    }
                    theme={theme}
                  />
                </Row>
              </>
            )}

          </Box>

          {/* ACTIONS */}
          <div style={{ marginTop: 25, display: 'flex', gap: 10 }}>
            <Btn theme={theme} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Btn>
            <Btn primary onClick={createMeeting} disabled={isSubmitting}>
              {isSubmitting ? 'Schedule...' : 'Schedule'}
            </Btn>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ---------------- HELPERS ---------------- */

function Box({ children, theme, title }: any) {
  return (
    <div style={{
      padding: 14,
      borderRadius: 14,
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

function Input({ label, value, onChange, type = 'text', theme }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
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

function Select({ label, value, onChange, options, theme, placeholder }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
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
          width: '100%',
          padding: '10px',
          borderRadius: 8,
          fontSize: 14,
          border: theme === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(0,0,0,0.15)',
          background: theme === 'dark'
            ? '#1f2937'
            : '#ffffff',
          color: theme === 'dark' ? '#fff' : '#111'
        }}
      >
        <option 
          value=""
          style={{
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#fff' : '#111'
          }}
        >
          {placeholder || (label.includes('Project') ? 'Select Project' : 'Select Role')}
        </option>
        {options.map((o: any) => (
          <option 
            key={o.value} 
            value={o.value}
            style={{
              background: theme === 'dark' ? '#1f2937' : '#ffffff',
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

/* -------- STYLES -------- */

const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  zIndex: 50,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center'
}

const panelStyle = (theme: string) => ({
  width: '40%',
  maxHeight: '80vh',
  overflowY: 'auto' as const,
  padding: 20,
  marginRight: 20,
  borderRadius: 18,
  backdropFilter: 'blur(16px)',
  boxShadow:
    '0 20px 50px rgba(0,0,0,0.4), 0 8px 30px rgba(59,130,246,0.3)',
  border: theme === 'dark'
    ? '1px solid rgba(59,130,246,0.3)'
    : '1px solid rgba(59,130,246,0.2)',
  background: theme === 'dark'
    ? 'rgba(17,24,39,0.25)'
    : 'rgba(255,255,255,0.25)',
  transition: 'all 0.45s ease'
})

const titleStyle = (theme: string) => ({
  fontSize: 18,
  fontWeight: 600,
  color: theme === 'dark' ? '#fff' : '#111'
})

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: 8,
  fontSize: 14
}
