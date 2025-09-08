/**
 * Enhanced Navbar Component for kunstHaus
 * Provides consistent navigation across all pages with mobile support
 */

class EnhancedNavbar {
    constructor() {
        this.mobileMenuOpen = false;
        this.searchExpanded = false;
        this.currentPage = this.getCurrentPage();
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSearch();
        this.setupUserMenu();
        this.setupActiveStates();
        this.setupScrollBehavior();
        this.setupKeyboardNavigation();
        this.setupNotifications();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        const navActions = document.querySelector('.nav-actions');
        
        if (!mobileMenuBtn) return;

        mobileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !e.target.closest('.navigation')) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu when window is resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const navigation = document.querySelector('.navigation');
        const mobileMenuBtn = document.getElementById('mobile-menu');
        const icon = mobileMenuBtn.querySelector('i');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        navigation.classList.toggle('mobile-menu-open', this.mobileMenuOpen);
        
        // Update hamburger icon
        icon.setAttribute('data-lucide', this.mobileMenuOpen ? 'x' : 'menu');
        
        // Update ARIA attributes
        mobileMenuBtn.setAttribute('aria-expanded', this.mobileMenuOpen);
        mobileMenuBtn.setAttribute('aria-label', this.mobileMenuOpen ? 'Close menu' : 'Open menu');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
        
