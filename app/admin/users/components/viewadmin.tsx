'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'

interface AdminData {
  _id: string
  name: string
  email: string
  designation: string
  mobileNumber: string
  profilePicture?: string
  status: string
  edit: boolean
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

interface ViewAdminProps {
  email: string
  close: () => void
}

export default function ViewAdmin({ email, close }: ViewAdminProps) {
  const { theme } = useTheme()
  const [show, setShow] = useState(false)
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setShow(true)
    fetchAdmin()
  }, [email])

  const fetchAdmin = async () => {
    try {
      const res = await fetch(`/api/admin/getadmins`)
      const data = await res.json()
      
      if (data.success) {
        const foundAdmin = data.data.find((a: AdminData) => a.email === email)
        setAdmin(foundAdmin || null)
      }
    } catch (err) {
      console.error('Failed to fetch admin', err)
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
            Admin Details
          </h2>

          <button
            onClick={close}
            style={{
              color: theme === 'dark' ? '#ccc' : '#555',
              fontSize: '18px'
            }}
          >✖</button>
        </div>

        {loading ? (
          <div style={{ marginTop: 40, textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
            Loading...
          </div>
        ) : admin ? (
          <div style={{ marginTop: 25 }}>
            {/* PROFILE PICTURE */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <img
                src={admin.profilePicture || '/avatar.png'}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: theme === 'dark' ? '2px solid #444' : '2px solid #ddd'
                }}
              />
            </div>

            {/* INFO GRID */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16
            }}>
              <InfoBox label="Name" value={admin.name} theme={theme} />
              <InfoBox label="Email" value={admin.email} theme={theme} />
              <InfoBox label="Designation" value={admin.designation} theme={theme} />
              <InfoBox label="Mobile Number" value={admin.mobileNumber} theme={theme} />
              <InfoBox label="Status" value={admin.status} theme={theme} />
              <InfoBox 
                label="Edit Permission" 
                value={admin.edit ? 'Yes' : 'No'} 
                theme={theme}
                valueColor={admin.edit ? '#22c55e' : '#ef4444'}
              />
              <InfoBox 
                label="Account Status" 
                value={admin.isDisabled ? 'Disabled' : 'Enabled'} 
                theme={theme}
                valueColor={admin.isDisabled ? '#ef4444' : '#22c55e'}
              />
              <InfoBox 
                label="Created At" 
                value={new Date(admin.createdAt).toLocaleDateString()} 
                theme={theme} 
              />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 40, textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
            Admin not found
          </div>
        )}

      </div>
    </div>
  )
}

function InfoBox({ label, value, theme, valueColor }: { label: string, value: string, theme: string, valueColor?: string }) {
  return (
    <div style={{
      padding: 12,
      borderRadius: 10,
      background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
    }}>
      <label style={{
        fontSize: 11,
        color: theme === 'dark' ? '#888' : '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {label}
      </label>
      <div style={{
        marginTop: 4,
        fontSize: 14,
        fontWeight: 500,
        color: valueColor || (theme === 'dark' ? '#fff' : '#111')
      }}>
        {value || '-'}
      </div>
    </div>
  )
}
