'use client'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateLinkModal({ isOpen, onClose, onSuccess }: CreateLinkModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Affiliate Link</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product URL</label>
            <input type="url" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="https://example.com/product" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Name</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="My Product Link" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24" placeholder="Description..."></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i className="fas fa-link mr-1"></i>Create Link
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
