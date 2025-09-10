'use client'

import { useState } from 'react'
import Navigation from './Navigation'
import DashboardSection from './sections/DashboardSection'
import LinksSection from './sections/LinksSection'
import ProductsSection from './sections/ProductsSection'
import CommissionsSection from './sections/CommissionsSection'
import ReferralsSection from './sections/ReferralsSection'
import ToolsSection from './sections/ToolsSection'
import ProfileSection from './sections/ProfileSection'
import NotificationsModal from './modals/NotificationsModal'
import CreateLinkModal from './modals/CreateLinkModal'
import AddProductModal from './modals/AddProductModal'
import ChangePasswordModal from './modals/ChangePasswordModal'
import AIModal from './modals/AIModal'
import SMSCampaignModal from './modals/SMSCampaignModal'

export default function Dashboard() {
  const [currentSection, setCurrentSection] = useState('dashboard')
  const [user] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    tier: 'GOLD',
    total_earnings: 15420.50,
    status: 'active'
  })
  const [isLoading] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showSMSCampaignModal, setShowSMSCampaignModal] = useState(false)

  const showSection = (section: string) => {
    setCurrentSection(section)
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Simple notification implementation
    alert(`${type.toUpperCase()}: ${message}`)
  }

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardSection />
      case 'links':
        return <LinksSection />
      case 'products':
        return <ProductsSection />
      case 'commissions':
        return <CommissionsSection />
      case 'referrals':
        return <ReferralsSection />
      case 'tools':
        return <ToolsSection />
      case 'profile':
        return <ProfileSection />
      default:
        return <DashboardSection />
    }
  }

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navigation
        user={user}
        currentSection={currentSection}
        onSectionChange={showSection}
        onShowNotifications={() => setShowNotifications(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderCurrentSection()}
      </div>

      {/* Modals */}
      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <CreateLinkModal
        isOpen={showCreateLinkModal}
        onClose={() => setShowCreateLinkModal(false)}
        onSuccess={() => {
          setShowCreateLinkModal(false)
          showNotification('Link created successfully!', 'success')
        }}
      />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={() => {
          setShowAddProductModal(false)
          showNotification('Product added successfully!', 'success')
        }}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          setShowChangePasswordModal(false)
          showNotification('Password changed successfully!', 'success')
        }}
      />

      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSuccess={() => {
          setShowAIModal(false)
          showNotification('Content generated successfully!', 'success')
        }}
      />

      <SMSCampaignModal
        isOpen={showSMSCampaignModal}
        onClose={() => setShowSMSCampaignModal(false)}
        onSuccess={() => {
          setShowSMSCampaignModal(false)
          showNotification('SMS campaign scheduled!', 'success')
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-lg font-medium text-gray-800">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
