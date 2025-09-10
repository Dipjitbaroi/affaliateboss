'use client'

import { useState } from 'react'

interface User {
  id: number
  name: string
  email: string
  tier: string
  total_earnings: number
  status: string
}

interface NavigationProps {
  user: User
  currentSection: string
  onSectionChange: (section: string) => void
  onShowNotifications: () => void
}

export default function Navigation({ user, currentSection, onSectionChange, onShowNotifications }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'links', label: 'Links', icon: 'fas fa-link' },
    { id: 'products', label: 'Products', icon: 'fas fa-shopping-bag' },
    { id: 'referrals', label: 'Referrals', icon: 'fas fa-users' },
    { id: 'commissions', label: 'Earnings', icon: 'fas fa-dollar-sign' },
    { id: 'tools', label: 'Tools', icon: 'fas fa-toolbox' },
    { id: 'profile', label: 'Profile', icon: 'fas fa-user-cog' },
  ]

  return (
    <nav className="gradient-bg shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <i className="fas fa-chart-line text-2xl"></i>
              <span className="ml-2 text-xl font-bold">Affiliate Boss</span>
            </div>
            <div className="hidden md:flex space-x-4 ml-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className={`nav-link text-white hover:text-blue-200 transition-colors px-2 py-1 rounded ${
                    currentSection === item.id ? 'bg-blue-800' : ''
                  }`}
                >
                  <i className={`${item.icon} mr-1`}></i> {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm hidden md:block">
              <i className="fas fa-user-circle mr-1"></i>
              <span id="user-name">{user.name}</span>
              <span className="ml-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                {user.tier}
              </span>
            </div>
            <button
              type="button"
              onClick={onShowNotifications}
              className="text-white hover:text-blue-200 relative"
              aria-label="Show notifications"
              title="Notifications"
            >
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-blue-200"
              aria-label="Toggle mobile menu"
              title="Menu"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-600">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSectionChange(item.id)
                  setMobileMenuOpen(false)
                }}
                className="block text-white hover:text-blue-200 py-2 px-2 rounded w-full text-left"
              >
                <i className={`${item.icon} mr-2`}></i> {item.label}
              </button>
            ))}
            <div className="border-t border-blue-600 pt-2 mt-2">
              <div className="text-white text-sm px-2 py-1">
                <i className="fas fa-user-circle mr-1"></i>
                <span>{user.name}</span>
                <span className="ml-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                  {user.tier}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
