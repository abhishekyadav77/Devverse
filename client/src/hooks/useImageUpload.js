import { useCallback, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { uploadImage } from '../services/uploadService.js';
import { validateImageFile } from '../utils/image.js';

// upload(file, purpose) resolves to the upload result, or null after showing an error toast.
export function useImageUpload() {
  const toast = useToast();
  const [pending, setPending] = useState(0); // several images can upload at once (e.g. multi-paste)
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file, purpose) => {
      const problem = validateImageFile(file);
      if (problem) {
        toast.error(problem);
        return null;
      }
      setPending((n) => n + 1);
      setProgress(0);
      try {
        return await uploadImage(file, purpose, setProgress);
      } catch (err) {
        toast.error(err.message);
        return null;
      } finally {
        setPending((n) => n - 1);
      }
    },
    [toast]
  );

  return { upload, uploading: pending > 0, progress };
}