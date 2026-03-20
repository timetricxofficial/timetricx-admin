'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../../contexts/ThemeContext'
import Loading from '@/components/ui/Loading'
import { Trash2, AlertTriangle, X, Check } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  theme: string
}

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, theme }: ConfirmModalProps) => {
  if (!isOpen) return null

  const isDark = theme === 'dark'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: 'min(400px, 90vw)',
          padding: '24px',
          borderRadius: '16px',
          background: isDark ? 'rgba(17,24,39,0.98)' : 'rgba(255,255,255,0.98)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          border: isDark ? '1px solid rgba(148,163,184,0.2)' : '1px solid rgba(0,0,0,0.1)',
          animation: 'modalSlideIn 0.2s ease'
        }}
      >
        <style>{`
          @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: isDark ? '#fff' : '#111'
            }}
          >
            {title}
          </h3>
        </div>

        <p
          style={{
            fontSize: '14px',
            color: isDark ? '#9ca3af' : '#6b7280',
            marginBottom: '24px',
            lineHeight: 1.5
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#d1d5db' : '#4b5563',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626'
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

interface SuccessToastProps {
  message: string
  isVisible: boolean
  theme: string
}

const SuccessToast = ({ message, isVisible, theme }: SuccessToastProps) => {
  if (!isVisible) return null
  const isDark = theme === 'dark'

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: isDark ? 'rgba(34,197,94,0.95)' : 'rgba(34,197,94,0.95)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 40px rgba(34,197,94,0.3)',
        zIndex: 101,
        animation: 'toastSlideIn 0.3s ease'
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={16} />
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{message}</span>
    </div>
  )
}

type DocMap = Record<string, string | undefined>

const LABELS: Record<string, string> = {
  aadhar: 'Aadhar Card',
  collegeId: 'College ID',
  offerLetter: 'Offer Letter',
  signedOfferLetter: 'Signed Offer Letter',
  noc: 'NOC',
  marksheet10: '10th Marksheet',
  marksheet12: '12th Marksheet',
  resume: 'Resume'
}

const getFileName = (url: string) => {
  try {
    const clean = url.split('?')[0]
    const last = clean.split('/').filter(Boolean).pop() || clean
    return decodeURIComponent(last)
  } catch {
    return url
  }
}

export default function UserDocuments({ email, close }: any) {
  const { theme } = useTheme()

  const [docs, setDocs] = useState<DocMap | null>(null)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; docKey: string; docLabel: string }>({
    isOpen: false,
    docKey: '',
    docLabel: ''
  })
  const [successToast, setSuccessToast] = useState<{ isVisible: boolean; message: string }>({
    isVisible: false,
    message: ''
  })

  useEffect(() => {
    setShow(true)
    if (email) void getDocs()
  }, [email])

  const getDocs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/get-user-by-email?email=${email}`)
      const data = await res.json()
      setDocs((data?.data?.documents || null) as DocMap | null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
    
    try {
      const res = await fetch('/api/admin/users/delete-document', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, documentKey: confirmModal.docKey })
      })
      const data = await res.json()
      
      if (data.success) {
        getDocs()
        setSuccessToast({ isVisible: true, message: 'Document deleted successfully' })
        setTimeout(() => setSuccessToast(prev => ({ ...prev, isVisible: false })), 3000)
      } else {
        alert('Failed to delete document')
      }
    } catch (error) {
      alert('Error deleting document')
    }
  }

  const entries = Object.keys(LABELS).map((key) => ({
    key,
    label: LABELS[key],
    value: docs ? (docs as any)[key] : undefined
  }))

  const hasAny = entries.some((e) => !!e.value)

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Document"
        message={`Are you sure you want to delete ${confirmModal.docLabel}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        theme={theme}
      />

      <SuccessToast
        message={successToast.message}
        isVisible={successToast.isVisible}
        theme={theme}
      />

    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.35)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: 'min(720px, 96vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '20px',
          borderRadius: '16px',
          backdropFilter: 'blur(16px)',
          boxShadow: theme === 'dark'
            ? '0 20px 55px rgba(0,0,0,0.55), 0 10px 30px rgba(59,130,246,0.18)'
            : '0 18px 45px rgba(15,23,42,0.18), 0 10px 25px rgba(59,130,246,0.16)',
          border:
            theme === 'dark'
              ? '1px solid rgba(148,163,184,0.22)'
              : '1px solid rgba(15,23,42,0.12)',
          background: theme === 'dark' ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.95)',
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          opacity: show ? 1 : 0,
          transition: 'all 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: theme === 'dark' ? '#fff' : '#111'
              }}
            >
              Documents
            </h2>
            <p
              style={{
                marginTop: 2,
                fontSize: 12,
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={email}
            >
              {email}
            </p>
          </div>

          <button
            onClick={close}
            style={{
              color: theme === 'dark' ? '#d1d5db' : '#4b5563',
              fontSize: 18,
              lineHeight: 1
            }}
            aria-label="Close"
          >
            ✖
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading size="small" />
            </div>
          ) : !docs || !hasAny ? (
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                color: theme === 'dark' ? '#d1d5db' : '#374151',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              No documents uploaded
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              {entries
                .filter((e) => !!e.value)
                .map((e) => (
                  <div
                    key={e.key}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      minWidth: 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 11,
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: 6
                          }}
                        >
                          {e.label}
                        </p>

                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: theme === 'dark' ? '#fff' : '#111',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {getFileName(String(e.value))}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <a
                          href={String(e.value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Open
                        </a>

                        <a
                          href={String(e.value)}
                          download
                          className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          Download
                        </a>

                        <button
                          onClick={() => setConfirmModal({ isOpen: true, docKey: e.key, docLabel: e.label })}
                          className="px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
