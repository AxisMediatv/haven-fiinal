'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Head from 'next/head';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
}

interface UserData {
  id: string;
  displayName: string;
  avatar?: string;
}

// Badge and user data will be fetched from API endpoints

export default function BadgeSharePage() {
  const params = useParams();
  const { 'badge-id': badgeId, 'user-id': userId } = params;
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching data for badge:', badgeId, 'and user:', userId);
        
        // Fetch badge data
        if (badgeId) {
          const badgeResponse = await fetch(`/api/badges/${badgeId}`);
          console.log('Badge response status:', badgeResponse.status);
          
          if (badgeResponse.ok) {
            const badgeData = await badgeResponse.json();
            console.log('Badge data received:', badgeData);
            setBadge(badgeData);
          } else {
            const errorData = await badgeResponse.json();
            console.error('Badge API error:', errorData);
            setError(`Badge not found: ${badgeId}`);
          }
        }
        
        // Fetch user data
        if (userId) {
          const userResponse = await fetch(`/api/users/${userId}`);
          console.log('User response status:', userResponse.status);
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('User data received:', userData);
            setUser(userData);
          } else {
            const errorData = await userResponse.json();
            console.error('User API error:', errorData);
            setError(`User not found: ${userId}`);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [badgeId, userId]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const displayName = user?.displayName || userId;
  const shareText = badge ? `${displayName} just earned the "${badge.name}" badge on Haven! 🏆 #EmotionalIntelligence #Haven` : 'Check out this amazing achievement on Haven! 🏆 #EmotionalIntelligence #Haven';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading badge...</p>
          <p className="text-sm text-gray-500 mt-2">Badge: {badgeId} | User: {userId}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-white rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-gray-500 mb-2">Debug Info:</p>
            <p className="text-xs font-mono">Badge ID: {badgeId}</p>
            <p className="text-xs font-mono">User ID: {userId}</p>
          </div>
          <p className="text-sm text-gray-500">
            Try using one of these valid user IDs: user_12345, user_67890, user_11111, user_22222, user_33333
          </p>
          <a 
            href="/badge-demo" 
            className="inline-block mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Demo
          </a>
        </div>
      </div>
    );
  }

  // Show main content when data is loaded
  if (!badge || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Data Not Found</h1>
          <p className="text-gray-600 mb-4">Unable to load badge or user information</p>
          <div className="bg-white rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-gray-500 mb-2">Debug Info:</p>
            <p className="text-xs font-mono">Badge: {badge ? '✅ Loaded' : '❌ Missing'}</p>
            <p className="text-xs font-mono">User: {user ? '✅ Loaded' : '❌ Missing'}</p>
          </div>
          <a 
            href="/badge-demo" 
            className="inline-block mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ← Back to Demo
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${displayName} earned the ${badge.name} badge on Haven!`}</title>
        <meta name="description" content={`${displayName} just earned the ${badge.name} badge on Haven! Join the emotional intelligence journey.`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={`${displayName} earned the ${badge.name} badge!`} />
        <meta property="og:description" content={`${displayName} just earned the ${badge.name} badge on Haven! Join the emotional intelligence journey.`} />
        <meta property="og:image" content="/haven-logo.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={shareUrl} />
        <meta property="twitter:title" content={`${displayName} earned the ${badge.name} badge!`} />
        <meta property="twitter:description" content={`${displayName} just earned the ${badge.name} badge on Haven! Join the emotional intelligence journey.`} />
        <meta property="twitter:image" content="/haven-logo.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-orange-50">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-full mb-4 shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Badge Achievement!
              </h1>
              <p className="text-xl text-gray-600">
                {displayName} just earned a special badge on Haven
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Badge Display Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-full mb-6 shadow-lg">
                <span className="text-5xl">{badge.icon}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{badge.name}</h2>
              <p className="text-lg text-gray-600 mb-4">{badge.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium">
                  {badge.rarity}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {badge.category}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-6">
                <span className="font-semibold">{displayName}</span> has demonstrated exceptional emotional intelligence and personal growth!
              </p>
            </div>
          </div>

          {/* Social Sharing Section */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Share This Achievement</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button
                onClick={shareOnTwitter}
                className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-4 px-6 rounded-xl hover:bg-blue-600 transition-colors font-medium"
              >
                <span className="text-xl">🐦</span>
                <span>Twitter</span>
              </button>
              
              <button
                onClick={shareOnFacebook}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <span className="text-xl">📘</span>
                <span>Facebook</span>
              </button>
              
              <button
                onClick={shareOnLinkedIn}
                className="flex items-center justify-center space-x-2 bg-blue-700 text-white py-4 px-6 rounded-xl hover:bg-blue-800 transition-colors font-medium"
              >
                <span className="text-xl">💼</span>
                <span>LinkedIn</span>
              </button>
              
              <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-medium transition-colors ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <span className="text-xl">{copied ? '✅' : '📋'}</span>
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Share URL</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 p-3 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-pink-500 to-yellow-500 rounded-3xl shadow-2xl p-8 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Join Haven Today!</h3>
            <p className="text-xl mb-6 opacity-90">
              Start your own emotional intelligence journey and earn badges like {displayName}
            </p>
            <a
              href="/haven-chat"
              className="inline-block bg-white text-pink-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors text-lg shadow-lg"
            >
              Get Started with Haven
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-4xl mx-auto px-6 text-center text-gray-500">
            <p>Powered by Haven - Your emotional intelligence companion</p>
          </div>
        </div>
      </div>
    </>
  );
}
