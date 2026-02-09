'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'

export default function EditUser({ email, close }: any) {
  const { theme } = useTheme()
  const { success } = useToast()
  const [show, setShow] = useState(false)

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    mobileNumber: '',
    role: 'user',
    bio: '',
    website: '',
    location: '',
    gender: '',

    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',

    githubId: '',
    githubUsername: '',
    githubEmail: ''
  })

  useEffect(() => {
    setShow(true)
    if (email) getUser()
  }, [email])

  // GET USER
  const getUser = async () => {
    const res = await fetch(`/api/admin/users/get-user-by-email?email=${email}`)
    const data = await res.json()

    setUser(data.data)

    setForm({
      name: data.data?.name || '',
      mobileNumber: data.data?.mobileNumber || '',
      role: data.data?.role || 'user',
      bio: data.data?.profile?.bio || '',
      website: data.data?.profile?.website || '',
      location: data.data?.profile?.location || '',
      gender: data.data?.profile?.gender || '',

      linkedin: data.data?.socialLinks?.linkedin || '',
      twitter: data.data?.socialLinks?.twitter || '',
      instagram: data.data?.socialLinks?.instagram || '',
      facebook: data.data?.socialLinks?.facebook || '',

      githubId: data.data?.authProviders?.github?.id || '',
      githubUsername: data.data?.authProviders?.github?.username || '',
      githubEmail: data.data?.authProviders?.github?.email || ''
    })
  }

  // IMAGE UPLOAD
  const uploadImage = async (file: File) => {
    setLoading(true)
    const fd = new FormData()
    fd.append('image', file)
    fd.append('email', email)

    await fetch('/api/admin/users/upload-profile', {
      method: 'POST',
      body: fd
    })

    getUser()
    setLoading(false)
  }

  // SAVE
  const saveProfile = async () => {
    setLoading(true)

    await fetch('/api/admin/users/update-profile-data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        ...form
      })
    })

    success('Profile updated')
    setLoading(false)
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
          transition: 'all 0.45s ease'
        }}
      >

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: theme === 'dark' ? '#fff' : '#111'
          }}>
            Edit User
          </h2>

          <button
            onClick={close}
            style={{
              color: theme === 'dark' ? '#ccc' : '#555',
              fontSize: '18px'
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

          <label style={{
            cursor: 'pointer',
            fontSize: 13,
            color: '#3b82f6'
          }}>
            Change Photo
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && uploadImage(e.target.files[0])
              }
            />
          </label>
        </div>

        {/* FORM */}
{/* FORM */}
<div style={{ marginTop: 25 }}>

  {/* TOP GRID */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 16,
    alignItems: 'start'
  }}>

    {/* LEFT – PROFILE BOX */}
    <div style={{
      padding: 14,
      borderRadius: 14,
      background: theme === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.04)'
    }}>

      <b style={{
        fontSize: 13,
        color: theme==='dark'?'#aaa':'#444'
      }}>
        Basic Info
      </b>

      <div style={{ marginTop: 10 }}>
        {Input('Name', form.name, (v:any)=>setForm({...form,name:v}), theme)}
      </div>

      <div style={{ marginTop: 10 }}>
        {Input('Mobile', form.mobileNumber, (v:any)=>setForm({...form,mobileNumber:v}), theme)}
      </div>
    </div>

    {/* RIGHT – EXTRA */}
    <div style={{
      padding: 14,
      borderRadius: 14,
      background: theme === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.04)'
    }}>

      {Select('Role',['user','admin','moderator'],form.role,(v:any)=>setForm({...form,role:v}),theme)}

      <div style={{ marginTop: 10 }}>
        {Input('Website', form.website, (v:any)=>setForm({...form,website:v}), theme)}
      </div>

      <div style={{ marginTop: 10 }}>
        {Input('Location', form.location, (v:any)=>setForm({...form,location:v}), theme)}
      </div>
    </div>

  </div>


  {/* MIDDLE GRID (3 col) */}
  <div style={{
    marginTop: 20,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
    gap: 14
  }}>

    {Select('Gender',['male','female','other','prefer_not_to_say'],
      form.gender,(v:any)=>setForm({...form,gender:v}),theme)}

    {Input('Linkedin', form.linkedin,(v:any)=>setForm({...form,linkedin:v}),theme)}
    {Input('Twitter', form.twitter,(v:any)=>setForm({...form,twitter:v}),theme)}
    {Input('Instagram', form.instagram,(v:any)=>setForm({...form,instagram:v}),theme)}
    {Input('Facebook', form.facebook,(v:any)=>setForm({...form,facebook:v}),theme)}

  </div>


  {/* BIO */}
  <div style={{ marginTop: 18 }}>
    {Textarea('Bio',form.bio,(v:any)=>setForm({...form,bio:v}),theme)}
  </div>


  {/* GITHUB */}
  <div style={{
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    background: theme === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.04)'
  }}>

    <b style={{
      fontSize: 13,
      color: theme==='dark'?'#aaa':'#444'
    }}>
      Github
    </b>

    <div style={{
      marginTop: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
      gap: 14
    }}>
      {Input('Github ID', form.githubId,(v:any)=>setForm({...form,githubId:v}),theme)}
      {Input('Github Username', form.githubUsername,(v:any)=>setForm({...form,githubUsername:v}),theme)}
      {Input('Github Email', form.githubEmail,(v:any)=>setForm({...form,githubEmail:v}),theme)}
    </div>

  </div>

</div>

        {/* SAVE */}
        <button
          onClick={saveProfile}
          disabled={loading}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '10px',
            borderRadius: 12,
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 600,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

      </div>
    </div>
  )
}

/* UI helpers */

function Input(label:any,value:any,onChange:any,theme:any){
  return(
    <div>
      <label style={{
        fontSize: 13,
        color: theme==='dark'?'#bbb':'#444'
      }}>{label}</label>

      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        style={{
          width:'100%',
          padding:'8px',
          borderRadius:10,
          border: theme==='dark'
            ? '1px solid #555'
            : '1px solid #ddd',
          background: theme==='dark'?'#1f2937':'#fff',
          color: theme==='dark'?'#fff':'#000'
        }}
      />
    </div>
  )
}

function Select(label:any,opts:any,val:any,onChange:any,theme:any){
  return(
    <div>
      <label style={{
        fontSize: 13,
        color: theme==='dark'?'#bbb':'#444'
      }}>{label}</label>

      <select
        value={val}
        onChange={(e)=>onChange(e.target.value)}
        style={{
          width:'100%',
          padding:'8px',
          borderRadius:10,
          border: theme==='dark'
            ? '1px solid #555'
            : '1px solid #ddd',
          background: theme==='dark'?'#1f2937':'#fff',
          color: theme==='dark'?'#fff':'#000'
        }}
      >
        <option value="">Select</option>
        {opts.map((o:any)=>(
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

function Textarea(label:any,value:any,onChange:any,theme:any){
  return(
    <div>
      <label style={{
        fontSize: 13,
        color: theme==='dark'?'#bbb':'#444'
      }}>{label}</label>

      <textarea
        rows={3}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        style={{
          width:'100%',
          padding:'8px',
          borderRadius:10,
          border: theme==='dark'
            ? '1px solid #555'
            : '1px solid #ddd',
          background: theme==='dark'?'#1f2937':'#fff',
          color: theme==='dark'?'#fff':'#000'
        }}
      />
    </div>
  )
}
