import { db } from '@/app/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { HfInference } from '@huggingface/inference';
import { CohereClient } from 'cohere-ai';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const cohere = new CohereClient({ 
  token: process.env.COHERE_API_KEY || '' 
});

// Let's use a simpler set of models that are more likely to work
const MODELS = [
  'google/flan-t5-large',     // Most reliable
  'google/flan-t5-base',      // Backup option
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, provider } = body;

    console.log('Request received:', { message, provider });

    let response;
    let aiResponse;

    if (provider === 'huggingface') {
      const enhancedPrompt = `
        Question: ${message}
        
        Please provide a helpful and friendly response.
      `.trim();

      let success = false;
      let lastError = null;

      for (const model of MODELS) {
        try {
          console.log(`Attempting to use model: ${model}`);
          
          response = await hf.textGeneration({
            model: model,
            inputs: enhancedPrompt,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              top_p: 0.95,
            }
          });
          
          aiResponse = response.generated_text;
          success = true;
          console.log(`Successfully used model: ${model}`);
          break;
        } catch (error) {
          console.error(`Error with model ${model}:`, error);
          lastError = error;
        }
      }

      if (!success) {
        throw lastError || new Error('All models failed');
      }

    } else if (provider === 'cohere') {
      try {
        response = await cohere.generate({
          prompt: message,
          maxTokens: 500,
          temperature: 0.8,
          model: 'command',
        });
        aiResponse = response.generations[0].text.trim();
      } catch (error) {
        console.error('Cohere API error:', error);
        throw error;
      }
    }

    // Only try to store in Firebase if we have a response
    if (aiResponse) {
      try {
        await addDoc(collection(db, 'conversations'), {
          userMessage: message,
          aiResponse: aiResponse,
          provider: provider,
          timestamp: new Date(),
        });
      } catch (storageError) {
        // Log but don't throw Firebase errors
        console.error('Firebase storage error:', storageError);
      }
    }

    if (!aiResponse) {
      throw new Error('No response generated');
    }

    return NextResponse.json({ 
      message: aiResponse 
    });

  } catch (error: any) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: error.status,
      response: error.response?.data,  // For axios errors
    });

    // More specific error message
    const errorMessage = error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred';

    return NextResponse.json(
      { message: `Error: ${errorMessage}` },
      { status: error.status || 500 }
    );
  }
} 