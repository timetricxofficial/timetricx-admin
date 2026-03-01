'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function AdminLogin() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= THREE JS BACKGROUND ================= */

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    mountRef.current.appendChild(renderer.domElement)

    const geometry = new THREE.BufferGeometry()
    const vertices = []

    for (let i = 0; i < 2000; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(1000),
        THREE.MathUtils.randFloatSpread(1000),
        THREE.MathUtils.randFloatSpread(1000)
      )
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    )

    const material = new THREE.PointsMaterial({
      color: 0x2563eb,
      size: 2
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    camera.position.z = 500

    const animate = () => {
      requestAnimationFrame(animate)
      particles.rotation.x += 0.0005
      particles.rotation.y += 0.001
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  /* ================= LOGIN ================= */
// useEffect(() => {
//   const token = Cookies.get('adminToken')
//   const userCookie = Cookies.get('adminUser')

//   if (!token || !userCookie) return

//   try {
//     const user = JSON.parse(userCookie)

//     if (user.role === 'admin' || user.role === 'superadmin') {
//       router.push('/admin')
//     }

//   } catch (err) {
//     console.error('Invalid admin cookie')
//     Cookies.remove('adminToken')
//     Cookies.remove('adminUser')
//   }

// }, [router])
const handleLogin = async () => {
  if (!password) {
    alert('Enter password')
    return
  }

  try {
    setLoading(true)

    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    const data = await res.json()

    if (data.success) {

      // 🔥 Store token
      Cookies.set('adminToken', data.token, {
        expires: 365,        // 1 year
        secure: true,
        sameSite: 'Strict'
      })

      // 🔥 Store full admin user object
      Cookies.set('adminUser', JSON.stringify(data.user), {
        expires: 365,
        secure: true,
        sameSite: 'Strict'
      })

      router.push('/admin')

    } else {
      alert(data.message || 'Login failed')
    }

  } catch (err) {
    console.error(err)
    alert('Server error')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">

      {/* THREE BG */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-[380px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-blue-600 shadow-2xl"
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-blue-600 text-center mb-6"
        >
          Admin Login
        </motion.h2>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/40 text-white border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Login'}
          </motion.button>

        </div>
      </motion.div>
    </div>
  )
}
