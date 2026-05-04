'use client'

import { useEffect, useState } from 'react'
import { Eye, Download } from 'lucide-react'
import { useTheme } from '../../../../../contexts/ThemeContext'

const getColor = (count:number) => {
  if(count === 0) return "#e5e7eb"
  if(count < 3) return "#9be9a8"
  if(count < 6) return "#40c463"
  if(count < 9) return "#30a14e"
  return "#216e39"
}

function DocumentRow(label: string, url: any, theme: string, onView: (url: string) => void) {
  const safeUrl = typeof url === 'string' && (url.startsWith('http') || url.startsWith('https')) ? url : ''

  return (
    <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          fontSize: 11,
          color: theme === 'dark' ? '#888' : '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 4
        }}>
          {label}
        </p>

        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: theme === 'dark' ? '#fff' : '#111',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {safeUrl ? 'Uploaded' : '-'}
        </p>
      </div>

      {safeUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => onView(safeUrl)}
            title="View"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
              cursor: 'pointer'
            }}
          >
            <Eye size={16} color={theme === 'dark' ? '#e5e7eb' : '#111'} />
          </button>

          <a
            href={safeUrl}
            download
            title="Download"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            <Download size={16} color={theme === 'dark' ? '#e5e7eb' : '#111'} />
          </a>
        </div>
      ) : null}
    </div>
  )
}

