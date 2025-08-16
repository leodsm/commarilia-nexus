import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorySlide {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
}

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StorySlide[];
  initialIndex?: number;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  stories,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Auto advance to next story
          setCurrentIndex((current) => {
            if (current >= stories.length - 1) {
              onClose();
              return current;
            }
            return current + 1;
          });
          return 0;
        }
        return prev + 2; // 5 seconds per story (100 / 50 = 2% per 100ms)
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, stories.length, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleTouchArea = (area: 'left' | 'right') => {
    if (area === 'left') {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  if (!isOpen || !stories.length) return null;

  const currentStory = stories[currentIndex];

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div 
        className="fixed inset-4 max-w-md mx-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-sm h-[80vh] bg-black rounded-2xl overflow-hidden">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{
                    width: index < currentIndex ? '100%' : 
                           index === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 rounded-full p-2"
            aria-label="Fechar story"
          >
            <X size={20} />
          </Button>

          {/* Story content */}
          <div className="relative w-full h-full">
            <img
              src={currentStory.image}
              alt={currentStory.title}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Text content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="text-sm opacity-90 mb-2">{currentStory.category}</div>
              <h2 className="text-xl font-bold mb-3 leading-tight">{currentStory.title}</h2>
              <p className="text-sm opacity-90 leading-relaxed">{currentStory.excerpt}</p>
            </div>
          </div>

          {/* Touch areas */}
          <div className="absolute inset-0 flex">
            <button
              className="flex-1 h-full bg-transparent"
              onClick={() => handleTouchArea('left')}
              aria-label="Story anterior"
            />
            <button
              className="flex-1 h-full bg-transparent"
              onClick={() => handleTouchArea('right')}
              aria-label="Próximo story"
            />
          </div>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2"
              aria-label="Story anterior"
            >
              <ChevronLeft size={20} />
            </Button>
          )}
          
          {currentIndex < stories.length - 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2"
              aria-label="Próximo story"
            >
              <ChevronRight size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};