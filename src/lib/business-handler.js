// Business and Pricing Handler
// Provides warm redirects for business questions without using OpenAI

const BUSINESS_KEYWORDS = [
  'pricing', 'price', 'cost', 'fee', 'payment', 'billing',
  'plan', 'package', 'session', 'appointment', 'booking',
  'schedule', 'availability', 'calendar', 'time', 'duration',
  'business', 'service', 'offer', 'deal', 'discount',
  'refund', 'cancellation', 'policy', 'terms', 'agreement',
  'subscribe', 'subscription', 'membership', 'join', 'sign up'
];

const BUSINESS_RESPONSES = {
  pricing: {
    title: "💚 I'm Here For Your Friendship",
    response: `I'm here for your friendship and emotional support, not payment plans! 💚

For pricing and business stuff, check out our Plans page - it has everything you need.

I'd rather focus on being here for you as your emotional companion. That's what I'm good at - helping you grow and feel better.

What's really on your heart right now? I'm here to listen.`,
    category: 'pricing',
    priority: 'high',
    redirectUrl: '/pricing'
  },
  
  scheduling: {
    title: "💙 Let's Focus On You",
    response: `I'm here to be your emotional companion, not your scheduler! 💙

For scheduling and booking stuff, check out our pricing page - it has all the details.

I'd rather focus on what's really important - you and how you're feeling. That's what I'm here for.

What's really on your mind right now? I'm here to listen.`,
    category: 'scheduling',
    priority: 'high',
    redirectUrl: '/pricing'
  },
  
  policies: {
    title: "💙 I'm Here For Your Heart",
    response: `I'm here for your heart and emotional wellness, not policy documents! 💙

For business policies and terms, check out our pricing page - it has everything you need.

I'd rather focus on what really matters - you and your emotional wellness. That's what I'm here for.

What's really weighing on your heart right now? I'm here to listen.`,
    category: 'policies',
    priority: 'medium',
    redirectUrl: '/pricing'
  },
  
  services: {
    title: "💙 I'm Your EI Companion",
    response: `I'm here to be your emotional intelligence companion, not a service catalog! 💙

For detailed service info, check out our pricing page - it has everything you need.

I'd rather focus on what's really important - you and your emotional wellness. That's what I'm here for.

What's really on your heart right now? I'm here to listen.`,
    category: 'services',
    priority: 'medium',
    redirectUrl: '/pricing'
  },
  
  contact: {
    title: "💙 I'm Right Here With You",
    response: `I'm right here with you as your emotional companion, not a contact directory! 💙

For contact info and office hours, check out our pricing page - it has everything you need.

I'd rather focus on what really matters - you and your emotional wellness. That's what I'm here for.

What's really on your mind right now? I'm here to listen.`,
    category: 'contact',
    priority: 'medium',
    redirectUrl: '/pricing'
  }
};

export function detectBusinessRequest(message) {
  const messageLower = message.toLowerCase();
  
  // Check for business-related keywords
  const hasBusinessKeyword = BUSINESS_KEYWORDS.some(keyword => 
    messageLower.includes(keyword)
  );
  
  if (!hasBusinessKeyword) {
    return { detected: false };
  }
  
  // Determine specific business type
  if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('fee') || messageLower.includes('payment')) {
    return {
      detected: true,
      type: 'pricing',
      response: BUSINESS_RESPONSES.pricing
    };
  }
  
  if (messageLower.includes('schedule') || messageLower.includes('book') || messageLower.includes('appointment') || messageLower.includes('availability') || messageLower.includes('time')) {
    return {
      detected: true,
      type: 'scheduling',
      response: BUSINESS_RESPONSES.scheduling
    };
  }
  
  if (messageLower.includes('policy') || messageLower.includes('term') || messageLower.includes('refund') || messageLower.includes('cancellation')) {
    return {
      detected: true,
      type: 'policies',
      response: BUSINESS_RESPONSES.policies
    };
  }
  
  if (messageLower.includes('service') || messageLower.includes('offer') || messageLower.includes('program') || messageLower.includes('what do you do')) {
    return {
      detected: true,
      type: 'services',
      response: BUSINESS_RESPONSES.services
    };
  }
  
  if (messageLower.includes('contact') || messageLower.includes('email') || messageLower.includes('phone') || messageLower.includes('reach') || messageLower.includes('call')) {
    return {
      detected: true,
      type: 'contact',
      response: BUSINESS_RESPONSES.contact
    };
  }
  
  // Default to pricing for general business questions
  return {
    detected: true,
    type: 'pricing',
    response: BUSINESS_RESPONSES.pricing
  };
}

export function getBusinessResponse(businessType) {
  return BUSINESS_RESPONSES[businessType] || BUSINESS_RESPONSES.pricing;
}

export function getAllBusinessResponses() {
  return Object.values(BUSINESS_RESPONSES);
} 