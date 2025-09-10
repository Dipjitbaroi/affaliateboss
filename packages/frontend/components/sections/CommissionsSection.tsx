'use client'

import { useState, useEffect } from 'react'

interface Commission {
  id: number
  date: string
  product: string
  customer: string
  sale_amount: number
  rate: string
  commission: number
  status: 'pending' | 'approved' | 'paid'
}

export default function CommissionsSection() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [stats] = useState({
    thisMonth: 2847.50,
    pending: 523.45,
    paid: 9476.55,
    currentTier: 'GOLD',
    baseRate: 15
  })

  useEffect(() => {
    loadCommissions()
  }, [])

  const loadCommissions = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockCommissions: Commission[] = [
        {
          id: 1,
          date: '2024-01-25',
          product: 'Premium Headphones',
          customer: 'John D.',
          sale_amount: 299.99,
          rate: '15%',
          commission: 45.00,
          status: 'approved'
        },
        {
          id: 2,
          date: '2024-01-24',
          product: 'Smart Watch',
          customer: 'Sarah M.',
          sale_amount: 199.99,
          rate: '12%',
          commission: 24.00,
          status: 'paid'
        },
        {
          id: 3,
          date: '2024-01-23',
          product: 'Wireless Earbuds',
          customer: 'Mike R.',
          sale_amount: 149.99,
          rate: '12%',
          commission: 18.00,
          status: 'pending'
        },
        {
          id: 4,
          date: '2024-01-22',
          product: 'Phone Case',
          customer: 'Emma L.',
          sale_amount: 29.99,
          rate: '8%',
          commission: 2.40,
          status: 'paid'
        }
      ]
      setCommissions(mockCommissions)
    } catch (error) {
      console.error('Error loading commissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCommissions = commissions.filter(commission => {
    return !statusFilter || commission.status === statusFilter
  })

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportCommissions = () => {
    const csvContent = "Date,Product,Customer,Sale Amount,Commission,Status\n" +
      filteredCommissions.map(commission =>
        `${commission.date},${commission.product},${commission.customer},$${commission.sale_amount},$${commission.commission},${commission.status}`
      ).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'commissions-export.csv'
    a.click()
    window.URL.revokeObjectURL(url)

    alert('Commissions exported successfully!')
  }

  const tierStructure = [
    { name: 'BRONZE', rate: '5%', earnings: '$0 - $999', color: 'bg-orange-500' },
    { name: 'SILVER', rate: '8%', earnings: '$1K - $4.9K', color: 'bg-gray-400' },
    { name: 'GOLD', rate: '12%', earnings: '$5K - $14.9K', color: 'bg-yellow-500' },
    { name: 'PLATINUM', rate: '15%', earnings: '$15K - $49.9K', color: 'bg-gray-300' },
    { name: 'DIAMOND', rate: '22%', earnings: '$50K+', color: 'bg-blue-400' }
  ]

  return (
    <div className="section">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Commission Tracking</h1>
        <p className="text-gray-600">Track your earnings and commission history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-semibold mb-2">This Month</h4>
          <p className="text-3xl font-bold">${stats.thisMonth.toFixed(2)}</p>
          <p className="text-green-100">+23% vs last months</p>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-semibold mb-2">Pending</h4>
          <p className="text-3xl font-bold">${stats.pending.toFixed(2)}</p>
          <p className="text-blue-100">12 transactions</p>
        </div>
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-semibold mb-2">Paid Out</h4>
          <p className="text-3xl font-bold">${stats.paid.toFixed(2)}</p>
          <p className="text-purple-100">Last payout: 3 days ago</p>
        </div>
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-6 rounded-lg text-white">
          <h4 className="text-lg font-semibold mb-2">Current Tier</h4>
          <p className="text-3xl font-bold">{stats.currentTier}</p>
          <p className="text-orange-100">{stats.baseRate}% base rate</p>
        </div>
      </div>

      {/* Tier Information */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Tier Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
          {tierStructure.map((tier) => (
            <div key={tier.name} className={`p-4 border-2 rounded-lg ${tier.name === stats.currentTier ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
              <div className={`w-12 h-12 ${tier.color} text-white rounded-full flex items-center justify-center mx-auto mb-3`}>
                <span className="font-bold text-sm">{tier.name[0]}</span>
              </div>
              <h4 className={`font-semibold ${tier.name === stats.currentTier ? 'text-yellow-800' : 'text-gray-600'}`}>{tier.name}</h4>
              <p className={`text-xl font-bold mt-2 ${tier.name === stats.currentTier ? 'text-yellow-600' : 'text-gray-400'}`}>{tier.rate}</p>
              <p className={`text-xs mt-1 ${tier.name === stats.currentTier ? 'text-yellow-700' : 'text-gray-500'}`}>{tier.earnings}</p>
              {tier.name === stats.currentTier && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium mt-2 inline-block">Current</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">Progress to next tier:</div>
          <div className="bg-gray-200 rounded-full h-3 mt-2">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full w-3/4"></div>
          </div>
          <div className="text-sm text-gray-600 mt-1">$2,152.50 more to reach PLATINUM</div>
        </div>
      </div>

      {/* Commission History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Commission History</h3>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
            <button
              onClick={exportCommissions}
              className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
            >
              <i className="fas fa-download mr-1"></i>Export
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading commissions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{commission.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{commission.product}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{commission.customer}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">${commission.sale_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{commission.rate}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">${commission.commission.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(commission.status)}`}>
                        {commission.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCommissions.length}</span> of <span className="font-medium">{filteredCommissions.length}</span> results
          </div>
          <nav className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50" disabled aria-label="Previous page">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded">1</span>
            <button className="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50" disabled aria-label="Next page">
              <i className="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
