'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'

export default function AddProject({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const [show, setShow] = useState(false)

  /* ---------- FORM STATE ---------- */
  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    deadline: '',
    totalTasks: '',
    descriptionDriveLink: '',
    teamEmails: []
  })

  /* ---------- SKILL SEARCH ---------- */
  const [skillQuery, setSkillQuery] = useState('')
  const [skillUsers, setSkillUsers] = useState<any[]>([])

  useEffect(() => {
    setShow(true)
  }, [])

  /* ---------- SKILL SEARCH API ---------- */
  const searchBySkill = async (value: string) => {
    setSkillQuery(value)

    if (value.length < 2) {
      setSkillUsers([])
      return
    }

    const res = await fetch(
      `/api/admin/projects/search-by-skill?skill=${value}`
    )
    const data = await res.json()
    setSkillUsers(data.data || [])
  }

  /* ---------- CREATE PROJECT ---------- */
  const createProject = async () => {
    // Validation
    if (!form.name.trim()) {
      error('Please enter a project name')
      return
    }
    
    if (!form.totalTasks || Number(form.totalTasks) <= 0) {
      error('Please enter a valid number of total tasks')
      return
    }
    
    if (!form.teamEmails || form.teamEmails.length === 0) {
      error('Please add at least one team member')
      return
    }

    try {
      const res = await fetch('/api/admin/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          status: form.status,
          priority: form.priority,
          deadline: form.deadline,
          descriptionDriveLink: form.descriptionDriveLink,
          teamEmails: form.teamEmails,
          tasks: {
            total: Number(form.totalTasks)
          }
        })
      })

      const data = await res.json()
      
      if (data.success) {
        console.log('Project created successfully:', data.data)
        onClose()
        success('Project created successfully!')
      } else {
        console.error('Failed to create project:', data.message)
        error('Failed to create project: ' + data.message)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      error('Error creating project. Please try again.')
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
        maxHeight: '80vh',
        overflowY: 'auto',
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
        transform: show ? 'translateX(0)' : 'translateX(120%)',
        transition: 'all 0.45s ease'
      }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme === 'dark' ? '#fff' : '#111'
          }}>
            Add Project
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

          {/* PROJECT DETAILS */}
          <Box theme={theme} title="Project Details">
            <Input label="Project Name" value={form.name}
              onChange={(v: string) => setForm({ ...form, name: v })}
              theme={theme}
            />

            <Textarea label="Description" value={form.description}
              onChange={(v: string) => setForm({ ...form, description: v })}
              theme={theme}
            />

            <Row>
               <Input
              label="Total Tasks"
              type="number"
              value={form.totalTasks}
              onChange={(v: string) => setForm({ ...form, totalTasks: v })}
              theme={theme}
            />

              <Select
                label="Priority"
                value={form.priority}
                options={['low', 'medium', 'high']}
                onChange={(v: string) => setForm({ ...form, priority: v })}
                theme={theme}
              />
            </Row>

            <Input
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(v: string) => setForm({ ...form, deadline: v })}
              theme={theme}
            />

           

            <Input
              label="Description Drive Link (Optional)"
              type="url"
              value={form.descriptionDriveLink}
              onChange={(v: string) => setForm({ ...form, descriptionDriveLink: v })}
              placeholder="https://drive.google.com/..."
              theme={theme}
            />
          </Box>

          {/* TEAM MEMBERS */}
          <Box theme={theme} title="Team Members" mt>
            <Input
              label="Search by Skill"
              value={skillQuery}
              onChange={searchBySkill}
              theme={theme}
            />

            {skillUsers.map(u => (
              <div
                key={u.email}
                onClick={() => {
                  if (!form.teamEmails.includes(u.email)) {
                    setForm({
                      ...form,
                      teamEmails: [...form.teamEmails, u.email]
                    })
                  }
                }}
                style={{
                  padding: 8,
                  marginTop: 6,
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: theme === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.7)'
                }}
              >
                <b>{u.name}</b>
                <div style={{ fontSize: 12 }}>{u.email}</div>
              </div>
            ))}

            {/* SELECTED */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {form.teamEmails.map((e: string) => (
                <span
                  key={e}
                  onClick={() =>
                    setForm({
                      ...form,
                      teamEmails: form.teamEmails.filter(x => x !== e)
                    })
                  }
                  style={{
                    padding: '6px 10px',
                    borderRadius: 20,
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  {e} ✕
                </span>
              ))}
            </div>
          </Box>

          {/* ACTIONS */}
          <div style={{ marginTop: 25, display: 'flex', gap: 10 }}>
            <Btn theme={theme} onClick={onClose}>Cancel</Btn>
            <Btn primary onClick={createProject}>Create Project</Btn>
          </div>

        </div>
      </div>
    </div>
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
        rows={3}
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
        {options.map((o: string) => (
          <option 
            key={o} 
            value={o}
            style={{
              background: theme === 'dark' ? '#1f2937' : '#fff',
              color: theme === 'dark' ? '#fff' : '#111'
            }}
          >
            {o}
          </option>
        ))}
      </select>
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

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: 8,
  border: '1px solid rgba(0,0,0,0.15)',
  fontSize: 14
}
