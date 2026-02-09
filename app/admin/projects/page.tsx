'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Edit, Ban, Trash2 } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import AddProject from './components/addprojects'
import EditProjects from './components/editprojects'

interface Project {
  _id: string
  name: string
  status: 'active' | 'completed' | 'pending'
  progress: number
}

export default function AdminProjectsPage() {
  const { theme } = useTheme()

  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  /* ---------------- FETCH PROJECTS ---------------- */
  useEffect(() => {
    getProjects()
  }, [])

  const getProjects = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/admin/projects/list')
      const data = await res.json()

      if (data.success) {
        setProjects(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch projects', err)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- FILTER ---------------- */
  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">

      {/* SEARCH + ADD */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
              }`}
          />
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Plus size={18} /> Add Project
        </button>
      </div>

      {/* TABLE */}
      <div
        className={`rounded-xl shadow overflow-x-auto
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <table className="w-full">
          <thead className={theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}>
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Progress</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.map(project => (
              <tr
                key={project._id}
                className={`border-b transition-colors
                  ${theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {/* NAME */}
                <td className="p-3 font-medium">
                  {project.name}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs capitalize
                      ${project.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {project.status}
                  </span>
                </td>

                {/* PROGRESS */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-2 bg-gray-200 rounded">
                      <div
                        className="h-2 bg-blue-600 rounded"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm">
                      {project.progress}%
                    </span>
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="p-3 flex justify-center gap-3">
                  {/* Disable */}
                  <button
                    title="Disable"
                    className="text-red-500 hover:scale-110"
                  >
                    <Ban size={18} />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => setEditProject(project)}
                    className="text-blue-600 hover:scale-110"
                  >
                    <Edit size={18} />
                  </button>

                  {/* Delete */}
                  <button
                    title="Delete"
                    className="text-gray-700 hover:text-red-600 hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {/* LOADING */}
            {loading && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Loading projects...
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {openAdd && (
        <AddProject
          onClose={() => {
            setOpenAdd(false)
            getProjects() // refresh after add
          }}
        />
      )}

      {editProject && (
        <EditProjects
          project={editProject}
          onClose={() => {
            setEditProject(null)
            getProjects() // refresh after edit
          }}
        />
      )}
    </div>
  )
}
