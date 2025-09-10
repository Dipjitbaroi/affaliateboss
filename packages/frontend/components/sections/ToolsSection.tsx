'use client'

import { useState } from 'react'

interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: string
  isActive: boolean
}

export default function ToolsSection() {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [qrData, setQrData] = useState({
    text: '',
    size: '200'
  })
  const [contentData, setContentData] = useState({
    topic: '',
    keywords: '',
    length: 'medium'
  })

  const tools: Tool[] = [
    {
      id: 'qr-generator',
      name: 'QR Code Generator',
      description: 'Generate QR codes for your affiliate links',
      icon: 'fas fa-qrcode',
      category: 'marketing',
      isActive: true
    },
    {
      id: 'content-generator',
      name: 'AI Content Generator',
      description: 'Create engaging content for your affiliate promotions',
      icon: 'fas fa-robot',
      category: 'content',
      isActive: true
    },
    {
      id: 'link-shortener',
      name: 'Link Shortener',
      description: 'Create short, branded links for better sharing',
      icon: 'fas fa-link',
      category: 'marketing',
      isActive: false
    },
    {
      id: 'analytics-tracker',
      name: 'Advanced Analytics',
      description: 'Track detailed performance metrics',
      icon: 'fas fa-chart-line',
      category: 'analytics',
      isActive: false
    },
    {
      id: 'email-templates',
      name: 'Email Templates',
      description: 'Professional email templates for affiliate outreach',
      icon: 'fas fa-envelope',
      category: 'communication',
      isActive: false
    },
    {
      id: 'social-scheduler',
      name: 'Social Media Scheduler',
      description: 'Schedule and automate your social media posts',
      icon: 'fas fa-calendar-alt',
      category: 'social',
      isActive: false
    }
  ]

  const generateQRCode = async () => {
    if (!qrData.text) {
      alert('Please enter text or URL to generate QR code')
      return
    }

    try {
      // Mock QR generation - replace with actual API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrData.size}x${qrData.size}&data=${encodeURIComponent(qrData.text)}`
      const link = document.createElement('a')
      link.href = qrUrl
      link.download = 'affiliate-qr-code.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      alert('QR code downloaded successfully!')
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    }
  }

  const generateContent = async () => {
    if (!contentData.topic) {
      alert('Please enter a topic for content generation')
      return
    }

    try {
      // Mock content generation - replace with actual AI API
      const mockContent = `# ${contentData.topic}

## Why You Should Consider ${contentData.topic}

${contentData.topic} offers incredible value for affiliate marketers looking to maximize their earnings. With competitive commission rates and high conversion potential, this is a must-have addition to your affiliate portfolio.

### Key Benefits:
- **High Commission Rates**: Earn up to 15% on every sale
- **Quality Product**: Trusted by thousands of customers
- **Excellent Support**: 24/7 customer service available
- **Easy Integration**: Simple affiliate links and tracking

### How to Get Started:
1. Sign up for our affiliate program
2. Get your unique affiliate links
3. Start promoting and earning commissions
4. Track your performance in real-time

Don't miss out on this amazing opportunity to boost your affiliate income!

*Keywords: ${contentData.keywords || 'affiliate marketing, commissions, passive income'}*`

      // Copy to clipboard
      await navigator.clipboard.writeText(mockContent)
      alert('Content generated and copied to clipboard!')
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'marketing': return 'bg-blue-100 text-blue-800'
      case 'content': return 'bg-green-100 text-green-800'
      case 'analytics': return 'bg-purple-100 text-purple-800'
      case 'communication': return 'bg-yellow-100 text-yellow-800'
      case 'social': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="section">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Marketing Tools</h1>
          <p className="text-gray-600">Powerful tools to boost your affiliate marketing success</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
              tool.isActive ? 'border-2 border-blue-200' : 'opacity-60'
            }`}
            onClick={() => tool.isActive && setActiveTool(activeTool === tool.id ? null : tool.id)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${tool.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <i className={`${tool.icon} text-2xl ${tool.isActive ? 'text-blue-600' : 'text-gray-400'}`}></i>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(tool.category)}`}>
                  {tool.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">{tool.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${tool.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {tool.isActive ? 'Active' : 'Coming Soon'}
                </span>
                {tool.isActive && (
                  <button 
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {activeTool === tool.id ? 'Hide' : 'Use Tool'} <i className="fas fa-chevron-down ml-1"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Tool Interface */}
            {activeTool === tool.id && tool.isActive && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                {tool.id === 'qr-generator' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Generate QR Code</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text or URL</label>
                      <input
                        type="text"
                        value={qrData.text}
                        onChange={(e) => setQrData(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Enter URL or text..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size (pixels)</label>
                      <select
                        value={qrData.size}
                        onChange={(e) => setQrData(prev => ({ ...prev, size: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select QR code size"
                      >
                        <option value="100">100x100</option>
                        <option value="200">200x200</option>
                        <option value="300">300x300</option>
                        <option value="500">500x500</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={generateQRCode}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-download mr-2"></i>Generate & Download QR Code
                    </button>
                  </div>
                )}

                {tool.id === 'content-generator' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Generate Content</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                      <input
                        type="text"
                        value={contentData.topic}
                        onChange={(e) => setContentData(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="e.g., Best Wireless Headphones 2024"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (optional)</label>
                      <input
                        type="text"
                        value={contentData.keywords}
                        onChange={(e) => setContentData(prev => ({ ...prev, keywords: e.target.value }))}
                        placeholder="wireless, headphones, audio, quality"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
                      <select
                        value={contentData.length}
                        onChange={(e) => setContentData(prev => ({ ...prev, length: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        title="Select content length"
                      >
                        <option value="short">Short (200 words)</option>
                        <option value="medium">Medium (500 words)</option>
                        <option value="long">Long (1000 words)</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={generateContent}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <i className="fas fa-magic mr-2"></i>Generate Content
                    </button>
                  </div>
                )}

                {tool.id === 'link-shortener' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800">Shorten Link</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Long URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/very-long-affiliate-link"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Alias (optional)</label>
                      <input
                        type="text"
                        placeholder="my-awesome-link"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button 
                      type="button"
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <i className="fas fa-compress mr-2"></i>Shorten Link
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => copyToClipboard('https://affiliateboss.com/join')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <i className="fas fa-copy text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm font-medium text-gray-700">Copy Referral Link</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {/* Export data */}}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <i className="fas fa-download text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm font-medium text-gray-700">Export Performance</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {/* Share tools */}}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <div className="text-center">
              <i className="fas fa-share text-2xl text-gray-400 mb-2"></i>
              <div className="text-sm font-medium text-gray-700">Share Tools</div>
            </div>
          </button>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          <i className="fas fa-lightbulb mr-2"></i>Pro Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">QR Code Best Practices</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Use high contrast colors for better scanning</li>
              <li>• Test QR codes on different devices</li>
              <li>• Include a call-to-action with your QR codes</li>
              <li>• Track scans to measure effectiveness</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Content Generation Tips</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Use specific keywords for better SEO</li>
              <li>• Write for your target audience</li>
              <li>• Include social proof and testimonials</li>
              <li>• Add clear calls-to-action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
