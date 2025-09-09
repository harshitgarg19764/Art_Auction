// kunstHaus - Core Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
    
    // Initialize features
    initLiveAuctionTicker();
    initArtworkGrid();
    initArtistGrid();
    initMobileMenu();
    initSmoothScrolling();
    initModals();
    initUserTypeHandling();
    
    // Handle auth state changes
    if (window.authManager) {
        window.authManager.checkAuthState();
        const isAuthenticated = window.authManager.isAuthenticated();
        updateUIBasedOnAuth(isAuthenticated);
        
        window.authManager.addAuthListener((isAuthenticated) => {
            updateUIBasedOnAuth(isAuthenticated);
        });
    }
});

// Update UI based on authentication state
function updateUIBasedOnAuth(isAuthenticated) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userDisplayName = document.getElementById('user-display-name');
    const dropdownUsername = document.getElementById('dropdown-username');
    const addArtworkLink = document.getElementById('add-artwork-link');
    const myCollectionLink = document.getElementById('my-collection-link');
    
    if (isAuthenticated && window.authManager && window.authManager.currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        
        const userName = window.authManager.currentUser.name || window.authManager.currentUser.username || 'User';
        if (userDisplayName) userDisplayName.textContent = userName;
        if (dropdownUsername) dropdownUsername.textContent = userName;
        
        // Show artist-specific links for artists
        if (window.authManager.currentUser.user_type === 'artist' || window.authManager.currentUser.user_type === 'both') {
            if (addArtworkLink) addArtworkLink.style.display = 'block';
        }
        
        if (myCollectionLink) myCollectionLink.style.display = 'block';
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (addArtworkLink) addArtworkLink.style.display = 'none';
        if (myCollectionLink) myCollectionLink.style.display = 'none';
    }
}

// Live Auction Ticker
function initLiveAuctionTicker() {
    const ticker = document.getElementById('live-ticker');
    if (!ticker) return;
    
    const auctionUpdates = [
        { artwork: "Midnight Dreams", artist: "Sarah Mitchell", action: "bid", amount: 2500 },
        { artwork: "Urban Symphony", artist: "Marcus Chen", action: "sold", amount: 4200 },
        { artwork: "Ocean Whispers", artist: "Elena Rodriguez", action: "bid", amount: 1800 }
    ];
    
    let currentIndex = 0;
    
    function updateTicker() {
        const update = auctionUpdates[currentIndex];
        const tickerText = ticker.querySelector('.ticker-text');
        const tickerIcon = ticker.querySelector('i[data-lucide]');
        
        tickerText.innerHTML = `
            <strong>${update.artwork}</strong> by ${update.artist} - 
            ${update.action === 'bid' ? 'New bid' : 'Sold'}: $${update.amount.toLocaleString()}
        `;
        
        tickerIcon.setAttribute('data-lucide', update.action === "bid" ? 'gavel' : 'trending-up');
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
        
        currentIndex = (currentIndex + 1) % auctionUpdates.length;
    }
    
    setInterval(updateTicker, 4000);
}

// Artwork Grid
async function initArtworkGrid() {
    const artworkGrid = document.getElementById('artwork-grid');
    if (!artworkGrid) return;
    
    try {
        artworkGrid.innerHTML = '<div class="loading">Loading artworks...</div>';
        
        const response = await fetch('http://127.0.0.1:5000/api/artworks/', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to load artworks');
        
        const data = await response.json();
        const artworks = data.items || [];
        
        artworkGrid.innerHTML = '';
        
        if (artworks.length === 0) {
            artworkGrid.innerHTML = '<div class="no-artworks">No artworks available</div>';
            return;
        }
        
        artworks.forEach(artwork => {
            const artworkData = {
                id: artwork.id,
                title: artwork.title,
                artist: artwork.artist ? artwork.artist.name : 'Unknown Artist',
                price: artwork.starting_price,
                image: artwork.image_url || "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
                status: "active"
            };
            
            const artworkCard = createArtworkCard(artworkData);
            artworkGrid.appendChild(artworkCard);
        });
        
    } catch (error) {
        console.error('Error loading artworks:', error);
        artworkGrid.innerHTML = '<div class="no-artworks">No artworks available. Please check your connection and try again.</div>';
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
        artistGrid.innerHTML = '<div class="loading">Loading artists...</div>';
        
        const response = await fetch('http://127.0.0.1:5000/api/artists/', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to load artists');
        
        const data = await response.json();
        const artists = data.items || [];
        
        artistGrid.innerHTML = '';
        
        if (artists.length === 0) {
            artistGrid.innerHTML = '<div class="no-artists">No artists available</div>';
            return;
        }
        
        const defaultAvatars = [
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        ];
        
        artists.forEach((artist, index) => {
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
        artistGrid.innerHTML = '<div class="no-artists">No artists available. Please check your connection and try again.</div>';
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

async function handleBid(artworkId) {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        showNotification('Please login to place bids', 'error');
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            openModal('login-modal');
        } else {
            window.location.href = 'login.html';
        }
        return;
    }

    window.location.href = `auctions.html?artwork=${artworkId}`;
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
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
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
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
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginBtn) loginBtn.addEventListener('click', () => openModal('login-modal'));
    if (signupBtn) signupBtn.addEventListener('click', () => openModal('signup-modal'));
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
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
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
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
    
    const nameElement = document.getElementById('signup-name');
    const emailElement = document.getElementById('signup-email');
    const userTypeElement = document.getElementById('signup-user-type');
    const bioElement = document.getElementById('signup-bio');
    const passwordElement = document.getElementById('signup-password');
    const confirmPasswordElement = document.getElementById('signup-confirm');
    
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
        
        if (window.authManager) {
            window.authManager.currentUser = data.user;
            localStorage.setItem('kunsthaus_user', JSON.stringify(data.user));
            window.authManager.updateUIBasedOnAuth(true);
        }

        showNotification(`Welcome to kunstHaus, ${name}! Account created successfully.`, 'success');
        closeModal('signup-modal');
        e.target.reset();
        
        document.getElementById('bio-group').style.display = 'none';
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message || 'Signup failed', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Hero Button Actions
document.addEventListener('DOMContentLoaded', function() {
    const exploreBtn = document.querySelector('.btn-hero');
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function() {
            const gallerySection = document.getElementById('gallery');
            if (gallerySection) {
                gallerySection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    }
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

// Make showNotification available globally
window.showNotification = showNotification;