        // Recreate Lucide icons
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    closeMobileMenu() {
        if (!this.mobileMenuOpen) return;
        
        const navigation = document.querySelector('.navigation');
        const mobileMenuBtn = document.getElementById('mobile-menu');
        const icon = mobileMenuBtn.querySelector('i');
        
        this.mobileMenuOpen = false;
        navigation.classList.remove('mobile-menu-open');
        
        icon.setAttribute('data-lucide', 'menu');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Open menu');
        
        document.body.style.overflow = '';
        
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-submit');
        const mobileSearchBtn = document.getElementById('mobile-search');
        const searchContainer = document.querySelector('.search-container');
        
        if (!searchInput || !searchBtn) return;

        let searchTimeout;
        
        // Enhanced search functionality
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                searchTimeout = setTimeout(() => {
                    this.showSearchSuggestions(query);
                }, 300);
            } else {
                this.hideSearchSuggestions();
            }
        });

        // Search submission
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                this.executeSearch(query);
            }
        };

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // Mobile search toggle
        if (mobileSearchBtn && searchContainer) {
            mobileSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileSearch();
            });
        }

        // Close search suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchSuggestions();
            }
        });
    }

    toggleMobileSearch() {
        const searchContainer = document.querySelector('.search-container');
        const mobileSearchBtn = document.getElementById('mobile-search');
        
        this.searchExpanded = !this.searchExpanded;
        
        searchContainer.classList.toggle('mobile-expanded', this.searchExpanded);
        mobileSearchBtn.classList.toggle('active', this.searchExpanded);
        
        if (this.searchExpanded) {
            const searchInput = document.getElementById('search-input');
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    showSearchSuggestions(query) {
        // Create or update search suggestions dropdown
        let suggestionsContainer = document.querySelector('.search-suggestions');
        
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            document.querySelector('.search-container').appendChild(suggestionsContainer);
        }

        // Mock suggestions (replace with actual API call)
        const suggestions = [
            `Search for "${query}" in artworks`,
            `Search for "${query}" in artists`,
            `Search for "${query}" in collections`
        ];

        suggestionsContainer.innerHTML = suggestions.map(suggestion => 
            `<div class="search-suggestion" data-query="${query}">${suggestion}</div>`
        ).join('');

        suggestionsContainer.style.display = 'block';

        // Add click handlers for suggestions
        suggestionsContainer.querySelectorAll('.search-suggestion').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.executeSearch(query);
            });
        });
    }

    hideSearchSuggestions() {
        const suggestionsContainer = document.querySelector('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    executeSearch(query) {
        // Add loading state
        const searchBtn = document.getElementById('search-submit');
        searchBtn.classList.add('loading');
        
        // Hide suggestions
        this.hideSearchSuggestions();
        
        // Simulate search delay
        setTimeout(() => {
            searchBtn.classList.remove('loading');
            
            // Redirect to search results
            if (window.location.pathname.includes('search.html')) {
                // Already on search page, update results
                this.updateSearchResults(query);
            } else {
                // Redirect to search page
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }, 500);
    }

    updateSearchResults(query) {
        // Update search query display
        const queryDisplay = document.getElementById('search-query-display');
        if (queryDisplay) {
            queryDisplay.textContent = query;
        }
        
        // Trigger search results update (implement based on your search logic)
        if (window.performSearch) {
            window.performSearch(query);
        }
    }

    setupUserMenu() {
        const userInfo = document.querySelector('.user-info');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (!userInfo || !userDropdown) return;

        let dropdownTimeout;

        // Enhanced dropdown behavior
        userInfo.addEventListener('click', (e) => {
            // Only prevent default if clicking on the user info itself, not dropdown items
            if (e.target.closest('.dropdown-item')) {
                return; // Allow dropdown links to work normally
            }
            e.preventDefault();
            this.toggleUserDropdown();
        });

        userInfo.addEventListener('mouseenter', () => {
            clearTimeout(dropdownTimeout);
            this.showUserDropdown();
        });

        userInfo.addEventListener('mouseleave', () => {
            dropdownTimeout = setTimeout(() => {
                this.hideUserDropdown();
            }, 300);
        });

        userDropdown.addEventListener('mouseenter', () => {
            clearTimeout(dropdownTimeout);
        });

        userDropdown.addEventListener('mouseleave', () => {
            this.hideUserDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.hideUserDropdown();
            }
        });

        // Keyboard navigation for dropdown
        userInfo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleUserDropdown();
            }
        });
    }

    toggleUserDropdown() {
        const userDropdown = document.querySelector('.user-dropdown');
        const isVisible = userDropdown.style.opacity === '1';
        
        if (isVisible) {
            this.hideUserDropdown();
        } else {
            this.showUserDropdown();
        }
    }

    showUserDropdown() {
        const userDropdown = document.querySelector('.user-dropdown');
        const userInfo = document.querySelector('.user-info');
        
        userDropdown.style.opacity = '1';
        userDropdown.style.visibility = 'visible';
        userDropdown.style.transform = 'translateY(0)';
        userInfo.setAttribute('aria-expanded', 'true');
    }

    hideUserDropdown() {
        const userDropdown = document.querySelector('.user-dropdown');
        const userInfo = document.querySelector('.user-info');
        
        userDropdown.style.opacity = '0';
        userDropdown.style.visibility = 'hidden';
        userDropdown.style.transform = 'translateY(-10px)';
        userInfo.setAttribute('aria-expanded', 'false');
    }

    setupActiveStates() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPage = this.currentPage;
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkPage = href.replace('.html', '').replace('./', '');
            
            // Remove existing active classes
            link.classList.remove('active');
            
            // Add active class to current page
            if (linkPage === currentPage || 
                (currentPage === 'index' && (linkPage === '' || linkPage === 'index'))) {
                link.classList.add('active');
            }
        });
    }

    setupScrollBehavior() {
        const navigation = document.querySelector('.navigation');
        if (!navigation) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavbar = () => {
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
            
            // Add scrolled class for styling
            navigation.classList.toggle('scrolled', scrollY > 50);
            
            // Hide/show navbar on scroll (optional)
            if (scrollY > 100) {
                navigation.classList.toggle('nav-hidden', scrollDirection === 'down' && scrollY > lastScrollY + 10);
            } else {
                navigation.classList.remove('nav-hidden');
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });
    }

    setupKeyboardNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a, .nav-actions button, .nav-actions a');
        
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    
                    const direction = e.key === 'ArrowRight' ? 1 : -1;
                    const nextIndex = (index + direction + navLinks.length) % navLinks.length;
                    
                    navLinks[nextIndex].focus();
                }
            });
        });
    }

    setupNotifications() {
        // Add notification badge functionality for future use
        this.notificationCount = 0;
        this.updateNotificationBadge();
    }

    updateNotificationBadge(count = 0) {
        this.notificationCount = count;
        
        let badge = document.querySelector('.notification-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge';
                
                // Add to user menu or create notification icon
                const userMenu = document.querySelector('.user-menu');
                if (userMenu) {
                    userMenu.appendChild(badge);
                }
            }
            
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.style.display = 'block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    // Public methods for external use
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }

    setActiveNavItem(page) {
        this.currentPage = page;
        this.setupActiveStates();
    }

    refreshNavbar() {
        this.setupActiveStates();
        if (window.authManager) {
            window.authManager.updateAuthUI();
        }
    }
}

// Initialize enhanced navbar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedNavbar = new EnhancedNavbar();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedNavbar;
}
