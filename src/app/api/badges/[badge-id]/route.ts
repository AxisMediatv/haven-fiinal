import { NextResponse } from 'next/server';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
}

const badgeDatabase: Record<string, Badge> = {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ 'badge-id': string }> }
) {
  const { 'badge-id': badgeId } = await params;
  try {
    
    if (!badgeId) {
      return NextResponse.json(
        { error: 'Badge ID is required' },
        { status: 400 }
      );
    }

    const badge = badgeDatabase[badgeId];
    
    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Badge API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
