import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { mood, qualities, timestamp } = await request.json();

        console.log('Saving onboarding preferences:', { mood, qualities, timestamp });

        // Validate mood selection
        const validMoods = [
            'motherly', 'fatherly', 'faith-centered', 'best-friend', 
            'wise-mentor', 'solution-coach', 'calm-centering', 
            'balanced-mix'
        ];

        if (!validMoods.includes(mood)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid mood selection'
            }, { status: 400 });
        }

        // Validate qualities
        const validQualities = [
            'non-judgmental', 'tough-love', 'empathetic', 
            'faith-centered', 'problem-solver', 'encourager'
        ];

        const validSelectedQualities = qualities.filter(quality => 
            validQualities.includes(quality)
        );

        // Create user profile data
        const userProfile = {
            mood: mood,
            qualities: validSelectedQualities,
            onboardingCompleted: true,
            onboardingTimestamp: timestamp,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Here you would typically save to your database
        // For now, we'll log it and return success
        console.log('User profile created:', userProfile);

        // In a real application, you would save this to your database
        // Example: await saveUserProfile(userProfile);

        return NextResponse.json({
            success: true,
            message: 'Onboarding preferences saved successfully',
            data: {
                mood: mood,
                qualities: validSelectedQualities,
                onboardingCompleted: true
            }
        });

    } catch (error) {
        console.error('Save onboarding error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to save onboarding preferences'
        }, { status: 500 });
    }
} 