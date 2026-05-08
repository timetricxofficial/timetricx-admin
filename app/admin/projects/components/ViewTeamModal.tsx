'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Globe } from 'lucide-react'
import Image from 'next/image'

interface ViewTeamModalProps {
  isOpen: boolean
  onClose: () => void
  teamEmails: string[]
  projectName: string
  theme: 'light' | 'dark'
}

export default function ViewTeamModal({ isOpen, onClose, teamEmails, projectName, theme }: ViewTeamModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 10)
      if (teamEmails.length > 0) {
        fetchTeamDetails()
      }
    } else {
      setShow(false)
    }
  }, [isOpen, teamEmails])

  const fetchTeamDetails = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users/get-all-users?limit=1000')
      const data = await res.json()
      if (data.success) {
        const filteredUsers = data.data.filter((u: any) => teamEmails.includes(u.email))
        setUsers(filteredUsers)
      }
    } catch (err) {
      console.error('Failed to fetch team details', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center'
    }}>
      <div style={{
        width: '40%',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: 20,
        marginRight: '4rem',
        borderRadius: 18,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 8px 30px rgba(59,130,246,0.3)',
        border: theme === 'dark' ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(59,130,246,0.2)',
        background: theme === 'dark' ? 'rgba(17,24,39,0.25)' : 'rgba(255,255,255,0.25)',
        transform: show ? 'translateX(0)' : 'translateX(120%)',
        transition: 'all 0.45s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
      className="hide-scrollbar"
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 25
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme === 'dark' ? '#fff' : '#111' }}>
              Team Members
            </h3>
            <p style={{ fontSize: '13px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {projectName}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              color: theme === 'dark' ? '#ccc' : '#555',
              fontSize: 18,
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}
          >
            ✖
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          overflowY: 'auto',
          flex: 1
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: theme === 'dark' ? '#fff' : '#111' }}>
              Loading team details...
            </div>
          ) : users.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {users.map((user) => (
                <div 
                  key={user._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '14px',
                    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Left: Profile Picture */}
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    background: '#3b82f6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexShrink: 0
                  }}>
                    {(() => {
                      const profilePic = user.profilePicture || user.authProviders?.google?.image;
                      if (profilePic) {
                        return (
                          <img 
                            src={profilePic} 
                            alt={user.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + user.name;
                            }}
                          />
                        );
                      }
                      return (
                        <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Right: Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ 
                      fontSize: '15px', 
                      fontWeight: 600, 
                      color: theme === 'dark' ? '#fff' : '#111',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user.name}
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} style={{ color: '#3b82f6' }} />
                        <span style={{ 
                          fontSize: '12px', 
                          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {user.email}
                        </span>
                      </div>
                      
                      {user.authProviders?.google?.email && user.authProviders.google.email !== user.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Globe size={12} style={{ color: '#10b981' }} />
                          <span style={{ 
                            fontSize: '11px', 
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            Google: {user.authProviders.google.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              No team details found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
