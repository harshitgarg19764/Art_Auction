// Enhanced Auctions Page - Clean Implementation

let auctionData = [];
let filteredAuctions = [];
let displayedCount = 6;
let modalListenersSetup = false;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('Enhanced auctions page loading...');
    
    // Check for specific artwork ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const artworkId = urlParams.get('artwork');
    
    loadAuctionsFromBackend(artworkId);
    initFilters();
    startTimers();
    setupGlobalEventListeners();
    
    // Check if we came from add-artwork page
    if (document.referrer.includes('add-artwork.html')) {
        console.log('Came from add-artwork page, showing welcome message');
        setTimeout(() => {
            showNotification('Your artwork is now available for bidding!', 'success');
        }, 1000);
    }
    
    // Setup preview modal click outside listener
    const modal = document.getElementById('artwork-preview-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeArtworkPreview();
            }
        });
    }
});

// Global functions for buttons
window.refreshAuctions = function () {
    console.log('Manual refresh triggered...');
    window.manualRefresh = true;
    loadAuctionsFromBackend();
};

window.showDebugInfo = function () {
    console.log('=== AUCTION DEBUG INFO ===');
    console.log('Total Auctions:', auctionData.length);
    console.log('Filtered Auctions:', filteredAuctions.length);
    console.log('All auction data:', auctionData);

    alert('Debug info logged to console!\n\nTotal Auctions: ' + auctionData.length + '\nCheck browser console for detailed info.');
};

// Auto-refresh every 30 seconds
setInterval(() => {
    console.log('Auto-refreshing auctions...');
    loadAuctionsFromBackend();
}, 30000);

async function loadAuctionsFromBackend(specificArtworkId = null) {
    console.log('Loading auctions from backend...');
    try {
        const response = await fetch('/api/auctions', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            throw new Error('Failed to load artworks');
        }

        const data = await response.json();
        console.log('Auctions data:', data);

        // Transform backend auctions
        auctionData = data.auctions.map(auction => {
            return {
                id: auction.id,
                title: auction.artwork.title,
                artist: auction.artwork.artist,
                currentBid: auction.current_bid,
                startingBid: auction.starting_bid,
                image: auction.artwork.image || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
                status: auction.status,
                category: 'abstract',
                endTime: new Date(auction.end_time),
                bidCount: auction.bid_count || 0,
                watchers: Math.floor(Math.random() * 100) + 10,
                timeRemaining: auction.time_remaining
            };
        });

        // If specific artwork ID is provided, scroll to and highlight it
        if (specificArtworkId) {
            setTimeout(() => {
                const targetCard = document.querySelector(`[onclick="handleBid(${specificArtworkId})"]`);
                if (targetCard) {
                    const card = targetCard.closest('.auction-card');
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        card.style.border = '3px solid var(--accent)';
                        card.style.boxShadow = '0 0 20px rgba(var(--accent-rgb), 0.3)';
                        
                        // Show notification
                        showNotification(`Found artwork! Ready to place your bid.`, 'success');
                        
                        // Remove highlight after 3 seconds
                        setTimeout(() => {
                            card.style.border = '';
                            card.style.boxShadow = '';
                        }, 3000);
                    }
                }
            }, 500);
        }

        // Don't use sample data - only show real auctions
        if (auctionData.length === 0) {
            console.log('No auctions found in database');
        } else {
            console.log('Loaded', auctionData.length, 'auctions');
        }

        filteredAuctions = [...auctionData];
        displayAuctions();

        // Show refresh notification
        if (window.manualRefresh) {
            showRefreshNotification(auctionData.length);
            window.manualRefresh = false;
        }

    } catch (error) {
        console.error('Error loading auctions:', error);
        // Don't show sample data on error - keep empty
        auctionData = [];
        filteredAuctions = [];
        displayAuctions();
    }
}

function generateSampleBidHistory(startingPrice) {
    const bidders = ['Alice M.', 'John D.', 'Sarah K.', 'Mike R.', 'Emma L.'];
    const history = [];
    let currentBid = startingPrice;

    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        currentBid += Math.floor(Math.random() * 200) + 50;
        history.push({
            bidder: bidders[Math.floor(Math.random() * bidders.length)],
            amount: currentBid,
            time: new Date(Date.now() - (i + 1) * 60 * 60 * 1000).toISOString()
        });
    }

    return history.reverse(); // Most recent first
}

