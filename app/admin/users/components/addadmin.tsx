'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'

interface AddAdminProps {
  close: () => void
  onSuccess?: () => void
}

export default function AddAdmin({ close, onSuccess }: AddAdminProps) {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    designation: '',
    mobileNumber: '',
    edit: false,
    status: 'admin'
  })

  useEffect(() => {
    setShow(true)
  }, [])

  // SAVE ADMIN
  const saveAdmin = async () => {
    // Validation
    if (!form.name.trim()) {
      error('Name is required')
      return
    }
    
    if (!form.email.trim()) {
      error('Email is required')
      return
    }
    if (!form.mobileNumber.trim()) {
      error('Mobile number is required')
      return
    }
    if (!form.password.trim()) {
      error('Password is required')
      return
    }
    if (form.password.length < 6) {
      error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/createadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      if (res.ok) {
        success('Admin created successfully')
        onSuccess?.()
        close()
      } else {
        const data = await res.json()
        error(data.message || 'Failed to create admin')
      }
    } catch {
      error('Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}
    >
      {/* SLIDE PANEL */}
      <div
        style={{
          width: '40%',
          maxHeight: '75vh',
          overflowY: 'auto',
          padding: '20px',
          marginRight: '4rem',
          borderRadius: '18px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 8px 30px rgba(59,130,246,0.3), 0 15px 60px rgba(37,99,235,0.2)',
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
            fontSize: '18px',
            fontWeight: 600,
            color: theme === 'dark' ? '#fff' : '#111'
          }}>
            Add Admin
          </h2>

          <button
            onClick={close}
            style={{
              color: theme === 'dark' ? '#ccc' : '#555',
              fontSize: '18px'
            }}
          >✖</button>
        </div>

        {/* FORM */}
        <div style={{ marginTop: 25 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16
          }}>
            {/* LEFT COLUMN */}
            <div>
              {/* NAME */}
              <div style={{ marginBottom: 16 }}>
                {Input('Name', form.name, (v: any) => setForm({ ...form, name: v }), theme)}
              </div>

              {/* DESIGNATION */}
              <div style={{ marginBottom: 16 }}>
                {Input('Designation', form.designation, (v: any) => setForm({ ...form, designation: v }), theme)}
              </div>

              {/* EMAIL */}
              <div style={{ marginBottom: 16 }}>
                {Input('Email', form.email, (v: any) => setForm({ ...form, email: v }), theme, 'email')}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              {/* MOBILE */}
              <div style={{ marginBottom: 16 }}>
                {Input('Mobile Number', form.mobileNumber, (v: any) => setForm({ ...form, mobileNumber: v }), theme)}
              </div>

              {/* PASSWORD */}
              <div style={{ marginBottom: 16 }}>
                {Input('Password', form.password, (v: any) => setForm({ ...form, password: v }), theme, 'password')}
              </div>

              {/* STATUS */}
              <div style={{ marginBottom: 16 }}>
                {Select('Status', ['admin', 'superadmin'], form.status, (v: any) => setForm({ ...form, status: v }), theme)}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 16,
            marginTop: 16
          }}>
            {/* EDIT PERMISSION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{
                fontSize: 13,
                color: theme === 'dark' ? '#bbb' : '#444'
              }}>
                Edit Permission:
              </label>
              <button
                onClick={() => setForm({ ...form, edit: !form.edit })}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  background: form.edit ? '#22c55e' : '#ef4444',
                  color: '#fff',
                  transition: 'all 0.2s'
                }}
              >
                {form.edit ? 'Yes' : 'No'}
              </button>
            </div>
          </div>
        </div>

        {/* SAVE */}
        <button
          onClick={saveAdmin}
          disabled={loading}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '10px',
            borderRadius: 12,
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 600,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none'
          }}
        >
          {loading ? 'Creating...' : 'Create Admin'}
        </button>

      </div>
    </div>
  )
}

/* UI helpers */

function Input(label: any, value: any, onChange: any, theme: any, type: string = 'text') {
  return (
    <div>
      <label style={{
        fontSize: 13,
        color: theme === 'dark' ? '#bbb' : '#444',
        display: 'block',
        marginBottom: 6
      }}>{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: 10,
          border: theme === 'dark'
            ? '1px solid #555'
            : '1px solid #ddd',
          background: theme === 'dark' ? '#1f2937' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000',
          outline: 'none'
        }}
      />
    </div>
  )
}

function Select(label: any, opts: any, val: any, onChange: any, theme: any) {
  return (
    <div>
      <label style={{
        fontSize: 13,
        color: theme === 'dark' ? '#bbb' : '#444',
        display: 'block',
        marginBottom: 6
      }}>{label}</label>

      <select
        value={val}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: 10,
          border: theme === 'dark'
            ? '1px solid #555'
            : '1px solid #ddd',
          background: theme === 'dark' ? '#1f2937' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {opts.map((o: any) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}
