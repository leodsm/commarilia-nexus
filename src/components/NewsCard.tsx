import React from 'react';
import { Clock } from 'lucide-react';

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: {
    name: string;
    slug: string;
  };
  publishedAt: string;
  onClick: () => void;
}

const getCategoryBadgeClass = (slug: string): string => {
  const categoryMap: { [key: string]: string } = {
    'destaque': 'cm-badge-destaque',
    'marilia': 'cm-badge-marilia',
    'regiao': 'cm-badge-regiao',
    'brasil': 'cm-badge-brasil',
    'mundo': 'cm-badge-mundo',
    'esportes': 'cm-badge-esportes',
    'entretenimento': 'cm-badge-entretenimento',
  };
  
  return categoryMap[slug] || 'cm-badge-marilia';
};

export const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  excerpt,
  image,
  category,
  publishedAt,
  onClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <article className="cm-card cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4 p-4">
        <img
          src={image}
          alt={title}
          className="cm-card-image"
          loading="lazy"
        />
        
        <div className="flex-1 min-w-0">
          <div className={`cm-badge ${getCategoryBadgeClass(category.slug)} mb-2`}>
            {category.name}
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {excerpt}
          </p>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{formatDate(publishedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
};