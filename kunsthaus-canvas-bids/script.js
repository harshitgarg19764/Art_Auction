// kunstHaus - Interactive Features

// Initialize Lucide icons and core functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
    
    // Initialize all features
    initLiveAuctionTicker();
    initArtworkGrid();
    initArtistGrid();
    initMobileMenu();
    initSmoothScrolling();
    initModals();
    initSearch();
    initUserTypeHandling();
    
    // Handle auth state changes if auth manager is available
    if (window.authManager) {
        // Initial UI update
        window.authManager.checkAuthState().then((isAuthenticated) => {
            updateUIBasedOnAuth(isAuthenticated);
        });
        
        // Listen for future auth state changes
        window.authManager.addAuthListener((isAuthenticated) => {
            updateUIBasedOnAuth(isAuthenticated);
        });
    }
});

// Update UI based on authentication state
function updateUIBasedOnAuth(isAuthenticated) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userNameDisplay = document.getElementById('user-display-name');
    const currentUser = window.authManager?.getCurrentUser();
    
    if (isAuthenticated && currentUser) {
        // Show user menu, hide auth buttons
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUser.name || 'Account';
        }
    } else {
        // Show auth buttons, hide user menu
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Theme functionality is handled by js/theme-toggle.js

// Live Auction Ticker
function initLiveAuctionTicker() {
    const auctionUpdates = [
        { user: "Sarah M.", amount: 3200, artwork: "Sunset Dreams", action: "bid" },
        { user: "David L.", amount: 1800, artwork: "Urban Poetry", action: "won" },
        { user: "Elena R.", amount: 2750, artwork: "Ocean Depths", action: "bid" },
        { user: "Marcus T.", amount: 4100, artwork: "Digital Horizons", action: "bid" },
        { user: "Luna S.", amount: 2200, artwork: "Abstract Emotions", action: "won" },
    ];
    
    let currentIndex = 0;
    const tickerUpdate = document.querySelector('.ticker-update');
    const tickerIcon = document.querySelector('.ticker-icon i');

    if (!tickerUpdate || !tickerIcon) return;
    
    function updateTicker() {
        const update = auctionUpdates[currentIndex];
        const actionText = update.action === "bid" ? "placed a bid of" : "won with";
        
        tickerUpdate.innerHTML = `
            <span class="user-name">${update.user}</span>
            <span>${actionText}</span>
            <span class="amount">$${update.amount.toLocaleString()}</span>
            <span>on</span>
            <span class="artwork">"${update.artwork}"</span>
        `;
        
        // Update icon based on action
        tickerIcon.setAttribute('data-lucide', update.action === "bid" ? 'gavel' : 'trending-up');
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
        
        currentIndex = (currentIndex + 1) % auctionUpdates.length;
    }
    
    // Update ticker every 4 seconds
    setInterval(updateTicker, 4000);
}

// Artwork Grid
async function initArtworkGrid() {
    const artworkGrid = document.getElementById('artwork-grid');
    if (!artworkGrid) return;
    
    try {
        // Show loading state
        artworkGrid.innerHTML = '<div class="loading">Loading artworks...</div>';
        
        const response = await fetch('/api/artworks/', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load artworks');
        }
        
        const data = await response.json();
        const artworks = data.items || [];
        
        // Clear loading state
        artworkGrid.innerHTML = '';
        
        if (artworks.length === 0) {
            artworkGrid.innerHTML = '<div class="no-artworks">No artworks available</div>';
            return;
        }
        
        artworks.forEach(artwork => {
            // Transform backend data to frontend format
            const artworkData = {
                id: artwork.id,
                title: artwork.title,
                artist: artwork.artist ? artwork.artist.name : 'Unknown Artist',
                price: artwork.starting_price,
                image: artwork.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
                status: "active" // For now, all artworks are active
            };
            
            const artworkCard = createArtworkCard(artworkData);
            artworkGrid.appendChild(artworkCard);
        });
        
    } catch (error) {
        console.error('Error loading artworks:', error);
        artworkGrid.innerHTML = '<div class="error">Failed to load artworks. Please try again later.</div>';
    }
}

function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    
    const buttonText = artwork.status === 'sold' ? 'Sold' : 'Place Bid';
    const buttonClass = artwork.status === 'sold' ? 'artwork-bid sold' : 'artwork-bid';
    const buttonDisabled = artwork.status === 'sold' ? 'disabled' : '';
    
    card.innerHTML = `
        <img src="${artwork.image}" alt="${artwork.title}" class="artwork-image" loading="lazy">
        <div class="artwork-info">
            <h3 class="artwork-title">${artwork.title}</h3>
            <p class="artwork-artist">by ${artwork.artist}</p>
            <div class="artwork-price">$${artwork.price.toLocaleString()}</div>
            <button class="${buttonClass}" ${buttonDisabled} onclick="handleBid(${artwork.id})">
                ${buttonText}
            </button>
        </div>
    `;
    
    return card;
}

