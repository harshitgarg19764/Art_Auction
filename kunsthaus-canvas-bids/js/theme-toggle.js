/**
 * Simple Theme Toggle - Bulletproof implementation
 */

// Apply saved theme immediately - before DOM loads
(function() {
    const savedTheme = localStorage.getItem('kunsthaus_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        // Also add to body if it exists
        if (document.body) {
            document.body.classList.add('dark');
        }
    }
})();

// Ensure theme is applied when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('kunsthaus_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
    }
    updateThemeIcon();
});

// Use event delegation to handle theme toggle clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('#theme-toggle')) {
        e.preventDefault();
        toggleTheme();
    }
});

// Apply theme on page load and visibility change
function applyTheme() {
    const savedTheme = localStorage.getItem('kunsthaus_theme') || 'light';
    const isDark = savedTheme === 'dark';
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    }
    
    updateThemeIcon(isDark);
}

// Apply theme when page becomes visible (handles page navigation)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        applyTheme();
    }
});

// Apply theme when page loads
window.addEventListener('load', applyTheme);

// Theme toggle function
function toggleTheme() {
    const body = document.body;
    const html = document.documentElement;
    
    // Toggle dark class
    body.classList.toggle('dark');
    html.classList.toggle('dark');
    
    const isDark = body.classList.contains('dark');
    
    // Save preference
    localStorage.setItem('kunsthaus_theme', isDark ? 'dark' : 'light');
    
    // Update icon
    updateThemeIcon(isDark);
}

// Update theme icon
function updateThemeIcon(isDark) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    if (!icon) return;
    
    // Check current state if not provided - check both body and html
    if (isDark === undefined) {
        isDark = document.body.classList.contains('dark') || document.documentElement.classList.contains('dark');
    }
    
    // Update icon
    icon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
    
    // Recreate icons
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

// Make functions globally available
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
