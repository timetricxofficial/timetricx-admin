'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Edit, Ban, Trash2, CheckCircle, Link as LinkIcon } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import { useToast } from '../../../contexts/ToastContext'
import Swal from 'sweetalert2'
import AddProject from './components/addprojects'
import EditProjects from './components/editprojects'
import ProjectLinksModal from './components/ProjectLinksModal'

interface Project {
  _id: string
  name: string
  status: 'active' | 'completed' | 'pending'
  progress: number
  isDisabled: boolean
}

interface CurrentAdmin {
  email: string
  edit: boolean
}

export default function AdminProjectsPage() {
  const { theme } = useTheme()
  const { success, error } = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null)
  
  // Project Links Modal State
  const [openLinksModal, setOpenLinksModal] = useState(false)
  const [selectedProjectName, setSelectedProjectName] = useState('')

  // 🔥 Get current admin from API (fresh data from DB)
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const res = await fetch('/api/admin/get-current')
        const data = await res.json()
        
        if (data.success && data.data) {
          setCurrentAdmin({
            email: data.data.email,
            edit: data.data.edit
          })
        }
      } catch (err) {
        console.error('Failed to fetch current admin', err)
        setCurrentAdmin(null)
      }
    }
    
    fetchCurrentAdmin()
  }, [])

  // Permission check - only check edit flag
  const canEdit = () => currentAdmin?.edit === true
  const canDelete = () => currentAdmin?.edit === true
  const canToggle = () => currentAdmin?.edit === true
  const canCreate = () => currentAdmin?.edit === true

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

  /* ---------------- TOGGLE DISABLE/ENABLE ---------------- */
  const toggleProjectStatus = async (projectId: string, isDisabled: boolean) => {
    const action = isDisabled ? 'Enable' : 'Disable'
    const result = await Swal.fire({
      title: `${action} Project?`,
      text: isDisabled
        ? 'Project will be visible and accessible.'
        : 'Project will be hidden and disabled.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action}`
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/projects/${projectId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (data.success) {
        success(`Project ${action.toLowerCase()}d successfully`)
        getProjects()
      } else {
        error(`Failed to ${action.toLowerCase()} project`)
      }
    } catch {
      error(`Failed to ${action.toLowerCase()} project`)
    }
  }

  /* ---------------- DELETE PROJECT ---------------- */
  const deleteProject = async (projectId: string, projectName: string) => {
    const result = await Swal.fire({
      title: 'Delete Project?',
      html: `Are you sure you want to delete <b>${projectName}</b>?<br>This action cannot be undone!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2563eb',
      confirmButtonText: 'Yes, Delete'
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json()

      if (data.success) {
        success('Project deleted successfully')
        getProjects()
      } else {
        error('Failed to delete project')
      }
    } catch {
      error('Failed to delete project')
    }
  }
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
          disabled={!canCreate()}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            canCreate()
              ? theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          + Add Project
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
              <th className="p-3 text-center">Progress</th>
              <th className="p-3 text-center">Check Links</th>
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
                  <button
                    onClick={() => canToggle() && toggleProjectStatus(project._id, project.isDisabled)}
                    disabled={!canToggle()}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      canToggle() ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'
                    } ${
                      project.isDisabled
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {project.isDisabled ? 'Disabled' : 'Enabled'}
                  </button>
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

                {/* CHECK LINKS BUTTON */}
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedProjectName(project.name)
                      setOpenLinksModal(true)
                    }}
                    className={`flex items-center gap-1 mx-auto px-3 py-1 rounded-lg text-sm transition hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <LinkIcon size={14} /> Check Links
                  </button>
                </td>

                {/* ACTIONS */}
                <td className="p-3 flex justify-center gap-3">
                  {/* Disable/Enable */}
                  <button
                    onClick={() => canToggle() && toggleProjectStatus(project._id, project.isDisabled)}
                    disabled={!canToggle()}
                    title={project.isDisabled ? 'Enable' : 'Disable'}
                    className={`${
                      canToggle() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    } ${
                      project.isDisabled ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {project.isDisabled ? <CheckCircle size={18} /> : <Ban size={18} />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => canEdit() && setEditProject(project)}
                    disabled={!canEdit()}
                    className={`text-blue-600 ${
                      canEdit() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
                  >
                    <Edit size={18} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => canDelete() && deleteProject(project._id, project.name)}
                    disabled={!canDelete()}
                    title="Delete"
                    className={`text-gray-400 hover:text-red-600 ${
                      canDelete() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
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

      {/* PROJECT LINKS MODAL */}
      <ProjectLinksModal
        isOpen={openLinksModal}
        onClose={() => setOpenLinksModal(false)}
        projectName={selectedProjectName}
      />
    </div>
  )
}
