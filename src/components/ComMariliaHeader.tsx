import React from 'react';
import { Search, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComMariliaHeaderProps {
  onSearchClick: () => void;
  onSettingsClick: () => void;
  onMenuClick: () => void;
}

export const ComMariliaHeader: React.FC<ComMariliaHeaderProps> = ({
  onSearchClick,
  onSettingsClick,
  onMenuClick
}) => {
  return (
    <header className="cm-modal-header sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between w-full">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>
        
        <a href="/" className="cm-logo hover:opacity-90 transition-opacity">
          <span className="com">Com</span>
          <span className="marilia">Marília</span>
        </a>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="p-2 rounded-lg hover:bg-accent"
            aria-label="Buscar"
          >
            <Search size={18} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-accent"
            aria-label="Configurações"
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
};