// Artist Grid
async function initArtistGrid() {
    const artistGrid = document.getElementById('artist-grid');
    if (!artistGrid) return;
    
    try {
        // Show loading state
        artistGrid.innerHTML = '<div class="loading">Loading artists...</div>';
        
        const response = await fetch('/api/artists/', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load artists');
        }
        
        const data = await response.json();
        const artists = data.items || [];
        
        // Clear loading state
        artistGrid.innerHTML = '';
        
        if (artists.length === 0) {
            artistGrid.innerHTML = '<div class="no-artists">No artists available</div>';
            return;
        }
        
        // Default avatars for artists
        const defaultAvatars = [
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        ];
        
        artists.forEach((artist, index) => {
            // Transform backend data to frontend format
            const artistData = {
                id: artist.id,
                name: artist.name,
                specialty: artist.bio || "Contemporary Artist",
                works: artist.artworks ? artist.artworks.length : 0,
                avatar: defaultAvatars[index % defaultAvatars.length]
            };
            
            const artistCard = createArtistCard(artistData);
            artistGrid.appendChild(artistCard);
        });
        
    } catch (error) {
        console.error('Error loading artists:', error);
        artistGrid.innerHTML = '<div class="error">Failed to load artists. Please try again later.</div>';
    }
}

function createArtistCard(artist) {
    const card = document.createElement('div');
    card.className = 'artist-card';
    
    card.innerHTML = `
        <img src="${artist.avatar}" alt="${artist.name}" class="artist-avatar" loading="lazy">
        <h3 class="artist-name">${artist.name}</h3>
        <p class="artist-specialty">${artist.specialty}</p>
        <div class="artist-works">${artist.works} artworks</div>
    `;
    
    return card;
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuBtn || !navLinks) return;

    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
}

