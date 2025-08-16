import React, { useEffect, useRef } from 'react';
import { X, Heart, Share2, Bookmark, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id: string;
    title: string;
    content: string;
    image: string;
    category: {
      name: string;
      slug: string;
    };
    publishedAt: string;
  } | null;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const NewsModal: React.FC<NewsModalProps> = ({
  isOpen,
  onClose,
  article,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

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
      if (e.key === 'ArrowUp' && hasPrevious) onPrevious();
      if (e.key === 'ArrowDown' && hasNext) onNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious]);

  const handleLike = () => {
    // Implementar lógica de curtir
    console.log('Liked article:', article?.id);
  };

  const handleShare = async () => {
    if (!article) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.title,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const handleSave = () => {
    // Implementar lógica de salvar
    console.log('Saved article:', article?.id);
  };

  if (!isOpen || !article) return null;

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div 
        className="fixed inset-x-4 bottom-0 top-20 cm-modal max-w-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cm-modal-header">
          <h2 className="text-lg font-bold text-foreground truncate">
            {article.category.name}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="cm-modal-close"
            aria-label="Fechar"
          >
            <X size={18} />
          </Button>
        </div>

        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto cm-scrollbar-hide p-6"
        >
          <article className="cm-article">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {article.title}
            </h1>
            
            <div 
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>

        {/* Action buttons */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="cm-action-btn"
            aria-label="Curtir"
          >
            <Heart size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="cm-action-btn"
            aria-label="Compartilhar"
          >
            <Share2 size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="cm-action-btn"
            aria-label="Salvar"
          >
            <Bookmark size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="absolute left-4 bottom-20 flex flex-col gap-3">
          {hasPrevious && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              className="cm-action-btn"
              aria-label="Notícia anterior"
            >
              <ChevronUp size={20} />
            </Button>
          )}
          
          {hasNext && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNext}
              className="cm-action-btn"
              aria-label="Próxima notícia"
            >
              <ChevronDown size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};