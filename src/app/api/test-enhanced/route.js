import { NextResponse } from 'next/server';
import { detectCrisis } from '../../../lib/crisis-detector.js';
import { detectExerciseRequest } from '../../../lib/exercise-handler.js';
import { detectBusinessRequest } from '../../../lib/business-handler.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';
    const testMessage = searchParams.get('message') || '';
    
    let results = {};
    
    if (testType === 'all' || testType === 'crisis') {
      // Test crisis detection
      const crisisTests = [
        'I feel suicidal and want to end it all',
        'I am so depressed and hopeless',
        'I am feeling sad and overwhelmed'
      ];
      
      results.crisis = crisisTests.map(message => ({
        message,
        detection: detectCrisis(message)
      }));
    }
    
    if (testType === 'all' || testType === 'exercise') {
      // Test exercise detection
      const exerciseTests = [
        'I need a breathing exercise',
        'Can you give me a grounding technique?',
        'I want to try journaling',
        'Show me a meditation exercise'
      ];
      
      results.exercise = exerciseTests.map(message => ({
        message,
        detection: detectExerciseRequest(message)
      }));
    }
    
    if (testType === 'all' || testType === 'business') {
      // Test business detection
      const businessTests = [
        'What are your pricing plans?',
        'How do I schedule an appointment?',
        'What is your cancellation policy?',
        'What services do you offer?',
        'How can I contact you?'
      ];
      
      results.business = businessTests.map(message => ({
        message,
        detection: detectBusinessRequest(message)
      }));
    }
    
    if (testMessage) {
      // Test specific message
      results.specific = {
        message: testMessage,
        crisis: detectCrisis(testMessage),
        exercise: detectExerciseRequest(testMessage),
        business: detectBusinessRequest(testMessage)
      };
    }
    
    return NextResponse.json({
      success: true,
      testType,
      results,
      summary: {
        crisisDetected: results.crisis?.filter(r => r.detection.detected).length || 0,
        exerciseDetected: results.exercise?.filter(r => r.detection.detected).length || 0,
        businessDetected: results.business?.filter(r => r.detection.detected).length || 0
      }
    });
    
  } catch (error) {
    console.error('Enhanced test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 