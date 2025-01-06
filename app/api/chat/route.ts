import { db } from '@/app/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Let's use a simpler set of models that are more likely to work
const MODELS = [
  'google/flan-t5-large',     // Most reliable
  'google/flan-t5-base',      // Backup option
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, provider, userId } = body;

    console.log('Request received:', { message, provider, userId });

    let response;
    let aiResponse;

    if (provider === 'huggingface') {
      try {
        response = await hf.textGeneration({
          model: MODELS[0],
          inputs: message,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
          },
        });
        aiResponse = response.generated_text.trim();
      } catch (error) {
        console.error('Hugging Face API error:', error);
        throw error;
      }
    }

    // Only try to store in Firebase if we have a response
    if (aiResponse && userId) {
      try {
        console.log('Storing conversation for user:', userId);
        const docRef = await addDoc(collection(db, 'conversations'), {
          userMessage: message,
          aiResponse: aiResponse,
          provider: provider,
          timestamp: new Date(),
          userId: userId,
        });
        console.log('Stored with document ID:', docRef.id);
      } catch (storageError) {
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