function DocViewer({ theme, title, url, onClose }: any) {
  const clean = typeof url === 'string' ? url.split('?')[0].toLowerCase() : ''
  const isPdf = clean.endsWith('.pdf') || clean.includes('/raw/upload')
  const isImage = clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp') || clean.endsWith('.gif')

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme === 'dark' ? 'rgba(0,0,0,0.65)' : 'rgba(15,23,42,0.4)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 'min(980px, 96vw)',
          height: 'min(80vh, 720px)',
          borderRadius: 18,
          overflow: 'hidden',
          background: theme === 'dark' ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.97)',
          border: theme === 'dark' ? '1px solid rgba(148,163,184,0.22)' : '1px solid rgba(15,23,42,0.12)',
          boxShadow: theme === 'dark'
            ? '0 20px 55px rgba(0,0,0,0.55), 0 10px 30px rgba(59,130,246,0.18)'
            : '0 18px 45px rgba(15,23,42,0.18), 0 10px 25px rgba(59,130,246,0.16)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 800,
              color: theme === 'dark' ? '#fff' : '#111',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {title}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a
              href={url}
              download
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 800,
                background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                color: theme === 'dark' ? '#fff' : '#111',
                textDecoration: 'none'
              }}
            >
              Download
            </a>
            <button
              onClick={onClose}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 800,
                background: 'transparent',
                color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
                cursor: 'pointer'
              }}
            >
              ✖
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, background: theme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.02)' }}>
          {isPdf ? (
            <iframe
              src={`${url}#view=FitH&toolbar=1&navpanes=0`}
              title={title}
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          ) : isImage ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <img
                src={url}
                alt={title}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          ) : (
            <iframe
              src={url}
              title={title}
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ViewUser({ email, close }: any) {

  const { theme } = useTheme()

  const [user, setUser] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [gitData,setGitData] = useState<any>(null)
  const [openDocViewer, setOpenDocViewer] = useState(false)
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [docTitle, setDocTitle] = useState<string>('Document')

  useEffect(() => {
    setShow(true)
    if (email){
      getUser()
      getGitData()
    }
  }, [email])

  // USER DATA
  const getUser = async () => {
    const res = await fetch(
      `/api/admin/users/get-user-by-email?email=${email}`
    )
    const data = await res.json()
    setUser(data.data)
  }

  // GITHUB DATA
  const getGitData = async () => {
    const res = await fetch('/api/attendance/git-track',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ email })
    })
    const data = await res.json()
    if(data.success) setGitData(data.data)
  }

  if (!user) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.35)',
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
          boxShadow: theme === 'dark'
            ? '0 20px 55px rgba(0,0,0,0.55), 0 10px 30px rgba(59,130,246,0.18)'
            : '0 18px 45px rgba(15,23,42,0.18), 0 10px 25px rgba(59,130,246,0.16)',

          border: theme === 'dark'
            ? '1px solid rgba(148,163,184,0.22)'
            : '1px solid rgba(15,23,42,0.12)',

          background: theme === 'dark'
            ? 'rgba(17,24,39,0.92)'
            : 'rgba(255,255,255,0.95)',

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
            View User
          </h2>

          <button
            onClick={close}
            style={{
              color: theme === 'dark' ? '#ccc' : '#555',
              fontSize: 18
            }}
          >✖</button>
        </div>

        {/* IMAGE */}
        <div style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10
        }}>
          <img
            src={user?.profilePicture || '/avatar.png'}
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              objectFit: 'cover',
              border: theme === 'dark'
                ? '2px solid #444'
                : '2px solid #ddd'
            }}
          />
        </div>

        {/* CONTENT */}
        <div style={{ marginTop: 25 }}>

          {/* BASIC INFO */}
          <Box theme={theme} title="Basic Info">
            {Row('Name', user.name, theme)}
            {Row('Email', user.email, theme)}
            {Row('Mobile', user.mobileNumber || '-', theme)}
            {Row('Role', user.role, theme)}
          </Box>

          {/* PROFILE */}
          <Box theme={theme} title="Profile" mt>
            {Row('Website', user.profile?.website || '-', theme)}
            {Row('Location', user.profile?.location || '-', theme)}
            {Row('Gender', user.profile?.gender || '-', theme)}
            {Row('Bio', user.profile?.bio || '-', theme)}
          </Box>

          {/* SOCIAL */}
          <Box theme={theme} title="Social" mt>
            {Row('GitHub (Linked)', user.authProviders?.github?.username || '-', theme)}
            {Row('Linkedin', user.socialLinks?.linkedin || '-', theme)}
            {Row('Twitter', user.socialLinks?.twitter || '-', theme)}
            {Row('Instagram', user.socialLinks?.instagram || '-', theme)}
            {Row('Facebook', user.socialLinks?.facebook || '-', theme)}
          </Box>

          {/* DOCUMENTS */}
          {user.documents && (
            <Box theme={theme} title="Documents" mt>
              {DocumentRow('Aadhar Card', user.documents.aadhar, theme, (url: string) => {
                setDocTitle('Aadhar Card')
                setDocUrl(url)
                setOpenDocViewer(true)
              })}
              {DocumentRow('College ID', user.documents.collegeId, theme, (url: string) => {
                setDocTitle('College ID')
                setDocUrl(url)
                setOpenDocViewer(true)
              })}
              {DocumentRow('Signed Offer Letter', user.documents.signedOfferLetter || user.documents.offerLetter, theme, (url: string) => {
                setDocTitle('Signed Offer Letter')
                setDocUrl(url)
                setOpenDocViewer(true)
              })}
              {DocumentRow('NOC', user.documents.noc, theme, (url: string) => {
                setDocTitle('NOC')
                setDocUrl(url)
                setOpenDocViewer(true)
              })}
              {DocumentRow('10th Marksheet', user.documents.marksheet10, theme, (url: string) => {
                setDocTitle('10th Marksheet')
                setDocUrl(url)
                setOpenDocViewer(true)
              })}
              {DocumentRow('12th Marksheet', user.documents.marksheet12, theme, (url: string) => {
                setDocTitle('12th Marksheet')
                setDocUrl(url)
                setOpenDocViewer(true)
              })}
              {DocumentRow('Resume', user.documents.resume, theme, (url: string) => {
                setDocTitle('Resume')
                setDocUrl(url)
                setOpenDocViewer(true)
              })}
            </Box>
          )}

          {/* GITHUB CONTRIBUTION */}
          {gitData && (
            <Box theme={theme} title="Github Activity" mt>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{
                  fontSize: 13,
                  color: theme === 'dark' ? '#aaa' : '#555',
                  marginBottom: 10
                }}>
                  {gitData.total || 0} contributions in the last year
                </p>

                <div className="flex overflow-x-auto">

                  {gitData.months.map((month:any, mi:number)=>(

                    <div key={mi} className="flex">

                      <div>

                        <p className={`text-xs font-semibold mb-2 text-center ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {month.month}
                        </p>

                        <div className="flex gap-1">

                          {month.weeks.map((week:any, wi:number)=>(

                            <div key={wi} className="flex flex-col gap-1">

                              {week.map((day:any, di:number)=>(

                                <div
                                  key={di}
                                  title={`${day.date} : ${day.count}`}
                                  className="w-4 h-4 rounded-sm"
                                  style={{
                                    background:getColor(day.count)
                                  }}
                                ></div>

                              ))}

                            </div>

                          ))}

                        </div>
                      </div>

                      <div className="mx-3 border-r"></div>

                    </div>

                  ))}

                </div>

                {/* SCALE */}
                <div style={{
                  display:'flex',
                  justifyContent:'flex-end',
                  gap:6,
                  marginTop:12,
                  alignItems:'center'
                }}>
                  <span style={{fontSize:12}}>Less</span>

                  {[0,1,2,3,4].map(l=>(
                    <div
                      key={l}
                      style={{
                        width:12,
                        height:12,
                        borderRadius:3,
                        background:getColor(l*3)
                      }}
                    />
                  ))}

                  <span style={{fontSize:12}}>More</span>
                </div>
              </div>
            </Box>
          )}

        </div>

      </div>

      {openDocViewer && docUrl && (
        <DocViewer
          theme={theme}
          title={docTitle}
          url={docUrl}
          onClose={() => {
            setOpenDocViewer(false)
            setDocUrl(null)
          }}
        />
      )}
    </div>
  )
}

/* HELPERS */

function Box({ children, theme, title, mt }: any) {
  return (
    <div style={{
      padding: 16,
      borderRadius: 14,
      marginTop: mt ? 20 : 0,
      background: theme === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.04)'
    }}>
      {title && (
        <b style={{
          fontSize: 14,
          color: theme === 'dark' ? '#fff' : '#333',
          display: 'block',
          marginBottom: 12,
          borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          paddingBottom: 8
        }}>{title}</b>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
        {children}
      </div>
    </div>
  )
}

function Row(label: string, val: any, theme: string) {
  const safeVal = val == null ? '-' : val
  const display = typeof safeVal === 'string' ? safeVal : String(safeVal)
  const isLink = typeof safeVal === 'string' && (safeVal.startsWith('http') || safeVal.startsWith('https'))
  
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{
        fontSize: 11,
        color: theme === 'dark' ? '#888' : '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 4
      }}>
        {label}
      </p>

      {isLink ? (
        <a 
          href={display} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#3b82f6',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {display}
        </a>
      ) : (
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: theme === 'dark' ? '#fff' : '#111',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: display.length > 30 ? 'nowrap' : 'normal'
        }}>
          {display}
        </p>
      )}
    </div>
  )
}
