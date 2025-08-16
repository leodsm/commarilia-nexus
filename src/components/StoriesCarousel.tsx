import React from 'react';

interface Story {
  id: string;
  title: string;
  image: string;
  category: string;
  url: string;
}

interface StoriesCarouselProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
}

export const StoriesCarousel: React.FC<StoriesCarouselProps> = ({
  stories,
  onStoryClick
}) => {
  if (!stories.length) {
    return null;
  }

  return (
    <section className="cm-stories-container">
      <h2 className="text-lg font-bold mb-4 text-foreground">Stories</h2>
      <div className="cm-stories-grid">
        {stories.map((story) => (
          <button
            key={story.id}
            className="cm-story-item"
            onClick={() => onStoryClick(story)}
            aria-label={`Ver story: ${story.title}`}
          >
            <div className="cm-story-circle">
              <img
                src={story.image}
                alt={story.title}
                className="cm-story-image"
                loading="lazy"
              />
            </div>
            <span className="cm-story-label">{story.category}</span>
          </button>
        ))}
      </div>
    </section>
  );
};