const OpenAI = require('openai');
const fs = require('fs');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function createAssistant() {
  try {
    console.log('🤖 Creating OpenAI Assistant...');
    
    // Create the assistant
    const assistant = await openai.beta.assistants.create({
      name: "Haven Emotional Support Assistant",
      instructions: `You are Haven, a caring emotional intelligence support friend. Your role is to:

1. Provide empathetic, supportive responses to users experiencing emotional distress
2. Offer practical coping strategies and breathing exercises when appropriate
3. Maintain a warm, caring tone that feels like talking to a close friend
4. Use the knowledge base to provide accurate information about mental health topics
5. Recognize crisis situations and provide appropriate resources
6. Encourage self-compassion and self-care practices

Key principles:
- Always prioritize user safety in crisis situations
- Be supportive without being clinical or therapeutic
- Use warm, personal language
- Provide practical, actionable advice when appropriate
- Maintain confidentiality and trust`,
      model: "gpt-4o-mini",
      tools: [{"type": "retrieval"}],
    });
    
    console.log('✅ Assistant created successfully!');
    console.log('Assistant ID:', assistant.id);
    console.log('\n📝 Add this to your .env file:');
    console.log(`OPENAI_ASSISTANT_ID=${assistant.id}`);
    
    return assistant.id;
    
  } catch (error) {
    console.error('❌ Error creating assistant:', error);
    throw error;
  }
}

async function uploadKnowledgeBase(assistantId) {
  try {
    console.log('📚 Uploading knowledge base to assistant...');
    
    // Create a file with your knowledge base content
    const knowledgeContent = `# Haven Knowledge Base

## Breathing Exercises
### 4-4-6 Breathing
Inhale for 4 counts, hold for 4 counts, exhale for 6 counts. Repeat 5-10 times.

### Box Breathing
Inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat 5-10 times.

### Triangle Breathing
Inhale for 3, hold for 3, exhale for 3. Repeat 5-10 times.

## Crisis Resources
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency: 911

## Self-Care Practices
- Practice self-compassion
- Take breaks when needed
- Stay hydrated
- Get adequate sleep
- Engage in activities that bring joy

## Coping Strategies
- Deep breathing exercises
- Progressive muscle relaxation
- Mindfulness meditation
- Journaling
- Talking to trusted friends or family

## Haven Philosophy
- Everyone deserves support and understanding
- It's okay to not be okay
- Small steps forward are still progress
- You are not alone in your struggles
- Self-care is not selfish`;

    // Write to temporary file
    fs.writeFileSync('haven-knowledge-base.txt', knowledgeContent);
    
    // Upload file to OpenAI
    const file = await openai.files.create({
      file: fs.createReadStream('haven-knowledge-base.txt'),
      purpose: 'assistants',
    });
    
    // Attach file to assistant
    await openai.beta.assistants.update(assistantId, {
      file_ids: [file.id],
    });
    
    // Clean up
    fs.unlinkSync('haven-knowledge-base.txt');
    
    console.log('✅ Knowledge base uploaded successfully!');
    console.log('File ID:', file.id);
    
  } catch (error) {
    console.error('❌ Error uploading knowledge base:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Setting up Haven OpenAI Assistant...\n');
    
    // Create assistant
    const assistantId = await createAssistant();
    
    // Upload knowledge base
    await uploadKnowledgeBase(assistantId);
    
    console.log('\n🎉 Setup complete! Your Haven Assistant is ready.');
    console.log('\nNext steps:');
    console.log('1. Add OPENAI_ASSISTANT_ID to your .env file');
    console.log('2. Restart your application');
    console.log('3. Test the new assistant functionality');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = { createAssistant, uploadKnowledgeBase }; 