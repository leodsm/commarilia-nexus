<?php
/**
 * ComMarília Frontend Integrado v3.0 - Melhorado
 * Tema WordPress com design moderno e UX otimizada
 */

if (!defined('ABSPATH')) {
    exit;
}

// Theme setup
add_action('after_setup_theme', 'commarilia_theme_setup');
function commarilia_theme_setup() {
    // Theme supports
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', [
        'search-form', 'comment-list', 'comment-form', 'gallery', 'caption', 'style', 'script'
    ]);
    add_theme_support('customize-selective-refresh-widgets');
    add_theme_support('responsive-embeds');
    
    // Navigation menus
    register_nav_menus([
        'primary' => __('Menu Principal', 'commarilia'),
        'footer' => __('Menu Rodapé', 'commarilia')
    ]);
    
    // Custom image sizes
    add_image_size('cm-card', 384, 384, true);
    add_image_size('cm-story', 240, 240, true);
    add_image_size('cm-hero', 768, 432, true);
}

// Enqueue scripts and styles
add_action('wp_enqueue_scripts', 'commarilia_scripts');
function commarilia_scripts() {
    $theme_version = wp_get_theme()->get('Version');
    
    // Fonts
    wp_enqueue_style(
        'inter-font',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        [],
        null
    );
    
    // Main stylesheet
    wp_enqueue_style(
        'commarilia-style',
        get_stylesheet_uri(),
        ['inter-font'],
        $theme_version
    );
    
    // Main JavaScript
    wp_enqueue_script(
        'commarilia-app',
        get_template_directory_uri() . '/assets/js/app.js',
        [],
        $theme_version,
        true
    );
    
    // Localize script with data
    wp_localize_script('commarilia-app', 'cmData', [
        'siteUrl' => home_url('/'),
        'restUrl' => rest_url('wp/v2/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'themeDir' => get_template_directory_uri(),
        'isHttps' => is_ssl(),
        'isLogged' => is_user_logged_in(),
        'userId' => get_current_user_id(),
        'strings' => [
            'loading' => __('Carregando...', 'commarilia'),
            'error' => __('Erro ao carregar conteúdo', 'commarilia'),
            'noResults' => __('Nenhum resultado encontrado', 'commarilia'),
            'shareSuccess' => __('Link copiado!', 'commarilia'),
            'notificationEnabled' => __('Notificações ativadas', 'commarilia'),
        ]
    ]);
    
    // AMP Story Player (for web stories)
    if (post_type_exists('web-story')) {
        wp_enqueue_script(
            'amp-story-player',
            'https://cdn.ampproject.org/amp-story-player-v0.js',
            [],
            null,
            true
        );
        wp_enqueue_style(
            'amp-story-player',
            'https://cdn.ampproject.org/amp-story-player-v0.css',
            [],
            null
        );
    }
}

// Utility functions
function cm_trim_text($text, $length = 65) {
    $text = wp_strip_all_tags($text);
    if (mb_strlen($text) <= $length) {
        return $text;
    }
    return mb_substr($text, 0, $length - 1) . '…';
}

function cm_get_category_badge_class($category) {
    if (!$category) {
        return 'cm-news-badge';
    }
    
    $slug = sanitize_title($category->slug);
    $badge_map = [
        'destaque' => 'cm-news-badge cm-badge-destaque',
        'marilia' => 'cm-news-badge cm-badge-marilia',
        'regiao' => 'cm-news-badge cm-badge-regiao',
        'brasil' => 'cm-news-badge cm-badge-brasil',
        'mundo' => 'cm-news-badge cm-badge-mundo',
        'esportes' => 'cm-news-badge cm-badge-esportes',
        'esporte' => 'cm-news-badge cm-badge-esportes',
        'entretenimento' => 'cm-news-badge cm-badge-entretenimento',
    ];
    
    return $badge_map[$slug] ?? 'cm-news-badge cm-badge-marilia';
}

function cm_get_relative_time($date) {
    $time_diff = time() - strtotime($date);
    
    if ($time_diff < 60) {
        return __('Agora mesmo', 'commarilia');
    } elseif ($time_diff < 3600) {
        $minutes = floor($time_diff / 60);
        return sprintf(__('%d min atrás', 'commarilia'), $minutes);
    } elseif ($time_diff < 86400) {
        $hours = floor($time_diff / 3600);
        return sprintf(__('%dh atrás', 'commarilia'), $hours);
    } elseif ($time_diff < 604800) {
        $days = floor($time_diff / 86400);
        return sprintf(__('%d dia(s) atrás', 'commarilia'), $days);
    } else {
        return get_the_date('d/m/Y', $date);
    }
}

// Stories shortcode
add_shortcode('cm_stories', 'cm_render_stories');
function cm_render_stories($atts = []) {
    $atts = shortcode_atts([
        'categories' => 'Destaque,Marília,Região,Brasil,Mundo,Esportes,Entretenimento',
        'limit' => 8
    ], $atts);
    
    // Check if web stories exist
    if (!post_type_exists('web-story') || !taxonomy_exists('web_story_category')) {
        return '';
    }
    
    $categories = array_map('trim', explode(',', $atts['categories']));
    $yesterday = date('Y-m-d H:i:s', strtotime('-24 hours'));
    $stories = [];
    
    foreach ($categories as $category_name) {
        $term = get_term_by('name', $category_name, 'web_story_category');
        if (!$term) {
            $term = get_term_by('slug', sanitize_title($category_name), 'web_story_category');
        }
        
        if (!$term) continue;
        
        $query = new WP_Query([
            'post_type' => 'web-story',
            'posts_per_page' => 1,
            'post_status' => 'publish',
            'tax_query' => [[
                'taxonomy' => 'web_story_category',
                'field' => 'term_id',
                'terms' => $term->term_id
            ]],
            'date_query' => [[
                'after' => $yesterday
            ]],
            'orderby' => 'date',
            'order' => 'DESC'
        ]);
        
        if ($query->have_posts()) {
            $query->the_post();
            $thumbnail = get_the_post_thumbnail_url(get_the_ID(), 'cm-story');
            
            $stories[] = [
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'category' => $category_name,
                'url' => get_permalink(),
                'image' => $thumbnail ?: get_template_directory_uri() . '/assets/images/fallback-story.jpg'
            ];
        }
        wp_reset_postdata();
        
        if (count($stories) >= $atts['limit']) break;
    }
    
    if (empty($stories)) {
        return '';
    }
    
    ob_start();
    ?>
    <section class="cm-stories">
        <h2><?php _e('Stories', 'commarilia'); ?></h2>
        <div class="cm-stories-grid">
            <?php foreach ($stories as $story): ?>
                <button 
                    class="cm-story" 
                    onclick="cmOpenStory('<?php echo esc_js($story['url']); ?>', '<?php echo esc_js(sanitize_title($story['category'])); ?>')"
                    aria-label="<?php echo esc_attr(sprintf(__('Ver story: %s', 'commarilia'), $story['title'])); ?>"
                >
                    <div class="cm-story-circle">
                        <img 
                            src="<?php echo esc_url($story['image']); ?>" 
                            alt="<?php echo esc_attr($story['title']); ?>"
                            class="cm-story-image"
                            loading="lazy"
                        >
                    </div>
                    <span class="cm-story-label"><?php echo esc_html($story['category']); ?></span>
                </button>
            <?php endforeach; ?>
        </div>
    </section>
    <?php
    return ob_get_clean();
}

// Custom REST API endpoints
add_action('rest_api_init', 'cm_register_rest_routes');
function cm_register_rest_routes() {
    // Search endpoint
    register_rest_route('cm/v1', '/search', [
        'methods' => 'GET',
        'callback' => 'cm_rest_search',
        'permission_callback' => '__return_true',
        'args' => [
            'q' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'limit' => [
                'default' => 10,
                'type' => 'integer'
            ]
        ]
    ]);
    
    // Stories endpoint
    register_rest_route('cm/v1', '/stories', [
        'methods' => 'GET',
        'callback' => 'cm_rest_stories',
        'permission_callback' => '__return_true',
        'args' => [
            'category' => [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field'
            ]
        ]
    ]);
}

function cm_rest_search($request) {
    $query = $request->get_param('q');
    $limit = $request->get_param('limit');
    
    $search_query = new WP_Query([
        's' => $query,
        'posts_per_page' => $limit,
        'post_status' => 'publish'
    ]);
    
    $results = [];
    if ($search_query->have_posts()) {
        while ($search_query->have_posts()) {
            $search_query->the_post();
            $categories = get_the_category();
            $category = $categories ? $categories[0] : null;
            
            $results[] = [
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'excerpt' => cm_trim_text(get_the_excerpt() ?: get_the_content(), 120),
                'permalink' => get_permalink(),
                'featured_image' => get_the_post_thumbnail_url(get_the_ID(), 'cm-card'),
                'category' => $category ? [
                    'name' => $category->name,
                    'slug' => $category->slug
                ] : null,
                'date' => get_the_date('c'),
                'relative_time' => cm_get_relative_time(get_the_date('Y-m-d H:i:s'))
            ];
        }
    }
    wp_reset_postdata();
    
    return new WP_REST_Response($results, 200);
}

function cm_rest_stories($request) {
    $category = $request->get_param('category');
    
    if (!post_type_exists('web-story')) {
        return new WP_REST_Response([], 200);
    }
    
    $args = [
        'post_type' => 'web-story',
        'posts_per_page' => 10,
        'post_status' => 'publish',
        'date_query' => [[
            'after' => '24 hours ago'
        ]]
    ];
    
    if ($category && taxonomy_exists('web_story_category')) {
        $args['tax_query'] = [[
            'taxonomy' => 'web_story_category',
            'field' => 'slug',
            'terms' => sanitize_title($category)
        ]];
    }
    
    $query = new WP_Query($args);
    $stories = [];
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $categories = get_the_terms(get_the_ID(), 'web_story_category');
            $category = $categories && !is_wp_error($categories) ? $categories[0] : null;
            
            $stories[] = [
                'id' => get_the_ID(),
                'title' => get_the_title(),
                'excerpt' => cm_trim_text(get_the_excerpt() ?: get_the_content(), 100),
                'image' => get_the_post_thumbnail_url(get_the_ID(), 'cm-story'),
                'category' => $category ? $category->name : __('Geral', 'commarilia'),
                'url' => get_permalink()
            ];
        }
    }
    wp_reset_postdata();
    
    return new WP_REST_Response($stories, 200);
}