// getSampleAuctions function removed - no sample data needed

function displayAuctions() {
    const grid = document.getElementById('auction-grid');
    if (!grid) {
        console.error('Auction grid not found');
        return;
    }

    grid.innerHTML = '';

    const auctions = filteredAuctions.slice(0, displayedCount);

    if (auctions.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-content">
                <i data-lucide="palette" class="empty-icon"></i>
                <h3>No Artworks Available</h3>
                <p>There are currently no artworks in the auction. Check back later or contact artists to add their work!</p>
                <div class="empty-actions">
                    <button class="btn btn-hero" onclick="window.refreshAuctions()">
                        <i data-lucide="refresh-cw"></i>
                        Refresh
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(emptyState);

        // Initialize Lucide icons
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    } else {
        auctions.forEach(auction => {
            const card = createAuctionCard(auction);
            grid.appendChild(card);
        });
    }

    updateResultsCount();
}

function createAuctionCard(auction) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    
    const statusText = auction.status === 'live' ? 'Live Now' :
        auction.status === 'upcoming' ? 'Upcoming' : 'Ended';
    const statusClass = `status-${auction.status}`;
    const timeRemaining = getTimeRemaining(auction.endTime);
    const buttonText = auction.status === 'live' ? 'Place Bid' : 'View Details';
    const buttonClass = auction.status === 'live' ? 'artwork-bid' : 'artwork-bid sold';
    
    card.innerHTML = `
        <div class="artwork-status ${statusClass}">${statusText}</div>
        <img src="${auction.image}" alt="${auction.title}" class="artwork-image" loading="lazy">
        <div class="artwork-info">
            <h3 class="artwork-title">${auction.title}</h3>
            <p class="artwork-artist">by ${auction.artist}</p>
            <div class="artwork-details">
                <div class="artwork-price">$${auction.currentBid ? auction.currentBid.toLocaleString() : auction.startingBid.toLocaleString()}</div>
                <div class="artwork-time">
                    <i data-lucide="clock"></i>
                    <span>${timeRemaining}</span>
                </div>
            </div>
            <button class="${buttonClass}" onclick="${auction.status === 'live' ? `handleBid(${auction.id})` : `showArtworkPreview(${auction.id})`}">
                ${buttonText}
            </button>
        </div>
    `;
    
    // Add animation delay based on index if needed
    const index = document.querySelectorAll('.artwork-card').length % 8;
    card.style.animationDelay = `${index * 0.1}s`;
    
    return card;
}

function getTimeRemaining(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return 'Auction Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${minutes}m ${seconds}s`;
    }
}

function startTimers() {
    setInterval(() => {
        const timers = document.querySelectorAll('.auction-timer');
        timers.forEach(timer => {
            const endTime = timer.getAttribute('data-end-time');
            if (endTime) {
                timer.textContent = getTimeRemaining(endTime);
            }
        });
    }, 1000);
}

function updateResultsCount() {
    const counter = document.getElementById('results-count');
    if (counter) {
        const showing = Math.min(displayedCount, filteredAuctions.length);
        if (filteredAuctions.length === 0) {
            counter.textContent = 'No auctions available';
        } else {
            counter.textContent = `Showing ${showing} of ${filteredAuctions.length} auctions`;
        }
    }
}

function showRefreshNotification(count) {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <i data-lucide="refresh-cw"></i>
        <span>Auctions refreshed! Found ${count} artworks</span>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        borderRadius: '8px',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    });

    document.body.appendChild(notification);

    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }

    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

