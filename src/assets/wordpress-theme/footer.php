        <footer style="padding: 1rem; border-top: 1px solid var(--cm-border); text-align: center; font-size: 0.75rem; color: var(--cm-muted-foreground); background: var(--cm-card);">
            © <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. 
            <?php _e('Tema melhorado com design moderno e UX otimizada.', 'commarilia'); ?>
        </footer>
    </div>

    <!-- Floating Actions -->
    <div class="cm-float-container">
        <button class="cm-float-btn" onclick="cmRequestNotifications()" aria-label="<?php _e('Ativar notificações', 'commarilia'); ?>">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            <span class="label"><?php _e('Notificações', 'commarilia'); ?></span>
        </button>
        
        <button class="cm-float-btn" onclick="cmSubscribeNewsletter()" aria-label="<?php _e('Assinar newsletter', 'commarilia'); ?>">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="label"><?php _e('Newsletter', 'commarilia'); ?></span>
        </button>
    </div>

    <?php wp_footer(); ?>
</body>
</html>