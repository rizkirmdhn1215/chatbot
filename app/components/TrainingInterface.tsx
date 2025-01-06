"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface TrainingData {
  id: string;
  userMessage: string;
  aiResponse: string;
  provider: string;
  timestamp: Date;
  userId?: string;
}

const TrainingInterface = () => {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [newUserMessage, setNewUserMessage] = useState('');
  const [newAIResponse, setNewAIResponse] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { loading, execute } = useApi();
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTrainingData();
    }
  }, [user]);

  const fetchTrainingData = async () => {
    try {
      console.log('Fetching data for user:', user?.uid);
      await execute(
        getDocs(
          query(
            collection(db, 'conversations'),
            where('userId', '==', user?.uid)
          )
        ).then(snapshot => {
          console.log('Snapshot size:', snapshot.size);
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          })) as TrainingData[];
          console.log('Fetched data:', data);
          setTrainingData(data.sort((a, b) => 
            b.timestamp.getTime() - a.timestamp.getTime()
          ));
        }),
        {
          onSuccess: () => {
            showToast('Training data loaded successfully', 'success');
          },
        }
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load training data', 'error');
    }
  };

  const handleAddTrainingData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUserMessage.trim() || !newAIResponse.trim()) return;

    setIsAdding(true);
    try {
      await addDoc(collection(db, 'conversations'), {
        userMessage: newUserMessage,
        aiResponse: newAIResponse,
        provider: 'manual',
        timestamp: new Date(),
        userId: user.uid,
      });

      setNewUserMessage('');
      setNewAIResponse('');
      showToast('Training data added successfully', 'success');
      fetchTrainingData(); // Refresh the list
    } catch (error) {
      showToast('Failed to add training data', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Training Data</h1>
      
      {/* Add Training Data Form */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Add New Training Data</h2>
        <form onSubmit={handleAddTrainingData} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Message
            </label>
            <textarea
              value={newUserMessage}
              onChange={(e) => setNewUserMessage(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Response
            </label>
            <textarea
              value={newAIResponse}
              onChange={(e) => setNewAIResponse(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isAdding ? <LoadingSpinner /> : 'Add Training Data'}
          </button>
        </form>
      </div>

      {/* Existing Training Data List */}
      {loading ? (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="h-[70vh] overflow-y-auto custom-scrollbar bg-white rounded-lg shadow">
          <div className="grid gap-4 p-4">
            {trainingData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No training data available
              </div>
            ) : (
              trainingData.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="mb-2">
                    <span className="font-semibold">User:</span> {item.userMessage}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">AI:</span> {item.aiResponse}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.timestamp?.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingInterface; 