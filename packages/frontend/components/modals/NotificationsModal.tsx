'use client'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close notifications"
            title="Close"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mr-3 mt-1"></i>
              <div>
                <h4 className="font-semibold text-blue-800">New Commission Earned</h4>
                <p className="text-blue-700 text-sm">You earned $24.50 from iPhone 15 sale</p>
                <p className="text-blue-600 text-xs mt-1">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={onClose} 
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  )
}
