// Crisis Detection and Response System
// Provides instant responses for crisis situations without using OpenAI

const CRISIS_KEYWORDS = {
  immediate: [
    'suicide', 'kill myself', 'want to die', 'end it all', 'no reason to live',
    'better off dead', 'end my life', 'take my life', 'kill myself',
    'self-harm', 'cutting', 'cut myself', 'bleeding', 'hurt myself', 'harm myself',
    'overdose', 'overdosing', 'take pills', 'swallow pills', 'poison',
    'gun', 'weapon', 'shoot myself', 'hang myself', 'jump off'
  ],
  urgent: [
    'suicidal', 'thinking of suicide', 'planning suicide', 'suicide plan',
    'want to end it', 'want to die', 'no point living', 'life not worth living',
    'self-harm', 'cutting myself', 'hurting myself', 'harm myself',
    'overdose', 'take pills', 'swallow pills', 'poison myself'
  ],
  moderate: [
    'suicide', 'kill myself', 'want to die', 'end it all',
    'self-harm', 'cutting', 'hurt myself', 'harm myself',
    'overdose', 'pills', 'poison', 'jump off'
  ]
};

const CRISIS_RESPONSES = {
  immediate: {
    title: "🚨 Crisis Support Needed",
    response: `🚨 I'm detecting that you might be going through something really serious right now - more than I can handle alone. But I want you to know I'm staying right here with you through all of this.

Please reach out for professional help right now:
📞 CALL: 988 (24/7 Crisis Support)  
💬 TEXT: HOME to 741741
🌐 CHAT: suicidepreventionlifeline.org

**How would you like to proceed?**

[✅ I'm feeling better now, I've calmed down]
[📞 I contacted help - let me tell you who I reached]
[⚠️ I'm not ready to contact anyone yet, let's keep talking]

You don't have to face this alone.`,
    priority: 'immediate',
    requiresHuman: true,
    followUp: "Are you going to call 988? I'm staying right here with you.",
    interactive: true
  },
  urgent: {
    title: "🚨 Crisis Support Needed",
    response: `🚨 I'm detecting that you might be going through something really serious right now - more than I can handle alone. But I want you to know I'm staying right here with you through all of this.

Please reach out for professional help right now:
📞 CALL: 988 (24/7 Crisis Support)  
💬 TEXT: HOME to 741741
🌐 CHAT: suicidepreventionlifeline.org

**How would you like to proceed?**

[✅ I'm feeling better now, I've calmed down]
[📞 I contacted help - let me tell you who I reached]
[⚠️ I'm not ready to contact anyone yet, let's keep talking]

You don't have to face this alone.`,
    priority: 'urgent',
    requiresHuman: true,
    followUp: "Are you going to call 988? I'm staying right here with you.",
    interactive: true
  },
  moderate: {
    title: "💙 I'm Here For You",
    response: `I can see you're having a tough time. You don't have to go through this alone. Would you like to call 988? They have people who can help you right now.`,
    priority: 'moderate',
    requiresHuman: false,
    followUp: "What's going on? I'm here to listen.",
    interactive: false
  }
};

export function detectCrisis(message) {
  const messageLower = message.toLowerCase();
  
  // Check for immediate crisis keywords (exact phrases only)
  for (const keyword of CRISIS_KEYWORDS.immediate) {
    if (messageLower.includes(keyword)) {
      // Additional context check to avoid false positives
      const contextWords = ['fear', 'worried', 'concerned', 'thinking', 'wondering', 'afraid', 'scared', 'nervous', 'anxious', 'stress', 'stressed'];
      const hasContextWords = contextWords.some(word => messageLower.includes(word));
      
      // If message contains context words, it's likely not a crisis
      if (hasContextWords) {
        continue;
      }
      
      return {
        detected: true,
        level: 'immediate',
        response: CRISIS_RESPONSES.immediate,
        keywords: [keyword]
      };
    }
  }
  
  // Check for urgent crisis keywords (exact phrases only)
  for (const keyword of CRISIS_KEYWORDS.urgent) {
    if (messageLower.includes(keyword)) {
      // Additional context check to avoid false positives
      const contextWords = ['fear', 'worried', 'concerned', 'thinking', 'wondering', 'afraid', 'scared', 'nervous', 'anxious', 'stress', 'stressed'];
      const hasContextWords = contextWords.some(word => messageLower.includes(word));
      
      // If message contains context words, it's likely not a crisis
      if (hasContextWords) {
        continue;
      }
      
      return {
        detected: true,
        level: 'urgent',
        response: CRISIS_RESPONSES.urgent,
        keywords: [keyword]
      };
    }
  }
  
  // Check for moderate crisis keywords (exact phrases only)
  for (const keyword of CRISIS_KEYWORDS.moderate) {
    if (messageLower.includes(keyword)) {
      // Additional context check to avoid false positives
      const contextWords = ['fear', 'worried', 'concerned', 'thinking', 'wondering', 'afraid', 'scared', 'nervous', 'anxious', 'stress', 'stressed'];
      const hasContextWords = contextWords.some(word => messageLower.includes(word));
      
      // If message contains context words, it's likely not a crisis
      if (hasContextWords) {
        continue;
      }
      
      return {
        detected: true,
        level: 'moderate',
        response: CRISIS_RESPONSES.moderate,
        keywords: [keyword]
      };
    }
  }
  
  return { detected: false };
}

export function getCrisisResponse(crisisLevel) {
  return CRISIS_RESPONSES[crisisLevel] || CRISIS_RESPONSES.moderate;
}

// Additional crisis resources by location
export const CRISIS_RESOURCES = {
  national: {
    suicide: '988',
    text: '741741',
    veterans: '988 then press 1',
    lgbtq: '988 then press 3'
  },
  emergency: '911',
  websites: {
    suicidePrevention: 'https://988lifeline.org',
    crisisText: 'https://www.crisistextline.org',
    nami: 'https://www.nami.org/help'
  }
}; 