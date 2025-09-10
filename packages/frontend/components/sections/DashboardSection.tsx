'use client'

import { useState, useEffect } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function DashboardSection() {
  const [stats, setStats] = useState({
    totalEarnings: 15420.50,
    activeLinks: 47,
    totalClicks: 89432,
    conversionRate: 4.2
  })

  const earningsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Earnings',
      data: [1200, 1350, 1100, 1600, 1450, 1800],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }

  const productsChartData = {
    labels: ['Electronics', 'Fashion', 'Home', 'Sports', 'Books'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6'
      ]
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const }
    }
  }

  return (
    <div className="section fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's your affiliate performance summary.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg card-shadow card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <i className="fas fa-dollar-sign text-green-600"></i>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            <i className="fas fa-arrow-up mr-1"></i> +12.5% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Links</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeLinks}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <i className="fas fa-link text-blue-600"></i>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-600">
            <i className="fas fa-arrow-up mr-1"></i> +3 new this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <i className="fas fa-mouse-pointer text-purple-600"></i>
            </div>
          </div>
          <div className="mt-2 text-sm text-purple-600">
            <i className="fas fa-arrow-up mr-1"></i> +8.3% this month
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg card-shadow card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-600">{stats.conversionRate}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <i className="fas fa-chart-line text-orange-600"></i>
            </div>
          </div>
          <div className="mt-2 text-sm text-orange-600">
            <i className="fas fa-arrow-up mr-1"></i> +0.3% improvement
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold mb-4">Earnings Trend (30 Days)</h3>
          <div className="h-64">
            <Line data={earningsChartData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
          <div className="h-64">
            <Doughnut data={productsChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Commissions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <i className="fas fa-dollar-sign text-green-500 mr-3"></i>
                <div>
                  <p className="text-sm font-medium">Commission earned</p>
                  <p className="text-xs text-gray-500">iPhone 15 Pro Max</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">$339.92</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <i className="fas fa-dollar-sign text-green-500 mr-3"></i>
                <div>
                  <p className="text-sm font-medium">Commission earned</p>
                  <p className="text-xs text-gray-500">MacBook Pro M3</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">$1,529.40</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
          <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Commissions →
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg card-shadow">
          <h3 className="text-lg font-semibold mb-4">Top Affiliate Links</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <i className="fas fa-link text-blue-500 mr-3"></i>
                <div>
                  <p className="text-sm font-medium">MacBook Pro Link</p>
                  <p className="text-xs text-gray-500">2,847 clicks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">$1,529.40</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <i className="fas fa-link text-blue-500 mr-3"></i>
                <div>
                  <p className="text-sm font-medium">iPhone 15 Link</p>
                  <p className="text-xs text-gray-500">1,056 clicks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">$238.14</p>
              </div>
            </div>
          </div>
          <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Links →
          </button>
        </div>
      </div>
    </div>
  )
}
