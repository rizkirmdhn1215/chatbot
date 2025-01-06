import { useState } from 'react';
import { useToast } from '../context/ToastContext';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { showToast } = useToast();

  const execute = async (
    promise: Promise<T>,
    options: UseApiOptions<T> = {}
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await promise;
      options.onSuccess?.(data);
      return data;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('An error occurred');
      setError(error);
      options.onError?.(error);
      showToast(error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute
  };
} 