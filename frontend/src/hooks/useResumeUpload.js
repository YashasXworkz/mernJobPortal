import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const useResumeUpload = () => {
  const [uploading, setUploading] = useState(false);

  const validateAndUploadResume = async (file) => {
    if (!file) return null;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document.');
      return null;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Resume must be 8MB or smaller.');
      return null;
    }

    if (file.name.length > 100) {
      toast.error('Filename is too long. Please use a shorter filename.');
      return null;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await api.post('/api/upload/document', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Resume uploaded successfully');
      return {
        url: response.data.url,
        filename: response.data.filename || file.name
      };
    } catch (uploadErr) {
      toast.error(uploadErr.response?.data?.error || 'Failed to upload resume.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    validateAndUploadResume
  };
};
