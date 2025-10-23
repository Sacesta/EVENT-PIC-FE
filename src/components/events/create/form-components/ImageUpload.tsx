import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  label?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = React.memo(({
  label,
  value,
  onChange,
  error,
  required = false
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Generate preview when file changes
  React.useEffect(() => {
    if (value) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onChange(file);
      }
    }
  }, [onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onChange(files[0]);
    }
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange(null);
    setPreview(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
            transition-all duration-200 hover:border-primary/50 hover:bg-accent/5
            ${isDragging ? 'border-primary bg-accent/10' : 'border-border'}
            ${error ? 'border-red-500' : ''}
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-2">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isDragging ? 'bg-primary/20' : 'bg-[#02195f] dark:bg-[#2eafff]'}
            `}>
              <Upload className={`w-5 h-5 ${isDragging ? 'text-primary' : 'text-white'}`} />
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                {t('createEvent.step2.uploadImage')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('createEvent.step2.dragDropOrClick')}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="w-3 h-3" />
              <span>{t('createEvent.step2.supportedFormats')}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border-2 border-border">
          <img
            src={preview}
            alt="Event preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              {t('createEvent.step2.removeImage')}
            </Button>
          </div>
          {value && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-3 py-2 text-xs">
              <p className="truncate">{value.name}</p>
              <p className="text-white/70">{(value.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
