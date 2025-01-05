"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import Link from 'next/link';

interface TrainingData {
  id: string;
  userMessage: string;
  aiResponse: string;
  provider: string;
  timestamp: Date;
}

const TrainingInterface = () => {
  const [conversations, setConversations] = useState<TrainingData[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customResponse, setCustomResponse] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      const querySnapshot = await getDocs(collection(db, 'conversations'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as TrainingData[];
      setConversations(data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())); // Sort by newest first
    };

    fetchConversations();
  }, []);

  const handleAddTrainingData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || !customResponse.trim()) return;

    try {
      await addDoc(collection(db, 'training_data'), {
        userMessage: customPrompt,
        aiResponse: customResponse,
        isTrainingData: true,
        timestamp: new Date()
      });

      setCustomPrompt('');
      setCustomResponse('');
      alert('Training data added successfully!');
    } catch (error) {
      console.error('Error adding training data:', error);
      alert('Error adding training data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Training Dashboard</h2>
      </div>
      
      {/* Add new training data */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Add Training Data</h3>
        <form onSubmit={handleAddTrainingData} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-700">Custom Prompt:</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-700">Expected Response:</label>
            <textarea
              value={customResponse}
              onChange={(e) => setCustomResponse(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Training Data
          </button>
        </form>
      </div>

      {/* View existing conversations in scrollable frame */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Existing Conversations</h3>
        <div className="h-[500px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              className="border border-gray-200 p-4 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {conv.timestamp.toLocaleString()}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {conv.provider}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-600">User:</p>
                  <p className="ml-4">{conv.userMessage}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">AI:</p>
                  <p className="ml-4">{conv.aiResponse}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingInterface; 