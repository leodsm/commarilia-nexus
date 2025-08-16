import React, { useState, useEffect } from 'react';
import { ComMariliaHeader } from '@/components/ComMariliaHeader';
import { StoriesCarousel } from '@/components/StoriesCarousel';
import { NewsCard } from '@/components/NewsCard';
import { NewsModal } from '@/components/NewsModal';
import { StoryModal } from '@/components/StoryModal';
import { SearchModal } from '@/components/SearchModal';
import { FloatingActions } from '@/components/FloatingActions';
import { useToast } from '@/hooks/use-toast';

// Mock data interfaces
interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: {
    name: string;
    slug: string;
  };
  publishedAt: string;
}

interface Story {
  id: string;
  title: string;
  image: string;
  category: string;
  url: string;
}

// Mock data
const mockStories: Story[] = [
  {
    id: '1',
    title: 'Destaque do Dia',
    image: '/placeholder.svg',
    category: 'Destaque',
    url: '#'
  },
  {
    id: '2',
    title: 'Marília Hoje',
    image: '/placeholder.svg',
    category: 'Marília',
    url: '#'
  },
  {
    id: '3',
    title: 'Região',
    image: '/placeholder.svg',
    category: 'Região',
    url: '#'
  },
  {
    id: '4',
    title: 'Brasil',
    image: '/placeholder.svg',
    category: 'Brasil',
    url: '#'
  },
  {
    id: '5',
    title: 'Esportes',
    image: '/placeholder.svg',
    category: 'Esportes',
    url: '#'
  }
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Nova praça será inaugurada no centro de Marília com investimento de R$ 2 milhões',
    content: '<p>A Prefeitura de Marília anunciou hoje a inauguração de uma nova praça no centro da cidade, com um investimento total de R$ 2 milhões. A obra faz parte do projeto de revitalização urbana...</p>',
    excerpt: 'Obra faz parte do projeto de revitalização urbana e conta com playground, academia ao ar livre e área verde.',
    image: '/placeholder.svg',
    category: { name: 'Marília', slug: 'marilia' },
    publishedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Campeonato Regional de Futebol tem início neste fim de semana',
    content: '<p>O Campeonato Regional de Futebol da Alta Paulista tem início neste fim de semana com a participação de 16 equipes...</p>',
    excerpt: 'Torneio contará com 16 equipes da região e premiação de R$ 50 mil para o campeão.',
    image: '/placeholder.svg',
    category: { name: 'Esportes', slug: 'esportes' },
    publishedAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Festival de Inverno movimenta economia local com mais de 10 mil visitantes',
    content: '<p>O Festival de Inverno de Marília superou as expectativas e recebeu mais de 10 mil visitantes durante os três dias de evento...</p>',
    excerpt: 'Evento gastronômico e cultural movimentou R$ 1,5 milhão na economia local.',
    image: '/placeholder.svg',
    category: { name: 'Entretenimento', slug: 'entretenimento' },
    publishedAt: new Date().toISOString()
  }
];

const Index = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const { toast } = useToast();

  const handleArticleClick = (article: Article) => {
    const index = articles.findIndex(a => a.id === article.id);
    setCurrentArticleIndex(index);
    setSelectedArticle(article);
    setIsNewsModalOpen(true);
  };

  const handleStoryClick = (story: Story) => {
    // Convert stories to story slides for the modal
    const storySlides = mockStories.map(s => ({
      id: s.id,
      title: s.title,
      excerpt: `Story da categoria ${s.category}`,
      image: s.image,
      category: s.category
    }));
    
    setIsStoryModalOpen(true);
  };

  const handleNextArticle = () => {
    if (currentArticleIndex < articles.length - 1) {
      const nextIndex = currentArticleIndex + 1;
      setCurrentArticleIndex(nextIndex);
      setSelectedArticle(articles[nextIndex]);
    }
  };

  const handlePreviousArticle = () => {
    if (currentArticleIndex > 0) {
      const prevIndex = currentArticleIndex - 1;
      setCurrentArticleIndex(prevIndex);
      setSelectedArticle(articles[prevIndex]);
    }
  };

  const handleNotificationClick = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        toast({
          title: "Notificações ativadas",
          description: "Você receberá alertas das principais notícias",
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast({
              title: "Notificações ativadas",
              description: "Você receberá alertas das principais notícias",
            });
          }
        });
      }
    }
  };

  const handleSubscribeClick = () => {
    toast({
      title: "Newsletter",
      description: "Em breve: assine nossa newsletter para receber as principais notícias",
    });
  };

  const handleSearchResultClick = (result: any) => {
    // Convert search result to article format and open modal
    const article: Article = {
      id: result.id,
      title: result.title,
      content: `<p>${result.excerpt}</p>`,
      excerpt: result.excerpt,
      image: '/placeholder.svg',
      category: { name: result.category, slug: result.category.toLowerCase() },
      publishedAt: result.publishedAt
    };
    
    setSelectedArticle(article);
    setIsNewsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto bg-card shadow-lg min-h-screen relative">
        <ComMariliaHeader
          onSearchClick={() => setIsSearchModalOpen(true)}
          onSettingsClick={() => toast({ title: "Configurações", description: "Em breve" })}
          onMenuClick={() => toast({ title: "Menu", description: "Em breve" })}
        />

        <StoriesCarousel 
          stories={mockStories}
          onStoryClick={handleStoryClick}
        />

        <main className="p-4 space-y-4 pb-32">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Últimas Notícias
          </h1>
          
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              id={article.id}
              title={article.title}
              excerpt={article.excerpt}
              image={article.image}
              category={article.category}
              publishedAt={article.publishedAt}
              onClick={() => handleArticleClick(article)}
            />
          ))}

          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Carregando mais notícias...
            </p>
          </div>
        </main>

        <FloatingActions
          onNotificationClick={handleNotificationClick}
          onSubscribeClick={handleSubscribeClick}
        />

        <NewsModal
          isOpen={isNewsModalOpen}
          onClose={() => setIsNewsModalOpen(false)}
          article={selectedArticle}
          onNext={handleNextArticle}
          onPrevious={handlePreviousArticle}
          hasNext={currentArticleIndex < articles.length - 1}
          hasPrevious={currentArticleIndex > 0}
        />

        <StoryModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          stories={mockStories.map(s => ({
            id: s.id,
            title: s.title,
            excerpt: `Story da categoria ${s.category}`,
            image: s.image,
            category: s.category
          }))}
        />

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          onResultClick={handleSearchResultClick}
        />

        <footer className="p-4 border-t text-center text-xs text-muted-foreground bg-card">
          © {new Date().getFullYear()} ComMarília. Tema melhorado para WordPress.
        </footer>
      </div>
    </div>
  );
};

export default Index;