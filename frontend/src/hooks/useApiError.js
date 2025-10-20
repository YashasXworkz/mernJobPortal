import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom hook for consistent API error handling
 * Extracts error message from API response and displays toast notification
 * 
 * @returns {Object} Object containing handleApiError function
 * 
 * @example
 * const { handleApiError } = useApiError();
 * 
 * try {
 *   await api.post('/api/jobs', data);
 * } catch (error) {
 *   handleApiError(error, 'Failed to create job');
 * }
 */
export const useApiError = () => {
  const handleApiError = useCallback((error, defaultMessage = 'An error occurred') => {
    const message = error.response?.data?.error || defaultMessage;
    toast.error(message);
  }, []);

  return { handleApiError };
};

export default useApiError;
