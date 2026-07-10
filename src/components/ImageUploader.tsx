import React, { useRef } from 'react';

interface ImageUploaderProps {
  /** Callback with the Base64 string of the selected image */
  onUpload: (base64: string) => void;
  /** Maximum file size in megabytes (default 10 MB) */
  maxSizeMB?: number;
}

/**
 * Simple image uploader component.
 * - Accepts image files via click or drag‑and‑drop.
 * - Validates MIME type and file size.
 * - Reads the file as a Base64 data URL and passes it to the parent.
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, maxSizeMB = 10 }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPG, PNG, or WebP image.');
      return;
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`Image must be smaller than ${maxSizeMB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset value to allow re‑uploading same file if needed
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerClick = () => inputRef.current?.click();

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        border: '2px dashed var(--border)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        background: 'var(--background)',
      }}
      onClick={triggerClick}
    >
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>
        Drag & drop an image here, or click to select
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onChange}
      />
    </div>
  );
};
