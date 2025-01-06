"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';

interface TrainingData {
  id: string;
  userMessage: string;
  aiResponse: string;
  provider: string;
  timestamp: Date;
}

const TrainingInterface = () => {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const { loading, execute } = useApi();
  const { showToast } = useToast();

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      await execute(
        getDocs(collection(db, 'training')).then(snapshot => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          })) as TrainingData[];
          setTrainingData(data);
        }),
        {
          onSuccess: () => {
            showToast('Training data loaded successfully', 'success');
          },
        }
      );
    } catch (error) {
      showToast('Failed to load training data', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Training Data</h1>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-4">
          {trainingData.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingInterface; 