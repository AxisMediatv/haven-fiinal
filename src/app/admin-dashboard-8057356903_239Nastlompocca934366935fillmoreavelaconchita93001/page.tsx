'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components to avoid SSR issues
const Line = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })), { ssr: false });
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Doughnut })), { ssr: false });

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  totalUsers: number;
  totalCosts: number;
  totalTokens: number;
  totalConversations: number;
  userActivity: Array<{
    userId: string;
    tokens: number;
    cost: number;
    conversations: number;
    lastActive: string;
    status: string;
  }>;
  costTrends: Array<{
    date: string;
    cost: number;
    tokens: number;
  }>;
  userEngagement: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin-analytics?days=30');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (_err) {
      setError('Network error while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh every minute
    const interval = setInterval(fetchAnalytics, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
            <h2 className="text-red-400 text-xl mb-2">Error Loading Dashboard</h2>
            <p className="text-red-300">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">No analytics data available</p>
        </div>
      </div>
    );
  }

           // Chart data preparation
         const costTrendsData = {
           labels: (analytics.costTrends || []).map(item => new Date(item.date).toLocaleDateString()),
           datasets: [
             {
               label: 'Daily Costs ($)',
               data: (analytics.costTrends || []).map(item => item.cost || 0),
               borderColor: '#FF6B8A',
               backgroundColor: 'rgba(255, 107, 138, 0.1)',
               fill: true,
               tension: 0.4,
             },
             {
               label: 'Daily Tokens',
               data: (analytics.costTrends || []).map(item => (item.tokens || 0) / 1000), // Scale down for visibility
               borderColor: '#FFD93D',
               backgroundColor: 'rgba(255, 217, 61, 0.1)',
               fill: true,
               tension: 0.4,
               yAxisID: 'y1',
             }
           ]
         };

           const userEngagementData = {
           labels: (analytics.userEngagement || []).map(item => new Date(item.date).toLocaleDateString()),
           datasets: [
             {
               label: 'Active Users',
               data: (analytics.userEngagement || []).map(item => item.activeUsers || 0),
               backgroundColor: 'rgba(255, 107, 138, 0.8)',
               borderColor: '#FF6B8A',
               borderWidth: 2,
             },
             {
               label: 'New Users',
               data: (analytics.userEngagement || []).map(item => item.newUsers || 0),
               backgroundColor: 'rgba(255, 217, 61, 0.8)',
               borderColor: '#FFD93D',
               borderWidth: 20,
             }
           ]
         };

           const userStatusData = {
           labels: ['Active', 'Inactive', 'New'],
           datasets: [{
             data: [
               (analytics.userActivity || []).filter(u => u.status === 'active').length,
               (analytics.userActivity || []).filter(u => u.status === 'inactive').length,
               (analytics.userActivity || []).filter(u => u.status === 'new').length,
             ],
             backgroundColor: ['#FF6B8A', '#FF9A8B', '#FFD93D'],
             borderColor: ['#E8447A', '#FF8C42', '#D2691E'],
             borderWidth: 2,
           }]
         };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-700 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Haven Admin Dashboard</h1>
          <p className="text-pink-100 text-lg">
            Real-time analytics and user insights
            {lastUpdated && (
              <span className="ml-4 text-sm opacity-75">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
      </div>

                           <div className="max-w-7xl mx-auto px-[300px] pb-[300px] pt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-3xl font-bold text-pink-400 mb-2">{analytics.totalUsers}</div>
            <div className="text-gray-300 uppercase tracking-wider text-sm">Total Users</div>
          </div>
          
                           <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
                                       <div className="text-3xl font-bold text-yellow-400 mb-2">${(analytics.totalCosts || 0).toFixed(6)}</div>
                   <div className="text-gray-300 uppercase tracking-wider text-sm">Total Costs</div>
                 </div>
                 
                 <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
                   <div className="text-3xl font-bold text-orange-400 mb-2">{(analytics.totalTokens || 0).toLocaleString()}</div>
                   <div className="text-gray-300 uppercase tracking-wider text-sm">Total Tokens</div>
                 </div>
                 
                 <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
                   <div className="text-3xl font-bold text-coral-400 mb-2">{analytics.totalConversations || 0}</div>
                   <div className="text-gray-300 uppercase tracking-wider text-sm">Conversations</div>
                 </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cost Trends Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center">
              <span className="w-3 h-3 bg-pink-400 rounded-full mr-3"></span>
              Cost & Token Trends
            </h3>
            <div className="h-64">
              <Line 
                data={costTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#fff' }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      ticks: { color: '#9ca3af' },
                      grid: { drawOnChartArea: false }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* User Engagement Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>
              User Engagement
            </h3>
            <div className="h-64">
              <Bar 
                data={userEngagementData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#fff' }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                      ticks: { color: '#9ca3af' },
                      grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* User Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-coral-400 mb-4 flex items-center">
              <span className="w-3 h-3 bg-coral-400 rounded-full mr-3"></span>
              User Status Distribution
            </h3>
            <div className="h-48">
              <Doughnut 
                data={userStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#fff' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Top Users by Cost */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
              <span className="w-3 h-3 bg-orange-400 rounded-full mr-3"></span>
              Top Users by Cost (Last 30 Days)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                                         <th className="text-left p-2 text-gray-300">User</th>
                    <th className="text-left p-2 text-gray-300">Cost</th>
                    <th className="text-left p-2 text-gray-300">Tokens</th>
                    <th className="text-left p-2 text-gray-300">Conversations</th>
                    <th className="text-left p-2 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                                           {(analytics.userActivity || [])
                           .sort((a, b) => (b.cost || 0) - (a.cost || 0))
                           .slice(0, 10)
                           .map((user) => (
                      <tr key={user.userId} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-2 text-white font-mono text-xs">{user.userId}</td>
                                                                                                       <td className="p-2 text-green-400">${(user.cost || 0).toFixed(6)}</td>
                           <td className="p-2 text-blue-400">{(user.tokens || 0).toLocaleString()}</td>
                           <td className="p-2 text-purple-400">{user.conversations || 0}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            user.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button 
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg text-white font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
