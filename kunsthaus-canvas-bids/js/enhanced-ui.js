// Enhanced UI Interactions
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedUI();
});

function initializeEnhancedUI() {
    // Enhanced search functionality
    initializeSearch();
    
    // Smooth scrolling for navigation
    initializeSmoothScrolling();
    
    // Enhanced theme toggle
    initializeThemeToggle();
    
    // Parallax effects
    initializeParallax();
    
    // Enhanced animations
    initializeAnimations();
    
    // Live ticker updates
    initializeLiveTicker();
    
    // Enhanced user menu
    initializeUserMenu();
}

// Enhanced Search
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-submit');
    
    if (!searchInput || !searchBtn) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length > 2) {
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        }
    });
    
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
}

function performSearch(query) {
    const searchBtn = document.getElementById('search-submit');
    
    // Add loading state
    searchBtn.classList.add('loading');
    
    // Simulate search (replace with actual search logic)
    setTimeout(() => {
        searchBtn.classList.remove('loading');
        
        // Redirect to gallery with search query
        window.location.href = `gallery.html?search=${encodeURIComponent(query)}`;
    }, 500);
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
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
        scrollIndicator.addEventListener('click', function() {
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

// Enhanced Theme Toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    }
    
    themeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            updateThemeIcon(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon(true);
        }
    });
}

function updateThemeIcon(isDark) {
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

// Parallax Effects
function initializeParallax() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        heroBackground.style.transform = `translateY(${rate}px)`;
    });
}

// Enhanced Animations
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
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

// Live Ticker Updates
function initializeLiveTicker() {
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
    
    function updateTicker() {
        const update = updates[currentIndex];
        
        tickerUpdate.innerHTML = `
            <span class="user-name">${update.user}</span>
            <span>placed a bid of</span>
            <span class="amount">${update.amount}</span>
            <span>on</span>
            <span class="artwork">${update.artwork}</span>
        `;
        
        currentIndex = (currentIndex + 1) % updates.length;
    }
    
    // Update every 5 seconds
    setInterval(updateTicker, 5000);
}

// Enhanced User Menu
function initializeUserMenu() {
    const userInfo = document.querySelector('.user-info');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (!userInfo || !userDropdown) return;
    
    let isOpen = false;
    let closeTimeout;
    
    userInfo.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
        isOpen = true;
        userDropdown.style.opacity = '1';
        userDropdown.style.visibility = 'visible';
        userDropdown.style.transform = 'translateY(0)';
    });
    
    userInfo.addEventListener('mouseleave', function() {
        closeTimeout = setTimeout(() => {
            if (!isOpen) return;
            userDropdown.style.opacity = '0';
            userDropdown.style.visibility = 'hidden';
            userDropdown.style.transform = 'translateY(-10px)';
            isOpen = false;
        }, 300);
    });
    
    userDropdown.addEventListener('mouseenter', function() {
        clearTimeout(closeTimeout);
    });
    
    userDropdown.addEventListener('mouseleave', function() {
        userDropdown.style.opacity = '0';
        userDropdown.style.visibility = 'hidden';
        userDropdown.style.transform = 'translateY(-10px)';
        isOpen = false;
    });
}

// Utility Functions
function createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enhanced scroll behavior
window.addEventListener('scroll', function() {
    const navigation = document.querySelector('.navigation');
    if (!navigation) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    
    if (window.scrollY > 100) {
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
});

// Enhanced loading states
function showLoadingState(element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

function hideLoadingState(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Export functions for use in other scripts
window.enhancedUI = {
    showLoadingState,
    hideLoadingState,
    createRippleEffect,
    performSearch
};