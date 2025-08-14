'use client';
import { useState, useEffect } from 'react';

export default function BadgeDemoPage() {
  const [selectedBadge, setSelectedBadge] = useState('growth-seeker');
  const [userId, setUserId] = useState('user_12345');
  const [shareUrl, setShareUrl] = useState('');
  const [autoDetectedUserId, setAutoDetectedUserId] = useState('');
  const [isAutoMode, setIsAutoMode] = useState(false);

  // Auto-detect User ID from localStorage (like the real app would)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const detectedId = localStorage.getItem('haven_user_id') || 'user_12345';
      setAutoDetectedUserId(detectedId);
      
      // If we have a detected ID, use it
      if (detectedId && detectedId !== 'user_12345') {
        setUserId(detectedId);
        setIsAutoMode(true);
      }
    }
  }, []);

  // Generate share URL on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/share/badge/${selectedBadge}/${userId}`);
    }
  }, [selectedBadge, userId]);

  const openSharePage = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const toggleMode = () => {
    if (isAutoMode) {
      // Switch to manual mode
      setIsAutoMode(false);
      setUserId('user_12345');
    } else {
      // Switch to auto mode
      setIsAutoMode(true);
      setUserId(autoDetectedUserId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Badge Sharing Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test the new individual badge sharing system with automatic User ID detection
          </p>
        </div>

        {/* Main Configuration Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Configure Badge Sharing</h2>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isAutoMode 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isAutoMode ? '🔄 Auto Mode' : '✏️ Manual Mode'}
              </span>
              <button
                onClick={toggleMode}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm font-medium"
              >
                {isAutoMode ? 'Switch to Manual' : 'Switch to Auto'}
              </button>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Badge Selection */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">
                🎯 Select Badge
              </label>
              <select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all duration-200 text-lg"
              >
                <option value="growth-seeker">🌱 Growth Seeker</option>
                <option value="empathy-champion">💝 Empathy Champion</option>
                <option value="resilience-warrior">🛡️ Resilience Warrior</option>
                <option value="mindfulness-master">🧘 Mindfulness Master</option>
                <option value="connection-builder">🤝 Connection Builder</option>
              </select>
              <p className="text-sm text-gray-500">
                Choose which badge to share
              </p>
            </div>
            
            {/* User ID Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">
                👤 User ID
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g., user_12345"
                  className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-lg ${
                    isAutoMode 
                      ? 'border-green-300 bg-green-50 focus:ring-4 focus:ring-green-100 focus:border-green-400' 
                      : 'border-gray-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-400'
                  }`}
                />
                <div className="flex items-center space-x-2 text-sm">
                  {isAutoMode ? (
                    <span className="text-green-600 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Auto-detected from localStorage
                    </span>
                  ) : (
                    <span className="text-blue-600 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Manual input mode
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Try: user_12345, user_67890, user_11111, user_22222, user_33333
                </p>
              </div>
            </div>
          </div>

          {/* Generated URL Display */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              🔗 Generated Share URL
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-4 bg-white border-2 border-gray-200 rounded-xl text-lg font-mono shadow-inner"
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                📋 Copy
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={openSharePage}
            disabled={!shareUrl}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            🚀 Open Share Page
          </button>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
              <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="font-bold text-gray-800 text-center mb-3">URL Structure</h3>
              <p className="text-gray-600 text-sm text-center">
                Each badge gets its own share page: <code className="bg-white px-2 py-1 rounded text-xs">/share/badge/[badge-id]/[user-id]</code>
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="font-bold text-gray-800 text-center mb-3">User ID Mapping</h3>
              <p className="text-gray-600 text-sm text-center">
                User IDs map to display names via API (e.g., <code className="bg-white px-2 py-1 rounded text-xs">user_12345</code> → &quot;Alex Johnson&quot;)
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="font-bold text-gray-800 text-center mb-3">Display Name</h3>
              <p className="text-gray-600 text-sm text-center">
                Share pages show the user&apos;s actual name, not the user ID, for a personal touch
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h3 className="font-bold text-gray-800 text-center mb-3">Social Sharing</h3>
              <p className="text-gray-600 text-sm text-center">
                Each page includes social media buttons and copy link for easy sharing
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold text-lg">5</span>
              </div>
              <h3 className="font-bold text-gray-800 text-center mb-3">Call to Action</h3>
              <p className="text-gray-600 text-sm text-center">
                Visitors see achievements and are encouraged to join Haven themselves
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold text-lg">6</span>
              </div>
              <h3 className="font-bold text-gray-800 text-center mb-3">Auto Detection</h3>
              <p className="text-gray-600 text-sm text-center">
                In the real app, User IDs are automatically detected from user authentication
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            💡 <strong>Pro Tip:</strong> In the real Haven app, users won&apos;t need to input their User ID - it will be automatically detected from their login session!
          </p>
        </div>
      </div>
    </div>
  );
}
