import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onResultClick
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate search API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: `Resultado para "${searchQuery}" - Primeira notícia`,
          excerpt: 'Esta é uma descrição do primeiro resultado de busca...',
          category: 'Marília',
          publishedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: `Resultado para "${searchQuery}" - Segunda notícia`,
          excerpt: 'Esta é uma descrição do segundo resultado de busca...',
          category: 'Região',
          publishedAt: new Date().toISOString()
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div 
        className="fixed inset-x-4 top-20 bottom-20 cm-modal max-w-2xl mx-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cm-modal-header">
          <div className="flex items-center gap-3 flex-1">
            <Search size={20} className="text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar notícias..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent text-lg focus:ring-0"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="cm-modal-close"
            aria-label="Fechar busca"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="w-full text-left p-4 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => {
                    onResultClick(result);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                        {result.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {result.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="cm-badge cm-badge-marilia">{result.category}</span>
                        <span>•</span>
                        <span>{new Date(result.publishedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() && !isLoading ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-muted-foreground">
                Tente buscar com termos diferentes
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Buscar notícias
              </h3>
              <p className="text-muted-foreground">
                Digite algo para começar a busca
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};