'use client'

export default function EditProjects({
  project,
  onClose
}: {
  project: any
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded space-y-4">
        <h3 className="text-lg font-semibold">Edit Project</h3>

        <input
          defaultValue={project.name}
          className="w-full p-2 border rounded"
        />

        <select
          defaultValue={project.status}
          className="w-full p-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        <button className="w-full py-2 bg-blue-600 text-white rounded">
          Update Project
        </button>

        <button
          onClick={onClose}
          className="w-full py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
