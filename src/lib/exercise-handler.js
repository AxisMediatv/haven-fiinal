// Exercise Handler for Knowledge Base Responses
// Provides instant responses for exercise requests without using OpenAI

const EXERCISE_KEYWORDS = [
  'exercise', 'activity', 'practice', 'technique', 'meditation',
  'breathing', 'grounding', 'mindfulness', 'journaling', 'reflection',
  'worksheet', 'tool', 'skill', 'coping', 'strategy', 'method'
];

const EXERCISE_RESPONSES = {
  breathing: {
    title: "🫁 Let's Breathe Together",
    response: `I'm so glad you want to try breathing exercises - they're such a powerful way to find calm. Let's do this together, okay?

**4-7-8 Breathing (My Favorite):**
1. Find a comfortable spot and close your eyes if you'd like
2. Inhale through your nose for 4 counts (feel your belly expand)
3. Hold your breath for 7 counts (just like a gentle pause)
4. Exhale through your mouth for 8 counts (let everything go)
5. Repeat this 4-5 times, and notice how you feel

**Box Breathing (When You Need Extra Grounding):**
1. Inhale for 4 counts
2. Hold for 4 counts
3. Exhale for 4 counts
4. Hold for 4 counts
5. Repeat for 5-10 minutes

**The magic happens when you really focus on each breath.** Don't worry if your mind wanders - that's totally normal. Just gently bring your attention back to your breath.

This helps calm your nervous system and enhance your emotional wellness. How does it feel? I'm here with you through this.`,
    category: 'breathing',
    duration: '5-10 minutes'
  },
  
  grounding: {
    title: "🌍 Let's Ground You Right Now",
    response: `I'm here to help you feel more present and connected. Let's do this together, okay?

**5-4-3-2-1 Grounding (My Go-To):**
Look around and identify:
• 5 things you can see (really notice the details)
• 4 things you can touch (feel the textures)
• 3 things you can hear (even the quiet sounds)
• 2 things you can smell (take a deep breath)
• 1 thing you can taste (maybe your coffee or water)

**Body Scan (When You Need Extra Connection):**
1. Close your eyes and take a deep breath
2. Focus on your toes, then slowly move up your body
3. Notice any tension and imagine it melting away
4. Continue all the way to the top of your head

**This helps you stay present and connected to your body.** Don't rush - take your time with each step. I'm right here with you through this.

How does it feel? I'm here to support you.`,
    category: 'grounding',
    duration: '3-5 minutes'
  },
  
  journaling: {
    title: "📝 Let's Explore Your Heart",
    response: `I love that you want to try journaling - it's such a beautiful way to understand yourself better. Let's explore together, okay?

**Emotional Check-in (Start Here):**
1. How am I feeling right now? (1-10 scale, and why?)
2. What triggered these feelings?
3. What do I need right now?
4. What would be helpful for me?

**Gratitude Practice (My Favorite):**
Write down 3 things you're grateful for today, no matter how small. Maybe it's your morning coffee, a kind text from a friend, or even just getting out of bed today.

**Future Self Letter (Powerful One):**
Write a letter to yourself from 6 months in the future, offering advice and encouragement. What would your future self want you to know?

**This helps process emotions and gain perspective.** Don't worry about perfect writing - just let your heart speak. I'm here with you through this wellness journey.

What feels right to start with? I'm here to support you.`,
    category: 'journaling',
    duration: '10-15 minutes'
  },
  
  meditation: {
    title: "🧘 Let's Find Your Peace",
    response: `I'm so glad you want to try meditation - it's such a beautiful practice for finding inner peace. Let's do this together, okay?

**Simple Meditation (Start Here):**
1. Find a comfortable seated position (you can even sit on your bed)
2. Close your eyes or soften your gaze
3. Focus on your natural breath (don't try to change it)
4. When thoughts arise (and they will!), gently return to your breath
5. Start with 5 minutes, and gradually increase

**Loving-Kindness Meditation (My Favorite):**
1. Sit comfortably and close your eyes
2. Repeat silently: "May I be happy, may I be healthy, may I be at peace"
3. Then extend to others: "May you be happy, may you be healthy, may you be at peace"

**This cultivates compassion and inner peace.** Don't worry if your mind wanders - that's totally normal. Just gently bring it back. I'm here with you through this wellness practice.

How does it feel? I'm here to support you.`,
    category: 'meditation',
    duration: '5-20 minutes'
  },
  
  movement: {
    title: "🏃 Let's Move Together",
    response: `I love that you want to try movement - it's such a powerful way to release tension and feel better. Let's do this together, okay?

**Progressive Muscle Relaxation (My Go-To):**
1. Start with your toes
2. Tense the muscles for 5 seconds (really feel it)
3. Release and feel the relaxation (notice the difference)
4. Move up your body systematically

**Gentle Stretching (When You Need Extra Care):**
• Shoulder rolls (forward and back, feel the release)
• Neck stretches (side to side, be gentle)
• Arm circles (feel the movement)
• Hip circles (let your body guide you)
• Ankle rotations (notice the sensation)

**Walking Meditation (My Favorite):**
Walk slowly, focusing on each step and your surroundings. Feel your feet on the ground, the air on your skin, the sounds around you.

**Movement helps release tension and enhance your emotional wellness.** Don't push yourself - just move in a way that feels good to you. I'm right here with you through this.

How does it feel? I'm here to support you.`,
    category: 'movement',
    duration: '10-15 minutes'
  }
};

export function detectExerciseRequest(message) {
  const messageLower = message.toLowerCase();
  
  // Check for exercise-related keywords
  const hasExerciseKeyword = EXERCISE_KEYWORDS.some(keyword => 
    messageLower.includes(keyword)
  );
  
  if (!hasExerciseKeyword) {
    return { detected: false };
  }
  
  // Determine specific exercise type
  if (messageLower.includes('breath') || messageLower.includes('inhale') || messageLower.includes('exhale')) {
    return {
      detected: true,
      type: 'breathing',
      response: EXERCISE_RESPONSES.breathing
    };
  }
  
  if (messageLower.includes('ground') || messageLower.includes('present') || messageLower.includes('here')) {
    return {
      detected: true,
      type: 'grounding',
      response: EXERCISE_RESPONSES.grounding
    };
  }
  
  if (messageLower.includes('journal') || messageLower.includes('write') || messageLower.includes('gratitude')) {
    return {
      detected: true,
      type: 'journaling',
      response: EXERCISE_RESPONSES.journaling
    };
  }
  
  if (messageLower.includes('meditation') || messageLower.includes('mindful') || messageLower.includes('loving')) {
    return {
      detected: true,
      type: 'meditation',
      response: EXERCISE_RESPONSES.meditation
    };
  }
  
  if (messageLower.includes('move') || messageLower.includes('stretch') || messageLower.includes('relax')) {
    return {
      detected: true,
      type: 'movement',
      response: EXERCISE_RESPONSES.movement
    };
  }
  
  // Default to breathing exercise
  return {
    detected: true,
    type: 'breathing',
    response: EXERCISE_RESPONSES.breathing
  };
}

export function getExerciseResponse(exerciseType) {
  return EXERCISE_RESPONSES[exerciseType] || EXERCISE_RESPONSES.breathing;
}

export function getAllExercises() {
  return Object.values(EXERCISE_RESPONSES);
} 