// Enhanced content filters
add_filter('the_content', 'cm_enhance_content');
function cm_enhance_content($content) {
    // Add lazy loading to images
    $content = preg_replace('/<img(?![^>]*loading=)/i', '<img loading="lazy"', $content);
    
    // Add responsive classes to images
    $content = preg_replace(
        '/<img([^>]+)>/i', 
        '<img$1 style="max-width: 100%; height: auto;">',
        $content
    );
    
    return $content;
}

// Security enhancements
add_action('init', 'cm_security_headers');
function cm_security_headers() {
    if (!is_admin()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
    }
}

// Performance optimizations
add_action('wp_enqueue_scripts', 'cm_optimize_scripts', 100);
function cm_optimize_scripts() {
    // Remove unnecessary scripts
    if (!is_admin()) {
        wp_dequeue_script('wp-embed');
        
        // Defer non-critical scripts
        add_filter('script_loader_tag', function($tag, $handle) {
            if (in_array($handle, ['commarilia-app'])) {
                return str_replace(' src', ' defer src', $tag);
            }
            return $tag;
        }, 10, 2);
    }
}

// Custom body classes
add_filter('body_class', 'cm_body_classes');
function cm_body_classes($classes) {
    $classes[] = 'cm-theme';
    
    if (wp_is_mobile()) {
        $classes[] = 'cm-mobile';
    }
    
    if (is_home() || is_front_page()) {
        $classes[] = 'cm-home';
    }
    
    return $classes;
}

// Cleanup WordPress head
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'start_post_rel_link');
remove_action('wp_head', 'index_rel_link');
remove_action('wp_head', 'adjacent_posts_rel_link');
remove_action('wp_head', 'wp_shortlink_wp_head');

// Add preconnect for external resources
add_action('wp_head', 'cm_add_preconnects');
function cm_add_preconnects() {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    echo '<link rel="preconnect" href="https://cdn.ampproject.org">' . "\n";
}
?>