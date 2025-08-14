import { NextResponse } from 'next/server';

// User database mapping user IDs to display names
interface User {
  id: string;
  displayName: string;
  avatar: string;
  joinDate: string;
}

const userDatabase: Record<string, User> = {
  'user_12345': {
    id: 'user_12345',
    displayName: 'Alex Johnson',
    avatar: '👤',
    joinDate: '2024-01-15'
  },
  'user_67890': {
    id: 'user_67890',
    displayName: 'Sarah Chen',
    avatar: '👤',
    joinDate: '2024-02-20'
  },
  'user_11111': {
    id: 'user_11111',
    displayName: 'Michael Rodriguez',
    avatar: '👤',
    joinDate: '2024-01-08'
  },
  'user_22222': {
    id: 'user_22222',
    displayName: 'Emily Davis',
    avatar: '👤',
    joinDate: '2024-03-10'
  },
  'user_33333': {
    id: 'user_33333',
    displayName: 'David Kim',
    avatar: '👤',
    joinDate: '2024-02-05'
  }
};

export async function GET(
  request: Request,
  { params }: { params: { 'user-id': string } }
) {
  try {
    const userId = params['user-id'];
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = userDatabase[userId];
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
