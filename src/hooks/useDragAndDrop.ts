import { useState, useCallback, DragEvent } from "react";

interface UseDragAndDropOptions {
  onFileDrop: (file: File) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
}

export const useDragAndDrop = ({
  onFileDrop,
  acceptedTypes,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
}: UseDragAndDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragError(null);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we're leaving the drop zone entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragError(null);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      // Check file size
      if (file.size > maxFileSize) {
        setDragError(`File too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        return;
      }

      // Check file type if acceptedTypes is provided
      if (acceptedTypes && acceptedTypes.length > 0) {
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });

        if (!isAccepted) {
          setDragError("File type not supported");
          return;
        }
      }

      onFileDrop(file);
    },
    [onFileDrop, acceptedTypes, maxFileSize]
  );

  const dragProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  return {
    isDragging,
    dragError,
    dragProps,
    clearError: () => setDragError(null),
  };
};
