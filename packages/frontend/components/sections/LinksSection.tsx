'use client'

import { useState, useEffect } from 'react'

interface Link {
  id: number
  name: string
  short_url: string
  original_url: string
  clicks: number
  conversions: number
  earnings: number
  created_at: string
  status: 'active' | 'paused' | 'inactive'
}

export default function LinksSection() {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newLink, setNewLink] = useState({
    name: '',
    original_url: '',
    description: ''
  })

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockLinks: Link[] = [
        {
          id: 1,
          name: 'Fashion Collection',
          short_url: 'https://aff.ly/FAS123',
          original_url: 'https://store.com/fashion',
          clicks: 1250,
          conversions: 42,
          earnings: 1680.00,
          created_at: '2024-01-15T10:30:00Z',
          status: 'active'
        },
        {
          id: 2,
          name: 'Tech Gadgets',
          short_url: 'https://aff.ly/TEC456',
          original_url: 'https://store.com/tech',
          clicks: 890,
          conversions: 28,
          earnings: 1120.00,
          created_at: '2024-01-20T14:15:00Z',
          status: 'active'
        },
        {
          id: 3,
          name: 'Home Decor',
          short_url: 'https://aff.ly/HOM789',
          original_url: 'https://store.com/home',
          clicks: 567,
          conversions: 15,
          earnings: 600.00,
          created_at: '2024-01-25T09:45:00Z',
          status: 'paused'
        }
      ]
      setLinks(mockLinks)
    } catch (error) {
      console.error('Error loading links:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || link.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const createLink = async () => {
    if (!newLink.name || !newLink.original_url) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Mock API call - replace with actual API
      const newLinkData: Link = {
        id: Date.now(),
        name: newLink.name,
        short_url: `https://aff.ly/${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        original_url: newLink.original_url,
        clicks: 0,
        conversions: 0,
        earnings: 0,
        created_at: new Date().toISOString(),
        status: 'active'
      }

      setLinks(prev => [newLinkData, ...prev])
      setNewLink({ name: '', original_url: '', description: '' })
      setShowCreateModal(false)
      alert('Link created successfully!')
    } catch (error) {
      console.error('Error creating link:', error)
      alert('Failed to create link')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="section">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Affiliate Links</h1>
          <p className="text-gray-600">Manage and track your affiliate marketing links</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>Create Link
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
            <option value="sports">Sports</option>
          </select>
          <button
            onClick={() => {/* Filter functionality */}}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <i className="fas fa-filter mr-2"></i>Filter
          </button>
        </div>
      </div>

      {/* Links Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading links...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => (
            <div key={link.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{link.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">{link.original_url}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyLink(link.short_url)}
                    className="text-gray-500 hover:text-blue-600"
                    title="Copy link"
                    aria-label="Copy link to clipboard"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    onClick={() => {/* Edit functionality */}}
                    className="text-gray-500 hover:text-green-600"
                    title="Edit link"
                    aria-label="Edit link"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-sm font-medium text-gray-700">Short URL:</p>
                <p className="text-blue-600 font-mono text-sm break-all">{link.short_url}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{link.clicks.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Clicks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{link.conversions}</p>
                  <p className="text-xs text-gray-600">Conversions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">${link.earnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-600">Earnings</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(link.status)}`}>
                  {link.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(link.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create Affiliate Link</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
                title="Close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Name *</label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Product Link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original URL *</label>
                <input
                  type="url"
                  value={newLink.original_url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, original_url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/product"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newLink.description}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of this link"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createLink}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <i className="fas fa-link mr-1"></i>Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