// Smooth Scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Bid Handling
async function handleBid(artworkId) {
    // Check if user is authenticated
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        showNotification('Please login to place bids', 'error');
        // Open login modal if available
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            openModal('login-modal');
        } else {
            // Redirect to login page if modal not available
            window.location.href = 'login.html';
        }
        return;
    }

    const artwork = document.querySelector(`[onclick="handleBid(${artworkId})"]`);
    if (!artwork || artwork.disabled) return;

    // Get bid amount from user
    const bidAmount = prompt('Enter your bid amount:');
    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
        showNotification('Please enter a valid bid amount', 'error');
        return;
    }

    // Show loading state
    const originalText = artwork.textContent;
    artwork.textContent = 'Placing Bid...';
    artwork.disabled = true;

    try {
        const response = await fetch('/api/bids/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                amount: parseFloat(bidAmount),
                artwork_id: artworkId
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to place bid');
        }

        const bidData = await response.json();
        
        // Show success message
        showNotification(`Bid of $${bidAmount} placed successfully!`, 'success');
        
        // Update button temporarily
        artwork.textContent = 'Bid Placed!';
        artwork.style.backgroundColor = 'var(--accent)';
        
        // Reset button after 2 seconds
        setTimeout(() => {
            artwork.textContent = 'Place Bid';
            artwork.style.backgroundColor = 'var(--primary)';
            artwork.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Bid error:', error);
        showNotification(error.message || 'Failed to place bid', 'error');
        
        // Reset button
        artwork.textContent = originalText;
        artwork.disabled = false;
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    const backgroundColor = type === 'success' ? 'var(--accent)' : 
                          type === 'error' ? 'var(--destructive)' : 'var(--primary)';
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius)',
        backgroundColor: backgroundColor,
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Modal Management
function initModals() {
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    // Modal open/close handlers
    if (loginBtn) {
        loginBtn.addEventListener('click', () => openModal('login-modal'));
    }
    if (signupBtn) {
        signupBtn.addEventListener('click', () => openModal('signup-modal'));
    }
    
    // Close button handlers
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Switch between modals
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('login-modal');
            openModal('signup-modal');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('signup-modal');
            openModal('login-modal');
        });
    }
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Form submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;
    
    try {
        if (window.authManager) {
            await window.authManager.login({ email, password });
            showNotification('Welcome back! Login successful.', 'success');
            closeModal('login-modal');
            e.target.reset();
        } else {
            throw new Error('Authentication system not available');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    // Check if we're on a page with the expected form elements
    const nameElement = document.getElementById('signup-name');
    const emailElement = document.getElementById('signup-email');
    const userTypeElement = document.getElementById('signup-user-type');
    const bioElement = document.getElementById('signup-bio');
    const passwordElement = document.getElementById('signup-password');
    const confirmPasswordElement = document.getElementById('signup-confirm');
    
    // If elements don't exist, this function shouldn't run on this page
    if (!nameElement || !emailElement || !passwordElement) {
        console.warn('handleSignup called on page without proper form elements');
        return;
    }
    
    const name = nameElement.value;
    const email = emailElement.value;
    const userType = userTypeElement ? userTypeElement.value : 'collector';
    const bio = bioElement ? bioElement.value : '';
    const password = passwordElement.value;
    const confirmPassword = confirmPasswordElement ? confirmPasswordElement.value : password;
    
    if (!name || !email || !password || !confirmPassword || !userType) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                user_type: userType,
                bio: bio 
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Signup failed');
        }

        const data = await response.json();
        
        // Update auth manager state
        if (window.authManager) {
            window.authManager.currentUser = data.user;
            localStorage.setItem('kunsthaus_user', JSON.stringify(data.user));
            window.authManager.updateUIBasedOnAuth(true);
        }

        showNotification(`Welcome to kunstHaus, ${name}! Account created successfully.`, 'success');
        closeModal('signup-modal');
        e.target.reset();
        
        // Hide bio field after reset
        document.getElementById('bio-group').style.display = 'none';
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message || 'Signup failed', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Enhanced Search Functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-submit');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        // Redirect to search results page
        window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
    } else {
        showNotification('Please enter a search term', 'info');
    }
}

// Hero Button Actions
document.addEventListener('DOMContentLoaded', function() {
    const exploreBtn = document.querySelector('.btn-hero');
    const collectBtn = document.querySelector('.btn-gallery');
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            document.getElementById('gallery').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    if (collectBtn) {
        collectBtn.addEventListener('click', function() {
            showNotification('Registration coming soon!', 'info');
        });
    }
});

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to artwork cards
    const artworkCards = document.querySelectorAll('.artwork-card');
    artworkCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add hover effects to artist cards
    const artistCards = document.querySelectorAll('.artist-card');
    artistCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.artwork-card, .artist-card, .section-header');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Handle user type selection in signup form
function initUserTypeHandling() {
    const userTypeSelect = document.getElementById('signup-user-type');
    const bioGroup = document.getElementById('bio-group');
    
    if (userTypeSelect && bioGroup) {
        userTypeSelect.addEventListener('change', function() {
            if (this.value === 'artist' || this.value === 'both') {
                bioGroup.style.display = 'block';
            } else {
                bioGroup.style.display = 'none';
            }
        });
    }
}
// M
ake showNotification available globally
window.showNotification = showNotification;