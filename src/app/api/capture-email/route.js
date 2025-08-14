import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, tag, source } = await request.json();

        console.log('Capturing email for marketing:', { email, tag, source });

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json({
                success: false,
                error: 'Valid email is required'
            }, { status: 400 });
        }

        // Validate tag
        const validTags = ['trial_declined', 'trial_converted', 'newsletter_signup', 'beta_user'];
        if (!validTags.includes(tag)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid tag provided'
            }, { status: 400 });
        }

        // Here you would typically save to your database
        // For now, we'll log it and return success
        const marketingData = {
            email: email,
            tag: tag,
            source: source || 'trial_popup',
            timestamp: new Date().toISOString(),
            status: 'active'
        };

        console.log('Marketing data captured:', marketingData);

        // In a real application, you would save this to your database
        // Example: await saveToDatabase(marketingData);

        return NextResponse.json({
            success: true,
            message: 'Email captured successfully',
            data: {
                email: email,
                tag: tag,
                timestamp: marketingData.timestamp
            }
        });

    } catch (error) {
        console.error('Email capture error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to capture email'
        }, { status: 500 });
    }
} 