// UI Enhancements & Theme System for kunstHaus
// Combines enhanced UI interactions, theme toggle, and navbar functionality

// ============================================================================
// THEME SYSTEM
// ============================================================================

class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupThemeToggle();
        this.loadSavedTheme();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            this.updateThemeIcon(true);
        } else {
            this.updateThemeIcon(false);
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            this.updateThemeIcon(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            this.updateThemeIcon(true);
        }
    }

    updateThemeIcon(isDark) {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        
        if (isDark) {
            icon.setAttribute('data-lucide', 'moon');
        } else {
            icon.setAttribute('data-lucide', 'sun');
        }
        
        // Reinitialize Lucide icons
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }
}

// ============================================================================
// ENHANCED NAVBAR
// ============================================================================

class EnhancedNavbar {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupUserMenu();
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileMenuClose = document.getElementById('mobile-menu-close');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (mobileMenuClose && mobileMenu) {
            mobileMenuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close mobile menu when clicking outside
        if (mobileMenu) {
            mobileMenu.addEventListener('click', (e) => {
                if (e.target === mobileMenu) {
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const navigation = document.querySelector('.navigation');
        
        if (!navigation) return;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const isDark = document.documentElement.classList.contains('dark');
            
            // Update navigation background based on scroll
            if (currentScrollY > 100) {
                if (isDark) {
                    navigation.style.background = 'rgba(15, 23, 42, 0.98)';
                    navigation.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
                } else {
                    navigation.style.background = 'rgba(255, 255, 255, 0.98)';
                    navigation.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
                }
                navigation.classList.add('scrolled');
            } else {
                if (isDark) {
                    navigation.style.background = 'rgba(15, 23, 42, 0.95)';
                    navigation.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                } else {
                    navigation.style.background = 'rgba(255, 255, 255, 0.95)';
                    navigation.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }
                navigation.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navigation.style.transform = 'translateY(-100%)';
            } else {
                navigation.style.transform = 'translateY(0)';
            }
            
            lastScrollY = currentScrollY;
        });
    }

    setupUserMenu() {
        const userInfo = document.querySelector('.user-info');
        const userDropdown = document.querySelector('.user-dropdown');
        
        if (!userInfo || !userDropdown) return;
        
        let isOpen = false;
        let closeTimeout;
        
        userInfo.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
            isOpen = true;
            userDropdown.style.opacity = '1';
            userDropdown.style.visibility = 'visible';
            userDropdown.style.transform = 'translateY(0)';
        });
        
        userInfo.addEventListener('mouseleave', () => {
            closeTimeout = setTimeout(() => {
                if (!isOpen) return;
                userDropdown.style.opacity = '0';
                userDropdown.style.visibility = 'hidden';
                userDropdown.style.transform = 'translateY(-10px)';
                isOpen = false;
            }, 300);
        });
        
        userDropdown.addEventListener('mouseenter', () => {
            clearTimeout(closeTimeout);
        });
        
        userDropdown.addEventListener('mouseleave', () => {
            userDropdown.style.opacity = '0';
            userDropdown.style.visibility = 'hidden';
            userDropdown.style.transform = 'translateY(-10px)';
            isOpen = false;
        });
    }

}

// ============================================================================
// ENHANCED UI INTERACTIONS
// ============================================================================

class UIEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupParallaxEffects();
        this.setupAnimations();
        this.setupLiveTicker();
        this.setupRippleEffects();
    }

    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const featuredSection = document.getElementById('gallery');
                if (featuredSection) {
                    featuredSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    setupParallaxEffects() {
        const heroBackground = document.querySelector('.hero-background');
        if (!heroBackground) return;
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll('.artwork-card, .artist-card, .stat-item, .section-header');
        animateElements.forEach(el => observer.observe(el));
        
        // Stagger animations for grid items
        const gridItems = document.querySelectorAll('.artwork-grid .artwork-card, .artist-grid .artist-card');
        gridItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    setupLiveTicker() {
        const tickerUpdate = document.querySelector('.ticker-update');
        if (!tickerUpdate) return;
        
        const updates = [
            {
                user: 'Sarah M.',
                amount: '$3,200',
                artwork: '"Sunset Dreams"'
            },
            {
                user: 'John D.',
                amount: '$2,850',
                artwork: '"Urban Poetry"'
            },
            {
                user: 'Emma L.',
                amount: '$4,100',
                artwork: '"Ocean Depths"'
            },
            {
                user: 'Mike R.',
                amount: '$1,950',
                artwork: '"City Lights"'
            },
            {
                user: 'Anna K.',
                amount: '$3,750',
                artwork: '"Abstract Flow"'
            }
        ];
        
        let currentIndex = 0;
        
        const updateTicker = () => {
            const update = updates[currentIndex];
            
            tickerUpdate.innerHTML = `
                <span class="user-name">${update.user}</span>
                <span>placed a bid of</span>
                <span class="amount">${update.amount}</span>
                <span>on</span>
                <span class="artwork">${update.artwork}</span>
            `;
            
            currentIndex = (currentIndex + 1) % updates.length;
        };
        
        // Update every 5 seconds
        setInterval(updateTicker, 5000);
    }

    setupRippleEffects() {
        const buttons = document.querySelectorAll('.btn, .artwork-card, .artist-card');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(button, e);
            });
        });
    }

    createRippleEffect(element, event) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.pointerEvents = 'none';
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Utility methods
    showLoadingState(element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
    }

    hideLoadingState(element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }
}

// ============================================================================
// CSS ANIMATIONS
// ============================================================================

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-slide-up {
        animation: slideUp 0.6s ease-out forwards;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .loading {
        position: relative;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all UI enhancement systems
    new ThemeManager();
    new EnhancedNavbar();
    new UIEnhancements();
});

// Global exports for backward compatibility
window.enhancedUI = {
    showLoadingState: (element) => new UIEnhancements().showLoadingState(element),
    hideLoadingState: (element) => new UIEnhancements().hideLoadingState(element),
    createRippleEffect: (element, event) => new UIEnhancements().createRippleEffect(element, event),
};
