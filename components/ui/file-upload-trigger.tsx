"use client"

import React, { useRef, useCallback } from 'react';

interface FileUploadTriggerProps {
  onFilesSelect: (files: File[]) => void;
  trigger: React.ReactElement;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function FileUploadTrigger({
  onFilesSelect,
  trigger,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ["image/*", "application/pdf", "text/*"],
}: FileUploadTriggerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Here you could add validation for maxSize, maxFiles, acceptedTypes
      onFilesSelect(selectedFiles);
    }
    // Reset the input value to allow selecting the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, [onFilesSelect]);

  return (
    <div onClick={handleTriggerClick} className="inline-block cursor-pointer">
      {trigger}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept={acceptedTypes.join(",")}
      />
    </div>
  );
} 
 