'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'

export default function EditProjects({
  project,
  onClose
}: {
  project: any
  onClose: () => void
}) {
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

  /* ---------- ROLE SEARCH ---------- */
  const [roleQuery, setRoleQuery] = useState('')
  const [roleUsers, setRoleUsers] = useState<any[]>([])

  const workingRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'Graphics Designer',
    'UI/UX Designer',
    'DevOps Engineer',
    'QA Engineer',
    'Mobile Developer',
    'Project Manager',
    'Product Manager'
  ]

  /* ---------- PRE-FILL PROJECT DATA ---------- */
  useEffect(() => {
    setShow(true)
    if (project) {
      setForm({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'pending',
        priority: project.priority || 'medium',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        totalTasks: project.tasks?.total?.toString() || '',
        descriptionDriveLink: project.descriptionDriveLink || '',
        teamEmails: project.teamEmails || []
      })
    }
  }, [project])

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

  /* ---------- ROLE SEARCH API ---------- */
  const searchByRole = async (role: string) => {
    setRoleQuery(role)

    if (!role) {
      setRoleUsers([])
      return
    }

    const res = await fetch(
      `/api/admin/projects/search-by-role?role=${role}`
    )
    const data = await res.json()
    setRoleUsers(data.data || [])
  }

  /* ---------- UPDATE PROJECT ---------- */
  const updateProject = async () => {
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
      const res = await fetch(`/api/admin/projects/${project._id}`, {
        method: 'PUT',
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
        onClose()
        success('Project updated successfully!')
      } else {
        error('Failed to update project: ' + data.message)
      }
    } catch (err) {
      error('Error updating project. Please try again.')
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
        boxShadow:
          '0 20px 50px rgba(0,0,0,0.4), 0 8px 30px rgba(59,130,246,0.3)',
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
            Edit Project
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
              style={{
                colorScheme: theme === 'dark' ? 'dark' : 'light'
              }}
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
            
            {/* Search Row - 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {/* Search by Skill */}
              <div>
                <Input
                  label="Search by Skill"
                  value={skillQuery}
                  onChange={searchBySkill}
                  theme={theme}
                />
                
                {/* Skill Users in same column */}
                {skillUsers.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: theme === 'dark' ? '#888' : '#666', marginBottom: 4 }}>Skill Results</p>
                    {skillUsers.filter(u => !form.teamEmails.includes(u.email)).map(u => (
                      <div
                        key={`skill-${u.email}`}
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
                          marginTop: 4,
                          borderRadius: 6,
                          cursor: 'pointer',
                          background: theme === 'dark'
                            ? 'rgba(59,130,246,0.15)'
                            : 'rgba(59,130,246,0.1)',
                          borderLeft: '2px solid #3b82f6',
                          transition: 'all 0.2s'
                        }}
                      >
                        <b style={{ fontSize: 12 }}>{u.name}</b>
                        <div style={{ fontSize: 10, color: theme === 'dark' ? '#aaa' : '#666' }}>{u.email}</div>
                      </div>
                    ))}
                    
                    {/* Add all / Deselect all skill users button */}
                    {skillUsers.length > 0 && (
                      <button
                        onClick={() => {
                          const unselectedUsers = skillUsers.filter(u => !form.teamEmails.includes(u.email))
                          if (unselectedUsers.length > 0) {
                            // Add all unselected users
                            const newEmails = unselectedUsers.map(u => u.email)
                            setForm({
                              ...form,
                              teamEmails: [...form.teamEmails, ...newEmails]
                            })
                          } else {
                            // Deselect all skill users
                            const skillEmails = skillUsers.map(u => u.email)
                            setForm({
                              ...form,
                              teamEmails: form.teamEmails.filter(email => !skillEmails.includes(email))
                            })
                          }
                        }}
                        style={{
                          marginTop: 6,
                          padding: '4px 8px',
                          fontSize: 10,
                          backgroundColor: skillUsers.some(u => !form.teamEmails.includes(u.email)) ? '#3b82f6' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        {skillUsers.some(u => !form.teamEmails.includes(u.email)) 
                          ? `Add All (${skillUsers.filter(u => !form.teamEmails.includes(u.email)).length})`
                          : 'Deselect All'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search by Working Role */}
              <div>
                <Select
                  label="Search by Working Role"
                  value={roleQuery}
                  options={['', ...workingRoles]}
                  onChange={searchByRole}
                  theme={theme}
                />
                
                {/* Role Users in same column */}
                {roleUsers.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 11, color: theme === 'dark' ? '#888' : '#666', marginBottom: 4 }}>Role Results</p>
                    {roleUsers.filter(u => !form.teamEmails.includes(u.email)).map(u => (
                      <div
                        key={`role-${u.email}`}
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
                          marginTop: 4,
                          borderRadius: 6,
                          cursor: 'pointer',
                          background: theme === 'dark'
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(16,185,129,0.1)',
                          borderLeft: '2px solid #10b981',
                          transition: 'all 0.2s'
                        }}
                      >
                        <b style={{ fontSize: 12 }}>{u.name}</b>
                        <div style={{ fontSize: 10, color: theme === 'dark' ? '#aaa' : '#666' }}>{u.email}</div>
                        <div style={{ fontSize: 9, color: '#10b981', marginTop: 1 }}>{u.workingRole || u.designation}</div>
                      </div>
                    ))}
                    
                    {/* Add all / Deselect all role users button */}
                    {roleUsers.length > 0 && (
                      <button
                        onClick={() => {
                          const unselectedUsers = roleUsers.filter(u => !form.teamEmails.includes(u.email))
                          if (unselectedUsers.length > 0) {
                            // Add all unselected users
                            const newEmails = unselectedUsers.map(u => u.email)
                            setForm({
                              ...form,
                              teamEmails: [...form.teamEmails, ...newEmails]
                            })
                          } else {
                            // Deselect all role users
                            const roleEmails = roleUsers.map(u => u.email)
                            setForm({
                              ...form,
                              teamEmails: form.teamEmails.filter(email => !roleEmails.includes(email))
                            })
                          }
                        }}
                        style={{
                          marginTop: 6,
                          padding: '4px 8px',
                          fontSize: 10,
                          backgroundColor: roleUsers.some(u => !form.teamEmails.includes(u.email)) ? '#10b981' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        {roleUsers.some(u => !form.teamEmails.includes(u.email)) 
                          ? `Add All (${roleUsers.filter(u => !form.teamEmails.includes(u.email)).length})`
                          : 'Deselect All'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

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
            <Btn primary onClick={updateProject}>Update Project</Btn>
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

function Input({ label, value, onChange, type = 'text', theme, placeholder, style = {} }: any) {
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
        placeholder={placeholder}
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
          ...style
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
