// Badge sharing utility functions

export const generateBadgeShareUrl = (badgeId, userId, baseUrl = '') => {
  const domain = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${domain}/share/badge/${badgeId}/${userId}`;
};

export const generateShareText = (badgeName, displayName) => {
  return `${displayName} just earned the "${badgeName}" badge on Haven! 🏆 #EmotionalIntelligence #Haven`;
};

export const shareOnSocialMedia = (platform, shareText, shareUrl) => {
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };
  
  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank');
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};

export const getBadgeInfo = (badgeId) => {
  const badgeDatabase = {
    'first-haven-chat': {
      id: 'first-haven-chat',
      name: 'First Haven Chat',
      description: 'Started your emotional intelligence journey',
      icon: '🌟',
      rarity: 'Common',
      category: 'Starter'
    },
    'first-message': {
      id: 'first-message',
      name: 'First Conversation',
      description: 'Send your first message to Haven',
      icon: '💬',
      rarity: 'Common',
      category: 'Starter'
    },
    '3-day-streak': {
      id: '3-day-streak',
      name: '3-Day Haven Streak',
      description: 'Daily check-ins for three days',
      icon: '🔥',
      rarity: 'Common',
      category: 'Consistency'
    },
    '7-day-streak': {
      id: '7-day-streak',
      name: '7-Day Haven Streak',
      description: 'Weekly commitment to emotional growth',
      icon: '🔥',
      rarity: 'Uncommon',
      category: 'Consistency'
    },
    'growth-seeker': {
      id: 'growth-seeker',
      name: 'Growth Seeker',
      description: 'Embraced personal development journey',
      icon: '🌱',
      rarity: 'Uncommon',
      category: 'Emotional Growth'
    },
    'mindfulness-master': {
      id: 'mindfulness-master',
      name: 'Mindfulness Master',
      description: 'Developed mindful awareness practices',
      icon: '🧘',
      rarity: 'Rare',
      category: 'Emotional Growth'
    },
    'self-care-champion': {
      id: 'self-care-champion',
      name: 'Self-Care Champion',
      description: 'Prioritized personal wellness and care',
      icon: '💖',
      rarity: 'Uncommon',
      category: 'Wellness'
    },
    'gratitude-practitioner': {
      id: 'gratitude-practitioner',
      name: 'Gratitude Practitioner',
      description: 'Cultivated daily gratitude practices',
      icon: '🙏',
      rarity: 'Uncommon',
      category: 'Wellness'
    }
  };
  
  return badgeDatabase[badgeId] || null;
};
