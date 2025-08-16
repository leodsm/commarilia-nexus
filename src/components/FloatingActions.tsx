import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionsProps {
  onNotificationClick: () => void;
  onSubscribeClick: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onNotificationClick,
  onSubscribeClick
}) => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCompact(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="cm-float-container">
      <Button
        onClick={onNotificationClick}
        className={`cm-float-btn ${isCompact ? 'compact' : ''}`}
        aria-label="Ativar notificações"
      >
        <Bell size={18} />
        <span className="label">Notificações</span>
      </Button>
      
      <Button
        onClick={onSubscribeClick}
        className={`cm-float-btn ${isCompact ? 'compact' : ''}`}
        aria-label="Assinar newsletter"
      >
        <MessageCircle size={18} />
        <span className="label">Assinar</span>
      </Button>
    </div>
  );
};