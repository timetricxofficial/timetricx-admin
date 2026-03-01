'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Folder } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

export default function ProjectsCard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [projectCount, setProjectCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/stats')
        const data = await res.json()
        if (data.success) {
          const finalCount = data.data.projects
          setProjectCount(finalCount)
          animate(count, finalCount, { duration: 1.5, ease: 'easeOut' })
        }
      } catch (error) {
        console.error('Failed to fetch project count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [count])

  return (
    <>
      {/* Hidden SVG ClipPath */}
      <svg width="0" height="0">
        <defs>
          <clipPath id="cardClip" clipPathUnits="objectBoundingBox">
            <path
              d="
                M0,0
                H1
                V0.30
                L0.97,0.30
                Q0.94,0.30 0.94,0.35
                L0.94,0.70
                Q0.94,0.75 0.97,0.75
                L1,0.75
                V1
                H0
                Z
              "
            />
          </clipPath>
        </defs>
      </svg>

      <div className="relative w-[260px] h-[200px] overflow-visible">

        {/* Base Card */}
        <div className={`${isDark ? 'bg-orange-900/30' : 'bg-orange-100'} rounded-2xl p-5 shadow-sm h-full`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Projects</p>

          <div className="mt-3 flex items-end gap-2">
            <h2 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : <motion.span>{rounded}</motion.span>}
            </h2>
          </div>
        </div>

        {/* Overlay Card */}
        <div
          style={{ clipPath: "url(#cardClip)" }}
          className={`
            absolute top-0 left-0 w-full h-full
            ${isDark ? 'bg-gray-800' : 'bg-white'}
            rounded-2xl p-5 shadow-md
          `}
        >
          {/* Top Row */}
          <div className="flex justify-between items-start">
            <div className={`w-10 h-10 ${isDark ? 'bg-orange-900/50' : 'bg-orange-100'} rounded-xl flex items-center justify-center ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              <Folder size={20} />
            </div>
          </div>

          {/* Content */}
          <div className="mt-8">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Projects</p>

            <div className="mt-2 flex items-end gap-2">
              <h2 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {loading ? '...' : <motion.span>{rounded}</motion.span>}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
