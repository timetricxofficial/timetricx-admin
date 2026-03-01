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
    date: '',
    startTime: '',
    endTime: '',
    meetingLink: ''
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
  const createMeeting = async () => {
    if (!form.hostEmail) return error('Enter host email')
    if (!form.projectName && !form.workingRole) return error('Select project or working role')
    if (!form.date || !form.startTime || !form.endTime)
      return error('Select date & time')
    if (!form.meetingLink) return error('Enter meeting link')

    try {
      // Create ISO datetime strings from date + time
      const startDateTime = new Date(`${form.date}T${form.startTime}`).toISOString()
      const endDateTime = new Date(`${form.date}T${form.endTime}`).toISOString()

      const res = await fetch('/api/admin/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostEmail: form.hostEmail,
          projectName: form.projectName,
          workingRole: form.workingRole,
          meetingLink: form.meetingLink,
          startTime: startDateTime,
          endTime: endDateTime
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
              onChange={(v: string) =>
                setForm({ ...form, hostEmail: v })
              }
              options={admins.map(a => ({
                label: `${a.name} (${a.email})`,
                value: a.email
              }))}
              theme={theme}
            />

            {/* PROJECT & ROLE - Only show one based on selection */}
            {!form.workingRole && (
              <div style={{ marginBottom: 12 }}>
                <Select
                  label="Select Project"
                  value={form.projectName}
                  onChange={(v: string) =>
                    setForm({ ...form, projectName: v, workingRole: '' })
                  }
                  options={projects.map(p => ({
                    label: p.name,
                    value: p.name
                  }))}
                  theme={theme}
                />
              </div>
            )}
            
            {!form.projectName && (
              <div style={{ marginBottom: 12 }}>
                <Select
                  label="Select Working Role"
                  value={form.workingRole}
                  onChange={(v: string) =>
                    setForm({ ...form, workingRole: v, projectName: '' })
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

              <Input
                type="time"
                label="Start Time"
                value={form.startTime}
                onChange={(v: string) =>
                  setForm({ ...form, startTime: v })
                }
                theme={theme}
              />
            </Row>

            <Input
              type="time"
              label="End Time"
              value={form.endTime}
              onChange={(v: string) =>
                setForm({ ...form, endTime: v })
              }
              theme={theme}
            />

          </Box>

          {/* ACTIONS */}
          <div style={{ marginTop: 25, display: 'flex', gap: 10 }}>
            <Btn theme={theme} onClick={onClose}>
              Cancel
            </Btn>
            <Btn primary onClick={createMeeting}>
              Schedule
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

function Btn({ children, onClick, primary, theme }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 8,
        border: primary ? 'none' : '1px solid rgba(0,0,0,0.2)',
        background: primary ? '#3b82f6' : 'transparent',
        color: primary ? '#fff' : theme === 'dark' ? '#fff' : '#111',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )
}

function Select({ label, value, onChange, options, theme }: any) {
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
          {label.includes('Project') ? 'Select Project' : 'Select Role'}
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
