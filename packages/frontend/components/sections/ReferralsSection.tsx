'use client'

import { useState, useEffect } from 'react'

interface Referral {
  id: number
  name: string
  email: string
  status: 'pending' | 'active' | 'inactive'
  join_date: string
  total_earnings: number
  commission_rate: number
  level: number
  referrals_count: number
  last_activity: string
}

export default function ReferralsSection() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('join_date')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [inviteData, setInviteData] = useState({
    email: '',
    message: 'Join my affiliate network and start earning commissions!'
  })

  const referralsPerPage = 10

  useEffect(() => {
    loadReferrals()
  }, [])

  const loadReferrals = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockReferrals: Referral[] = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@email.com',
          status: 'active',
          join_date: '2024-01-15',
          total_earnings: 1250.50,
          commission_rate: 12,
          level: 2,
          referrals_count: 8,
          last_activity: '2024-12-10'
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          status: 'active',
          join_date: '2024-02-20',
          total_earnings: 890.75,
          commission_rate: 10,
          level: 1,
          referrals_count: 3,
          last_activity: '2024-12-08'
        },
        {
          id: 3,
          name: 'Mike Davis',
          email: 'mike.davis@email.com',
          status: 'pending',
          join_date: '2024-12-01',
          total_earnings: 0,
          commission_rate: 8,
          level: 1,
          referrals_count: 0,
          last_activity: '2024-12-01'
        },
        {
          id: 4,
          name: 'Emma Wilson',
          email: 'emma.wilson@email.com',
          status: 'active',
          join_date: '2024-03-10',
          total_earnings: 2100.25,
          commission_rate: 15,
          level: 3,
          referrals_count: 15,
          last_activity: '2024-12-09'
        },
        {
          id: 5,
          name: 'David Brown',
          email: 'david.brown@email.com',
          status: 'inactive',
          join_date: '2024-01-05',
          total_earnings: 450.00,
          commission_rate: 10,
          level: 1,
          referrals_count: 2,
          last_activity: '2024-11-15'
        },
        {
          id: 6,
          name: 'Lisa Garcia',
          email: 'lisa.garcia@email.com',
          status: 'active',
          join_date: '2024-04-18',
          total_earnings: 675.30,
          commission_rate: 12,
          level: 2,
          referrals_count: 6,
          last_activity: '2024-12-07'
        }
      ]
      setReferrals(mockReferrals)
    } catch (error) {
      console.error('Error loading referrals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReferrals = referrals
    .filter(referral => {
      const matchesSearch = referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           referral.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || referral.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'earnings':
          return b.total_earnings - a.total_earnings
        case 'level':
          return b.level - a.level
        case 'referrals':
          return b.referrals_count - a.referrals_count
        default:
          return new Date(b.join_date).getTime() - new Date(a.join_date).getTime()
      }
    })

  const totalPages = Math.ceil(filteredReferrals.length / referralsPerPage)
  const paginatedReferrals = filteredReferrals.slice(
    (currentPage - 1) * referralsPerPage,
    currentPage * referralsPerPage
  )

  const sendInvite = async () => {
    if (!inviteData.email) {
      alert('Please enter an email address')
      return
    }

    try {
      // Mock API call - replace with actual API
      alert(`Invitation sent to ${inviteData.email}!`)
      setInviteData({ email: '', message: 'Join my affiliate network and start earning commissions!' })
      setShowInviteModal(false)
    } catch (error) {
      console.error('Error sending invite:', error)
      alert('Failed to send invitation')
    }
  }

  const updateReferralStatus = async (id: number, newStatus: 'active' | 'inactive') => {
    try {
      // Mock API call - replace with actual API
      setReferrals(prev => prev.map(ref =>
        ref.id === id ? { ...ref, status: newStatus } : ref
      ))
      alert(`Referral status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const generateReferralLink = async () => {
    const referralLink = `https://affiliateboss.com/join?ref=${Date.now()}`
    try {
      await navigator.clipboard.writeText(referralLink)
      alert('Referral link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const stats = {
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(r => r.status === 'active').length,
    totalEarnings: referrals.reduce((sum, r) => sum + r.total_earnings, 0),
    avgCommission: referrals.length > 0 ? referrals.reduce((sum, r) => sum + r.commission_rate, 0) / referrals.length : 0,
    topReferrer: referrals.length > 0 ? referrals.reduce((prev, current) => (prev.referrals_count > current.referrals_count) ? prev : current).name : 'N/A'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelBadge = (level: number) => {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
    const colors = ['bg-orange-100 text-orange-800', 'bg-gray-100 text-gray-800', 'bg-yellow-100 text-yellow-800', 'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800']
    return { name: levels[level - 1] || 'Bronze', color: colors[level - 1] || colors[0] }
  }

  return (
    <div className="section">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Referral Network</h1>
          <p className="text-gray-600">Manage your affiliate referrals and track their performance</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={generateReferralLink}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <i className="fas fa-link mr-2"></i>Get Referral Link
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>Invite Affiliate
          </button>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalReferrals}</div>
          <div className="text-sm text-gray-600">Total Referrals</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeReferrals}</div>
          <div className="text-sm text-gray-600">Active Affiliates</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">${stats.totalEarnings.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Earnings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.avgCommission.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Commission</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.topReferrer}</div>
          <div className="text-sm text-gray-600">Top Referrer</div>
        </div>
      </div>

      {/* Referral Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
            title="Filter by status"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
            title="Sort referrals"
          >
            <option value="join_date">Sort by Join Date</option>
            <option value="name">Sort by Name</option>
            <option value="earnings">Sort by Earnings</option>
            <option value="level">Sort by Level</option>
            <option value="referrals">Sort by Referrals</option>
          </select>
          <button
            onClick={() => {/* Export functionality */}}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <i className="fas fa-download mr-2"></i>Export
          </button>
        </div>
      </div>

      {/* Referral Table */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referrals...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReferrals.map((referral) => {
                  const levelInfo = getLevelBadge(referral.level)
                  return (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                          <div className="text-sm text-gray-500">{referral.email}</div>
                          <div className="text-xs text-gray-400">Joined {new Date(referral.join_date).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${levelInfo.color}`}>
                          {levelInfo.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${referral.total_earnings.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referral.referrals_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {referral.commission_rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(referral.last_activity).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {referral.status === 'pending' && (
                            <button
                              onClick={() => updateReferralStatus(referral.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                              title="Activate referral"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          {referral.status === 'active' && (
                            <button
                              onClick={() => updateReferralStatus(referral.id, 'inactive')}
                              className="text-red-600 hover:text-red-900"
                              title="Deactivate referral"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          )}
                          <button
                            onClick={() => {/* View details */}}
                            className="text-blue-600 hover:text-blue-900"
                            title="View details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Previous page"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Next page"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Invite New Affiliate</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="affiliate@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invitation Message</label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Personal message to the affiliate..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendInvite}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <i className="fas fa-paper-plane mr-1"></i>Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
