'use client'

import { useState, useEffect } from 'react'

interface UserProfile {
  id: number
  name: string
  email: string
  avatar: string
  bio: string
  website: string
  location: string
  join_date: string
  total_earnings: number
  total_clicks: number
  total_conversions: number
  commission_rate: number
  payment_method: string
  paypal_email: string
  bank_account: string
  tax_id: string
  notifications: {
    email_updates: boolean
    commission_alerts: boolean
    payment_notifications: boolean
    marketing_emails: boolean
  }
}

export default function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    website: '',
    location: '',
    paypal_email: '',
    bank_account: '',
    tax_id: '',
    notifications: {
      email_updates: true,
      commission_alerts: true,
      payment_notifications: true,
      marketing_emails: false
    }
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      // Mock profile data - replace with actual API call
      const mockProfile: UserProfile = {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        avatar: 'https://via.placeholder.com/150x150?text=JS',
        bio: 'Passionate affiliate marketer helping others succeed in the digital world. Specializing in tech and lifestyle products.',
        website: 'https://johnsmithaffiliate.com',
        location: 'New York, USA',
        join_date: '2024-01-15',
        total_earnings: 15420.50,
        total_clicks: 12500,
        total_conversions: 890,
        commission_rate: 12,
        payment_method: 'paypal',
        paypal_email: 'john.smith@email.com',
        bank_account: '****-****-****-1234',
        tax_id: '***-**-1234',
        notifications: {
          email_updates: true,
          commission_alerts: true,
          payment_notifications: true,
          marketing_emails: false
        }
      }
      setProfile(mockProfile)
      setEditData({
        name: mockProfile.name,
        bio: mockProfile.bio,
        website: mockProfile.website,
        location: mockProfile.location,
        paypal_email: mockProfile.paypal_email,
        bank_account: mockProfile.bank_account,
        tax_id: mockProfile.tax_id,
        notifications: mockProfile.notifications
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!editData.name) {
      alert('Name is required')
      return
    }

    try {
      // Mock API call - replace with actual API
      if (profile) {
        const updatedProfile: UserProfile = {
          ...profile,
          name: editData.name,
          bio: editData.bio,
          website: editData.website,
          location: editData.location,
          paypal_email: editData.paypal_email,
          bank_account: editData.bank_account,
          tax_id: editData.tax_id,
          notifications: editData.notifications
        }
        setProfile(updatedProfile)
      }
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in all password fields')
      return
    }

    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long')
      return
    }

    try {
      // Mock API call - replace with actual API
      alert('Password updated successfully!')
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Failed to update password')
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      // Mock file upload - replace with actual upload
      const mockUrl = `https://via.placeholder.com/150x150?text=${file.name.charAt(0).toUpperCase()}`
      if (profile) {
        setProfile({ ...profile, avatar: mockUrl })
      }
      alert('Avatar updated successfully!')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar')
    }
  }

  const exportData = async () => {
    try {
      // Mock data export - replace with actual export
      const data = {
        profile: profile,
        exportDate: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'affiliate-profile-data.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      alert('Data exported successfully!')
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      // Mock account deletion - replace with actual API
      alert('Account deletion request submitted. You will receive a confirmation email.')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account')
    }
  }

  if (isLoading) {
    return (
      <div className="section">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="section">
        <div className="text-center py-8">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fas fa-download mr-2"></i>Export Data
          </button>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-edit mr-2"></i>Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">${profile.total_earnings.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Earnings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{profile.total_clicks.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Clicks</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">{profile.total_conversions}</div>
          <div className="text-sm text-gray-600">Conversions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">{profile.commission_rate}%</div>
          <div className="text-sm text-gray-600">Commission Rate</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'profile', label: 'Profile Info', icon: 'fas fa-user' },
              { id: 'payment', label: 'Payment Settings', icon: 'fas fa-credit-card' },
              { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
              { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {/* Handle avatar upload */}}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                      title="Change avatar"
                    >
                      <i className="fas fa-camera text-xs"></i>
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={editData.bio}
                          onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us about yourself and your affiliate marketing experience..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                          <input
                            type="url"
                            value={editData.website}
                            onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={editData.location}
                            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                      <p className="text-gray-600 mt-1">{profile.email}</p>
                      <p className="text-gray-600 mt-2">{profile.bio}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        {profile.website && (
                          <span><i className="fas fa-globe mr-1"></i>{profile.website}</span>
                        )}
                        {profile.location && (
                          <span><i className="fas fa-map-marker-alt mr-1"></i>{profile.location}</span>
                        )}
                        <span><i className="fas fa-calendar mr-1"></i>Joined {new Date(profile.join_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={profile.payment_method}
                      onChange={(e) => {/* Handle payment method change */}}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select payment method"
                    >
                      <option value="paypal">PayPal</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="check">Check</option>
                    </select>
                  </div>

                  {profile.payment_method === 'paypal' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                      <input
                        type="email"
                        value={isEditing ? editData.paypal_email : profile.paypal_email}
                        onChange={(e) => setEditData(prev => ({ ...prev, paypal_email: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="your.email@paypal.com"
                      />
                    </div>
                  )}

                  {profile.payment_method === 'bank' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                      <input
                        type="text"
                        value={isEditing ? editData.bank_account : profile.bank_account}
                        onChange={(e) => setEditData(prev => ({ ...prev, bank_account: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="****-****-****-1234"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                    <input
                      type="text"
                      value={isEditing ? editData.tax_id : profile.tax_id}
                      onChange={(e) => setEditData(prev => ({ ...prev, tax_id: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="***-**-1234"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'email_updates', label: 'Email Updates', description: 'Receive updates about your account and earnings' },
                  { key: 'commission_alerts', label: 'Commission Alerts', description: 'Get notified when you earn commissions' },
                  { key: 'payment_notifications', label: 'Payment Notifications', description: 'Receive payment confirmations and updates' },
                  { key: 'marketing_emails', label: 'Marketing Emails', description: 'Receive promotional offers and tips' }
                ].map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">{notification.label}</h4>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEditing ? editData.notifications[notification.key as keyof typeof editData.notifications] : profile.notifications[notification.key as keyof typeof profile.notifications]}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [notification.key]: e.target.checked
                          }
                        }))}
                        disabled={!isEditing}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${isEditing ? 'peer-checked:bg-blue-600' : 'peer-checked:bg-blue-600 opacity-60'}`}></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter a new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm your new password"
                    />
                  </div>
                  <button
                    onClick={() => {/* Handle password change */}}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Danger Zone</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={deleteAccount}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setIsEditing(false)
              setEditData({
                name: profile.name,
                bio: profile.bio,
                website: profile.website,
                location: profile.location,
                paypal_email: profile.paypal_email,
                bank_account: profile.bank_account,
                tax_id: profile.tax_id,
                notifications: profile.notifications
              })
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={updateProfile}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-save mr-1"></i>Save Changes
          </button>
        </div>
      )}
    </div>
  )
}
