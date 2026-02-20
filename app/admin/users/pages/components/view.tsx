'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../../contexts/ThemeContext'

const getColor = (count:number) => {
  if(count === 0) return "#e5e7eb"
  if(count < 3) return "#9be9a8"
  if(count < 6) return "#40c463"
  if(count < 9) return "#30a14e"
  return "#216e39"
}

export default function ViewUser({ email, close }: any) {

  const { theme } = useTheme()

  const [user, setUser] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [gitData,setGitData] = useState<any>(null)

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
            {Row('Linkedin', user.socialLinks?.linkedin || '-', theme)}
            {Row('Twitter', user.socialLinks?.twitter || '-', theme)}
            {Row('Instagram', user.socialLinks?.instagram || '-', theme)}
            {Row('Facebook', user.socialLinks?.facebook || '-', theme)}
          </Box>

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
  const isLink = typeof val === 'string' && (val.startsWith('http') || val.startsWith('https'))
  
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
          href={val} 
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
          {val}
        </a>
      ) : (
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: theme === 'dark' ? '#fff' : '#111',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: val.length > 30 ? 'nowrap' : 'normal'
        }}>
          {val}
        </p>
      )}
    </div>
  )
}
