<?php get_header(); ?>

<main class="cm-news-feed">
    <h1 class="cm-news-title"><?php _e('Últimas Notícias', 'commarilia'); ?></h1>
    
    <?php if (have_posts()) : ?>
        <?php while (have_posts()) : the_post(); ?>
            <?php
            $categories = get_the_category();
            $category = $categories ? $categories[0] : null;
            $badge_class = cm_get_category_badge_class($category);
            ?>
            
            <article class="cm-news-card" onclick="cmOpenNews(<?php the_ID(); ?>)" data-post-id="<?php the_ID(); ?>">
                <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 1rem;">
                    <?php if (has_post_thumbnail()) : ?>
                        <?php the_post_thumbnail('cm-card', ['class' => 'cm-news-image', 'alt' => get_the_title()]); ?>
                    <?php else: ?>
                        <img class="cm-news-image" src="<?php echo get_template_directory_uri(); ?>/assets/images/fallback.jpg" alt="<?php the_title_attribute(); ?>" />
                    <?php endif; ?>
                    
                    <div style="flex: 1; min-width: 0;">
                        <?php if ($category): ?>
                            <div class="<?php echo esc_attr($badge_class); ?>">
                                <?php echo esc_html($category->name); ?>
                            </div>
                        <?php endif; ?>
                        
                        <h2 class="cm-news-headline">
                            <?php echo esc_html(cm_trim_text(get_the_title(), 80)); ?>
                        </h2>
                        
                        <p class="cm-news-excerpt">
                            <?php echo esc_html(cm_trim_text(get_the_excerpt() ?: strip_tags(get_the_content()), 120)); ?>
                        </p>
                        
                        <div class="cm-news-meta">
                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            <span><?php echo cm_get_relative_time(get_the_date('Y-m-d H:i:s')); ?></span>
                        </div>
                    </div>
                </div>
            </article>
        <?php endwhile; ?>
    <?php else: ?>
        <p><?php _e('Nenhuma notícia encontrada.', 'commarilia'); ?></p>
    <?php endif; ?>
    
    <div id="cm-scroll-sentinel" style="height: 2rem;"></div>
</main>

<?php get_footer(); ?>