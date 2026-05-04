'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { Check, X, AlertCircle, Info, Loader2 } from 'lucide-react'
import { useTheme } from './ThemeContext'

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning' | 'loading'
}

interface ToastContextType {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
  loading: (message: string) => string
  dismiss: (id?: string) => void
  toasts: ToastMessage[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Date.now().toString()
    const newToast: ToastMessage = { id, message, type }

    setToasts(prev => [...prev, newToast])

    // Auto-dismiss after 4 seconds for non-loading toasts
    if (type !== 'loading') {
      setTimeout(() => {
        dismiss(id)
      }, 4000)
    }

    return id
  }

  const success = (message: string) => addToast(message, 'success')
  const error = (message: string) => addToast(message, 'error')
  const info = (message: string) => addToast(message, 'info')
  const warning = (message: string) => addToast(message, 'warning')
  const loading = (message: string) => addToast(message, 'loading')

  const dismiss = (id?: string) => {
    if (id) {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    } else {
      setToasts([])
    }
  }

  return (
    <ToastContext.Provider value={{ success, error, info, warning, loading, dismiss, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─────────────────────────── SINGLE TOAST ───────────────────────────

interface SingleToastProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const SingleToast = ({ toast, onDismiss }: SingleToastProps) => {
  const [isVisible, setIsVisible] = useState(false)
  let currentTheme = 'dark'
  try {
    const themeCtx = useTheme()
    currentTheme = themeCtx.theme
  } catch {
    // fallback if ThemeContext not available
  }

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check size={20} />
      case 'error':
        return <X size={20} />
      case 'warning':
        return <AlertCircle size={20} />
      case 'loading':
        return <Loader2 size={20} className="animate-spin" />
      case 'info':
      default:
        return <Info size={20} />
    }
  }

  const getTypeClass = () => {
    switch (toast.type) {
      case 'success': return 'toast-success'
      case 'error': return 'toast-error'
      case 'warning': return 'toast-warning'
      case 'info': return 'toast-info'
      case 'loading': return 'toast-info'
      default: return 'toast-info'
    }
  }

  const isDark = currentTheme === 'dark'

  return (
    <div
      className={`toast ${getTypeClass()} ${isVisible ? 'toast-visible' : 'toast-hidden'}`}
      onClick={handleClose}
      style={{
        background: isDark
          ? 'rgba(30, 30, 30, 0.85)'
          : 'rgba(255, 255, 255, 0.9)',
        color: isDark ? '#ffffff' : '#111111',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255,255,255,0.05)'
          : '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255,255,255,0.8)',
      }}
    >
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <p className="toast-message" style={{
          color: isDark ? '#ffffff' : '#111111',
          textShadow: isDark ? '0 1px 1px rgba(0,0,0,0.3)' : 'none',
        }}>{toast.message}</p>
      </div>
    </div>
  )
}

// ─────────────────────────── TOAST CONTAINER ───────────────────────────

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  if (toasts.length === 0) return null

  return (
    <>
      <div className="toast-container">
        {toasts.map((toast) => (
          <SingleToast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>

      <style jsx global>{`
        .toast {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          cursor: pointer;
          min-width: 280px;
          max-width: 520px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease-in-out;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }

        .toast-visible {
          transform: translateX(0);
          opacity: 1;
        }

        .toast-hidden {
          transform: translateX(100%);
          opacity: 0;
        }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: rgba(128, 128, 128, 0.15);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
        }

        .toast-message {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
          line-height: 1.4;
        }

        /* Toast Types */
        .toast-success .toast-icon {
          color: #22c55e;
        }

        .toast-error .toast-icon {
          color: #ef4444;
        }

        .toast-warning .toast-icon {
          color: #fbbf24;
        }

        .toast-info .toast-icon {
          color: #3b82f6;
        }

        /* Toast container */
        .toast-container {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          pointer-events: none;
        }

        .toast-container > * {
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .toast-container {
            top: 1rem;
            right: 1rem;
            left: 1rem;
          }

          .toast {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  )
}
