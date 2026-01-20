import React, { useRef, useState } from 'react';
import { validateImageFile } from '@/utils/validation';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  error?: string;
  previewUrl?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = '이미지 업로드',
  accept = 'image/*',
  onChange,
  error,
  previewUrl,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onChange?.(null);
      setLocalPreviewUrl(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    onChange?.(file);
  };

  const displayUrl = previewUrl || localPreviewUrl;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {displayUrl && (
          <img
            src={displayUrl}
            alt="미리보기"
            className="w-24 h-24 object-cover rounded-md border border-gray-300"
          />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
