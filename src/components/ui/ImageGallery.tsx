import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { ImageIcon } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onDelete?: (imageUrl: string) => void;
  canDelete?: boolean;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onDelete,
  canDelete = false,
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Изображения не загружены</p>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(imageUrl);
    }
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Главное изображение */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
          <img
            src={images[selectedIndex]}
            alt={`Изображение ${selectedIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDelete(images[selectedIndex], e)}
              className="absolute top-2 right-2 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Миниатюры */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer group ${
                  index === selectedIndex ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={image}
                  alt={`Миниатюра ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(image, e)}
                    className="absolute top-1 right-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно для полноэкранного просмотра */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
            <img
              src={images[selectedIndex]}
              alt={`Полный размер ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-black/50 text-white"
            >
              <X className="w-6 h-6" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};