function handleBid(auctionId) {
    // Check if user is authenticated
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        showNotification('Please login to place bids', 'error');
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Check if user data is available
    const currentUser = window.authManager.getCurrentUser();
    if (!currentUser) {
        showNotification('Please login to place bids', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const auction = auctionData.find(a => a.id === auctionId);
    if (auction) {
        openBiddingModal(auction);
    }
}

function initFilters() {
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');

    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }

    console.log('Filters initialized');
}

function applyFilters() {
    const statusFilter = document.getElementById('status-filter');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');

    let filtered = [...auctionData];

    // Status filter
    if (statusFilter && statusFilter.value !== 'all') {
        filtered = filtered.filter(auction => auction.status === statusFilter.value);
    }

    // Category filter
    if (categoryFilter && categoryFilter.value !== 'all') {
        filtered = filtered.filter(auction => auction.category === categoryFilter.value);
    }

    // Price filter
    if (priceFilter && priceFilter.value !== 'all') {
        const priceRange = priceFilter.value;
        filtered = filtered.filter(auction => {
            const price = auction.startingBid;
            switch (priceRange) {
                case '0-500': return price <= 500;
                case '500-2000': return price > 500 && price <= 2000;
                case '2000-5000': return price > 2000 && price <= 5000;
                case '5000+': return price > 5000;
                default: return true;
            }
        });
    }

    filteredAuctions = filtered;
    displayAuctions();
}

function setupGlobalEventListeners() {
    // Load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayedCount += 6;
            displayAuctions();
        });
    }
}

// Enhanced Bidding Modal Functions
function openBiddingModal(auction) {
    // Get existing modal from HTML
    let modal = document.getElementById('bidding-modal');

    if (!modal) {
        console.log('Creating new bidding modal...');
        createBiddingModal();
        modal = document.getElementById('bidding-modal');
    }

    if (!modal) {
        console.error('Could not create or find bidding modal');
        return;
    }

    // Populate modal with auction data
    populateBiddingModal(auction);

    // Setup event listeners if not already done
    setupModalEventListeners();

    // Load bid history for this artwork
    loadBidHistory(auction.id);

    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function createBiddingModal() {
    const modal = document.createElement('div');
    modal.id = 'bidding-modal';
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content bidding-modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Place Your Bid</h2>
                <button class="modal-close" id="bidding-close">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <!-- Artwork Preview -->
            <div class="artwork-preview-section">
                <div class="artwork-preview-image">
                    <img id="bidding-artwork-image" src="" alt="" class="bidding-image">
                </div>
                <div class="artwork-preview-info">
                    <h3 id="bidding-artwork-title"></h3>
                    <p id="bidding-artwork-artist"></p>
                    <div class="artwork-details">
                        <span id="bidding-artwork-category"></span>
                        <span id="bidding-artwork-year"></span>
                    </div>
                    <div class="current-bid-section">
                        <span class="current-bid-label">Current Highest Bid:</span>
                        <span id="current-bid-amount" class="current-bid-value"></span>
                    </div>
                </div>
            </div>
            
            <!-- Bid History -->
            <div class="bid-history-section">
                <h4>Bid History</h4>
                <div id="bid-history-list" class="bid-history-list">
                    <div class="loading">Loading bid history...</div>
                </div>
            </div>
            
            <!-- Bidding Form -->
            <form id="bidding-form" class="bidding-form">
                <div class="form-group">
                    <label class="form-label" for="bid-amount">Your Bid Amount</label>
                    <div class="bid-input-container">
                        <span class="currency-symbol">$</span>
                        <input type="number" id="bid-amount" class="form-input bid-input" required min="0" step="50">
                    </div>
                    <div class="bid-suggestions" id="bid-suggestions">
                        <!-- Bid suggestions will be populated by JavaScript -->
                    </div>
                    <div class="bid-info">
                        <small>Minimum bid: $<span id="minimum-bid"></span></small>
                    </div>
                </div>
                
                <div class="auction-timer-section">
                    <div class="timer-label">Time Remaining:</div>
                    <div class="timer-display" id="modal-auction-timer"></div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-bid">Cancel</button>
                    <button type="submit" class="btn btn-hero">Place Bid</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize Lucide icons
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

function populateBiddingModal(auction) {
    // Safely populate elements that exist
    const elements = {
        image: document.getElementById('bidding-artwork-image'),
        title: document.getElementById('bidding-artwork-title'),
        artist: document.getElementById('bidding-artwork-artist'),
        category: document.getElementById('bidding-artwork-category'),
        currentBid: document.getElementById('current-bid-amount'),
        bidAmount: document.getElementById('bid-amount'),
        minimumBid: document.getElementById('minimum-bid'),
        suggestions: document.getElementById('bid-suggestions'),
        timer: document.getElementById('modal-auction-timer') || document.getElementById('auction-timer'),
        form: document.getElementById('bidding-form')
    };

    // Populate artwork info
    if (elements.image) elements.image.src = auction.image;
    if (elements.title) elements.title.textContent = auction.title;
    if (elements.artist) elements.artist.textContent = `by ${auction.artist}`;
    if (elements.category) elements.category.textContent = auction.category || 'Abstract';
    if (elements.currentBid) elements.currentBid.textContent = `$${auction.currentBid.toLocaleString()}`;

    // Set minimum bid
    const minBid = auction.currentBid + 50;
    if (elements.bidAmount) {
        elements.bidAmount.min = minBid;
        elements.bidAmount.placeholder = `Minimum: $${minBid.toLocaleString()}`;
    }
    if (elements.minimumBid) {
        elements.minimumBid.textContent = minBid.toLocaleString();
    }

    // Generate bid suggestions
    if (elements.suggestions) {
        const suggestions = [minBid, minBid + 100, minBid + 250, minBid + 500];
        elements.suggestions.innerHTML = suggestions.map(amount =>
            `<button type="button" class="bid-suggestion" onclick="setBidAmount(${amount})">$${amount.toLocaleString()}</button>`
        ).join('');
    }

    // Update timer
    if (elements.timer) {
        elements.timer.textContent = getTimeRemaining(auction.endTime);
    }

    // Store auction ID
    if (elements.form) {
        elements.form.dataset.auctionId = auction.id;
    }
}

function setupModalEventListeners() {
    if (modalListenersSetup) return;

    const closeBtn = document.getElementById('bidding-close');
    const cancelBtn = document.getElementById('cancel-bid');
    const form = document.getElementById('bidding-form');
    const modal = document.getElementById('bidding-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeBiddingModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeBiddingModal);
    }

    if (form) {
        form.addEventListener('submit', handleBidSubmit);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBiddingModal();
            }
        });
    }

    modalListenersSetup = true;
}

