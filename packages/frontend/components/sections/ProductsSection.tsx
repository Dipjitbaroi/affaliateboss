'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  price: number
  category: string
  commission_rate: number
  image_url: string
  description: string
  affiliate_url: string
  sales_count: number
}

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [commissionFilter, setCommissionFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'electronics',
    commission_rate: '',
    image_url: '',
    description: '',
    affiliate_url: ''
  })

  const productsPerPage = 12

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max',
          price: 1199.99,
          category: 'electronics',
          commission_rate: 12,
          image_url: 'https://via.placeholder.com/300x200?text=iPhone+15',
          description: 'Latest iPhone with advanced camera system and A17 Pro chip',
          affiliate_url: 'https://affiliate-link.com/iphone15',
          sales_count: 45
        },
        {
          id: 2,
          name: 'MacBook Pro M3',
          price: 2499.99,
          category: 'electronics',
          commission_rate: 15,
          image_url: 'https://via.placeholder.com/300x200?text=MacBook+Pro',
          description: 'Powerful laptop with M3 chip for professional work',
          affiliate_url: 'https://affiliate-link.com/macbook',
          sales_count: 23
        },
        {
          id: 3,
          name: 'Wireless Headphones',
          price: 299.99,
          category: 'electronics',
          commission_rate: 10,
          image_url: 'https://via.placeholder.com/300x200?text=Headphones',
          description: 'Premium noise-cancelling wireless headphones',
          affiliate_url: 'https://affiliate-link.com/headphones',
          sales_count: 67
        },
        {
          id: 4,
          name: 'Designer Watch',
          price: 599.99,
          category: 'fashion',
          commission_rate: 18,
          image_url: 'https://via.placeholder.com/300x200?text=Watch',
          description: 'Luxury designer watch with premium materials',
          affiliate_url: 'https://affiliate-link.com/watch',
          sales_count: 12
        },
        {
          id: 5,
          name: 'Smart Home Hub',
          price: 149.99,
          category: 'electronics',
          commission_rate: 8,
          image_url: 'https://via.placeholder.com/300x200?text=Smart+Home',
          description: 'Control your entire smart home from one device',
          affiliate_url: 'https://affiliate-link.com/smarthome',
          sales_count: 89
        },
        {
          id: 6,
          name: 'Fitness Tracker',
          price: 199.99,
          category: 'sports',
          commission_rate: 14,
          image_url: 'https://via.placeholder.com/300x200?text=Fitness+Tracker',
          description: 'Advanced fitness tracking with heart rate monitoring',
          affiliate_url: 'https://affiliate-link.com/fitness',
          sales_count: 156
        }
      ]
      setProducts(mockProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || product.category === categoryFilter
      const matchesCommission = !commissionFilter ||
        (commissionFilter === '5' && product.commission_rate >= 5) ||
        (commissionFilter === '10' && product.commission_rate >= 10) ||
        (commissionFilter === '15' && product.commission_rate >= 15) ||
        (commissionFilter === '20' && product.commission_rate >= 20)
      return matchesSearch && matchesCategory && matchesCommission
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price
        case 'commission':
          return b.commission_rate - a.commission_rate
        case 'popularity':
          return b.sales_count - a.sales_count
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  const syncShopifyProducts = async () => {
    try {
      alert('Syncing products from Shopify... (This would connect to your Shopify store)')
      // Mock sync functionality
      setTimeout(() => {
        alert('Products synced successfully!')
        loadProducts()
      }, 2000)
    } catch (error) {
      console.error('Error syncing products:', error)
      alert('Failed to sync products')
    }
  }

  const createProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.affiliate_url) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // Mock API call - replace with actual API
      const newProductData: Product = {
        id: Date.now(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        commission_rate: parseFloat(newProduct.commission_rate) || 10,
        image_url: newProduct.image_url || 'https://via.placeholder.com/300x200?text=Product',
        description: newProduct.description,
        affiliate_url: newProduct.affiliate_url,
        sales_count: 0
      }

      setProducts(prev => [newProductData, ...prev])
      setNewProduct({
        name: '',
        price: '',
        category: 'electronics',
        commission_rate: '',
        image_url: '',
        description: '',
        affiliate_url: ''
      })
      setShowAddModal(false)
      alert('Product added successfully!')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to add product')
    }
  }

  const copyAffiliateLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert('Affiliate link copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const stats = {
    totalProducts: products.length,
    avgCommission: products.length > 0 ? products.reduce((sum, p) => sum + p.commission_rate, 0) / products.length : 0,
    topSeller: products.length > 0 ? products.reduce((prev, current) => (prev.sales_count > current.sales_count) ? prev : current).name : 'N/A',
    newProducts: products.filter(p => new Date().getTime() - new Date(p.id).getTime() < 7 * 24 * 60 * 60 * 1000).length
  }

  return (
    <div className="section">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Catalog</h1>
          <p className="text-gray-600">Browse and create affiliate links for available products</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={syncShopifyProducts}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <i className="fab fa-shopify mr-2"></i>Sync Shopify
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>Add Product
          </button>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">{stats.avgCommission.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Commission</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.topSeller}</div>
          <div className="text-sm text-gray-600">Top Seller</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.newProducts}</div>
          <div className="text-sm text-gray-600">New This Week</div>
        </div>
      </div>

      {/* Product Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
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
            <option value="health">Health & Beauty</option>
            <option value="sports">Sports</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
            aria-label="Sort products"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="commission">Sort by Commission</option>
            <option value="popularity">Sort by Popularity</option>
          </select>
          <select
            value={commissionFilter}
            onChange={(e) => setCommissionFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
            aria-label="Filter by commission rate"
          >
            <option value="">All Commission Rates</option>
            <option value="5">5%+</option>
            <option value="10">10%+</option>
            <option value="15">15%+</option>
            <option value="20">20%+</option>
          </select>
          <button
            onClick={() => {/* Filter functionality */}}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <i className="fas fa-filter mr-2"></i>Filter
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="aspect-w-3 aspect-h-2">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold text-green-600">${product.price.toFixed(2)}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                    {product.commission_rate}% commission
                  </span>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">{product.sales_count} sales</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {product.category}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyAffiliateLink(product.affiliate_url)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    <i className="fas fa-copy mr-1"></i>Copy Link
                  </button>
                  <button
                    onClick={() => {/* Create affiliate link */}}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm"
                  >
                    <i className="fas fa-link mr-1"></i>Create Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="iPhone 15 Pro Max"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="999.99"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select product category"
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="health">Health & Beauty</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                <input
                  type="number"
                  value={newProduct.commission_rate}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, commission_rate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                  min="1"
                  max="50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Affiliate URL *</label>
                <input
                  type="url"
                  value={newProduct.affiliate_url}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, affiliate_url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/product"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product description..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createProduct}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <i className="fas fa-plus mr-1"></i>Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
