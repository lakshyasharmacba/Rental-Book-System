import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';

export const PhotoUpload = ({ photos = [], onChange, maxPhotos = 10, minPhotos = 1 }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [photos, maxPhotos, onChange]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const newPhotos = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
    
    const combined = [...photos, ...newPhotos].slice(0, maxPhotos);
    onChange(combined);
  };

  const removePhoto = (index) => {
    const newPhotos = [...photos];
    // Revoke object URL to avoid memory leak if it's a file
    if (newPhotos[index].preview) {
      URL.revokeObjectURL(newPhotos[index].preview);
    }
    newPhotos.splice(index, 1);
    onChange(newPhotos);
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-card p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-surface-alt hover:bg-gray-50'
        } ${photos.length >= maxPhotos ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-10 h-10 text-text-muted mx-auto mb-4" />
        <p className="text-text-main font-medium mb-1">Drag & drop your photos here</p>
        <p className="text-text-muted text-sm mb-4">or click to browse</p>
        
        <label className="btn btn-secondary cursor-pointer">
          Select Photos
          <input 
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileInput}
            disabled={photos.length >= maxPhotos}
          />
        </label>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm text-text-muted">
        <span>Minimum {minPhotos} photos required</span>
        <span>{photos.length} / {maxPhotos} uploaded</span>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {photos.map((photo, index) => (
            <div key={photo.preview || photo.id || index} className="relative aspect-square rounded-card overflow-hidden bg-gray-100 border border-border group">
              <img 
                src={photo.preview || photo.url} 
                alt="Upload preview" 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-danger text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center font-medium">
                  Cover Photo
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