async function loadBidHistory(artworkId) {
    const historyContainer = document.getElementById('bid-history-list');

    if (!historyContainer) {
        console.log('No bid history container found');
        return;
    }

    try {
        // Show loading state
        historyContainer.innerHTML = `
            <div class="loading-state">
                <i data-lucide="loader-2"></i>
                Loading bid history...
            </div>
        `;

        // Fetch bid history from backend
        const response = await fetch(`/api/bids/artwork/${artworkId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            displayBidHistory(data.bids);
        } else {
            console.error('Failed to load bid history:', response.status);
            displayBidHistory([]);
        }
    } catch (error) {
        console.error('Error loading bid history:', error);
        displayBidHistory([]);
    }
}

function displayBidHistory(bids) {
    const historyContainer = document.getElementById('bid-history-list');
    if (!historyContainer) return;

    if (!bids || bids.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-bids">
                <i data-lucide="gavel"></i>
                <p>No bids yet. Be the first to bid!</p>
            </div>
        `;
    } else {
        historyContainer.innerHTML = bids.map((bid, index) => `
            <div class="bid-history-item ${index === 0 ? 'highest-bid' : ''}">
                <div class="bidder-info">
                    <div class="bidder-name">
                        <i data-lucide="user"></i>
                        ${bid.bidder_name || bid.bidder}
                    </div>
                    <div class="bid-time">${formatBidTime(bid.created_at || bid.time)}</div>
                </div>
                <div class="bid-amount">$${bid.amount.toLocaleString()}</div>
                ${index === 0 ? '<div class="highest-badge">Highest Bid</div>' : ''}
            </div>
        `).join('');
    }

    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

function formatBidTime(timeString) {
    if (!timeString) return 'Recently';

    if (typeof timeString === 'string' && timeString.includes('ago')) {
        return timeString;
    }

    try {
        const date = new Date(timeString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    } catch {
        return timeString;
    }
}

function setBidAmount(amount) {
    const bidInput = document.getElementById('bid-amount');
    if (bidInput) {
        bidInput.value = amount;
    }
}

async function handleBidSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const auctionId = parseInt(form.dataset.auctionId);
    const bidAmountInput = document.getElementById('bid-amount');

    if (!bidAmountInput) {
        showNotification('Bid form error', 'error');
        return;
    }

    const bidAmount = parseFloat(bidAmountInput.value);

    if (!bidAmount || bidAmount <= 0) {
        showNotification('Please enter a valid bid amount', 'error');
        return;
    }

    const auction = auctionData.find(a => a.id === auctionId);
    if (!auction) {
        showNotification('Auction not found', 'error');
        return;
    }

    const minBid = auction.currentBid + 50;

    if (bidAmount < minBid) {
        showNotification(`Minimum bid is $${minBid.toLocaleString()}`, 'error');
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Placing Bid...';
    submitBtn.disabled = true;

    try {
        // Get current user
        const currentUser = window.authManager.getCurrentUser();

        // Submit bid to backend using authenticated fetch
        const response = await window.authManager.authenticatedFetch('/api/bids/', {
            method: 'POST',
            body: JSON.stringify({
                amount: bidAmount,
                artwork_id: auctionId
            })
        });

        if (response.ok) {
            const bidResult = await response.json();

            // Update local auction data
            auction.currentBid = bidAmount;
            auction.bidCount += 1;

            // Add to bid history
            if (!auction.bidHistory) auction.bidHistory = [];
            auction.bidHistory.unshift({
                bidder: currentUser.name,
                amount: bidAmount,
                time: new Date().toISOString()
            });

            // Refresh displays
            displayAuctions();
            populateBiddingModal(auction);
            loadBidHistory(auctionId);

            showNotification(`Bid of $${bidAmount.toLocaleString()} placed successfully!`, 'success');

            // Close modal after short delay
            setTimeout(() => {
                closeBiddingModal();
            }, 2000);

        } else {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to place bid');
        }

    } catch (error) {
        console.error('Bid submission error:', error);
        showNotification(error.message || 'Failed to place bid', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function closeBiddingModal() {
    const modal = document.getElementById('bidding-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    const backgroundColor = type === 'success' ? '#10b981' :
        type === 'error' ? '#ef4444' : '#3b82f6';

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
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

// Artwork Preview Functionality for Auctions
let currentPreviewAuction = null;

window.showArtworkPreview = function(auctionId) {
    const auction = auctionData.find(auc => auc.id === auctionId);
    if (!auction) {
        console.error('Auction not found:', auctionId);
        return;
    }
    
    currentPreviewAuction = auction;
    
    // Populate modal with auction data
    document.getElementById('preview-image').src = auction.image;
    document.getElementById('preview-image').alt = auction.title;
    document.getElementById('preview-title').textContent = auction.title;
    document.getElementById('preview-artist').textContent = `by ${auction.artist}`;
    document.getElementById('preview-description').textContent = auction.description || 'Beautiful artwork available for bidding.';
    document.getElementById('preview-category').textContent = auction.category || 'Abstract';
    document.getElementById('preview-current-bid').textContent = `$${auction.currentBid ? auction.currentBid.toLocaleString() : '0'}`;
    document.getElementById('preview-status').textContent = auction.status === 'live' ? 'Live Auction' : 
                                                           auction.status === 'upcoming' ? 'Upcoming' : 'Ended';
    document.getElementById('preview-bid-count').textContent = `${auction.bidCount || 0} bids`;
    
    // Update bid button based on status
    const bidBtn = document.getElementById('preview-bid-btn');
    if (auction.status === 'ended') {
        bidBtn.textContent = 'Auction Ended';
        bidBtn.disabled = true;
        bidBtn.classList.add('disabled');
    } else if (auction.status === 'upcoming') {
        bidBtn.innerHTML = '<i data-lucide="clock"></i> Watch';
        bidBtn.disabled = false;
        bidBtn.classList.remove('disabled');
    } else {
        bidBtn.innerHTML = '<i data-lucide="gavel"></i> Place Bid';
        bidBtn.disabled = false;
        bidBtn.classList.remove('disabled');
    }
    
    // Show modal
    const modal = document.getElementById('artwork-preview-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize Lucide icons
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
};

window.closeArtworkPreview = function() {
    const modal = document.getElementById('artwork-preview-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentPreviewAuction = null;
};

window.handleBidFromPreview = function() {
    if (currentPreviewAuction) {
        closeArtworkPreview();
        handleBid(currentPreviewAuction.id);
    }
};

console.log('Enhanced auctions script loaded successfully');