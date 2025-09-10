'use client'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close change password modal"
            title="Close"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Change password modal will be implemented here.</p>
        </div>
      </div>
    </div>
  )
}
