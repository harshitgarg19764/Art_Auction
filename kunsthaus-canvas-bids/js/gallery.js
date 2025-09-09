// Gallery Page Functionality
let galleryArtworks = [];
let filteredArtworks = [];

document.addEventListener('DOMContentLoaded', function () {
    loadGallery();
    initFilters();
    
    if (document.referrer.includes('add-artwork.html')) {
        setTimeout(() => {
            showNotification('Welcome to the gallery! Your new artwork should be visible here.', 'success');
        }, 1000);
    }
});

window.loadArtworksFromBackend = loadArtworksFromBackend;

async function loadGallery() {
    await loadArtworksFromBackend();
}

async function loadArtworksFromBackend() {
    try {
        const response = await fetch('/api/artworks', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load artworks');
        }
        
        const data = await response.json();
        
        // Transform backend data to gallery format
        galleryArtworks = data.artworks.map(artwork => {
            console.log('Processing artwork:', artwork); // Debug log
            return {
                id: artwork.id,
                title: artwork.title,
                artist: artwork.artist || 'Unknown Artist',
                price: artwork.price || 0,
                image: artwork.image || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
                category: artwork.category || 'abstract',
                description: artwork.description || 'Beautiful artwork available for bidding.',
                status: 'active' // Add default status
            };
        });
        
        // Don't use sample data - only show manually added artworks
        if (galleryArtworks.length === 0) {
            console.log('No artworks found in database');
        }
        
        filteredArtworks = [...galleryArtworks];
        initGalleryGrid();
        
    } catch (error) {
        console.error('Error loading artworks:', error);
        // Don't show sample data on error - keep empty
        galleryArtworks = [];
        filteredArtworks = [];
        initGalleryGrid();
    }
}

// getSampleArtworks function removed - no sample data needed

function initGalleryGrid() {
    displayArtworks(filteredArtworks);
    updateResultsCount();
}

function displayArtworks(artworks) {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    
    if (artworks.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-content">
                <i data-lucide="image" class="empty-icon"></i>
                <h3>No Artworks Available</h3>
                <p>There are currently no artworks in the gallery. Artists can add their work to showcase here!</p>
                <div class="empty-actions">
                    <button class="btn btn-hero" onclick="window.loadArtworksFromBackend()">
                        <i data-lucide="refresh-cw"></i>
                        Refresh Gallery
                    </button>
                </div>
            </div>
        `;
        galleryGrid.appendChild(emptyState);
        
        // Initialize Lucide icons
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    } else {
        artworks.forEach(artwork => {
            const artworkCard = createEnhancedArtworkCard(artwork);
            galleryGrid.appendChild(artworkCard);
        });
    }
}

function createEnhancedArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    
    const statusClass = `status-${artwork.status}`;
    const statusText = artwork.status === 'active' ? 'Available' : 
                     artwork.status === 'sold' ? 'Sold' : 'Featured';
    
    const buttonText = artwork.status === 'sold' ? 'Sold Out' : 'Place Bid';
    const buttonClass = artwork.status === 'sold' ? 'artwork-bid sold' : 'artwork-bid';
    const buttonDisabled = artwork.status === 'sold' ? 'disabled' : '';
    
    card.innerHTML = `
        <div class="artwork-status ${statusClass}">${statusText}</div>
        <img src="${artwork.image}" alt="${artwork.title}" class="artwork-image" loading="lazy" 
             onerror="this.src='https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'">
        <div class="artwork-info">
            <h3 class="artwork-title">${artwork.title}</h3>
            <p class="artwork-artist">by ${artwork.artist}</p>
            <p class="artwork-description" style="font-size: 0.875rem; color: var(--muted-foreground); margin-bottom: 1rem; line-height: 1.4;">
                ${artwork.description}
            </p>
            <div class="artwork-price">$${artwork.price ? artwork.price.toLocaleString() : '0'}</div>
            <div class="artwork-actions">
                <button class="artwork-preview" onclick="showArtworkPreview(${artwork.id})">
                    <i data-lucide="eye"></i>
                    Preview
                </button>
                <button class="${buttonClass}" ${buttonDisabled} onclick="handleBid(${artwork.id})">
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function initFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const statusFilter = document.getElementById('status-filter');
    
    [categoryFilter, priceFilter, statusFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const category = document.getElementById('category-filter').value;
    const priceRange = document.getElementById('price-filter').value;
    const status = document.getElementById('status-filter').value;
    
    filteredArtworks = galleryArtworks.filter(artwork => {
        // Category filter
        if (category !== 'all' && artwork.category !== category) return false;
        
        // Price filter
        if (priceRange !== 'all') {
            const price = artwork.price;
            switch (priceRange) {
                case '0-1000':
                    if (price > 1000) return false;
                    break;
                case '1000-3000':
                    if (price < 1000 || price > 3000) return false;
                    break;
                case '3000-5000':
                    if (price < 3000 || price > 5000) return false;
                    break;
                case '5000+':
                    if (price < 5000) return false;
                    break;
            }
        }
        
        // Status filter
        if (status !== 'all' && artwork.status !== status) return false;
        
        return true;
    });
    
    displayArtworks(filteredArtworks);
    updateResultsCount();
}


function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (filteredArtworks.length === 0) {
        resultsCount.textContent = 'No artworks available';
    } else {
        resultsCount.textContent = `Showing ${filteredArtworks.length} artworks`;
    }
}


// Artwork Preview Functionality
let currentPreviewArtwork = null;

window.showArtworkPreview = function(artworkId) {
    const artwork = galleryArtworks.find(art => art.id === artworkId);
    if (!artwork) {
        console.error('Artwork not found:', artworkId);
        return;
    }
    
    currentPreviewArtwork = artwork;
    
    // Populate modal with artwork data
    document.getElementById('preview-image').src = artwork.image;
    document.getElementById('preview-image').alt = artwork.title;
    document.getElementById('preview-title').textContent = artwork.title;
    document.getElementById('preview-artist').textContent = `by ${artwork.artist}`;
    document.getElementById('preview-description').textContent = artwork.description || 'No description available.';
    document.getElementById('preview-category').textContent = artwork.category || 'Abstract';
    document.getElementById('preview-price').textContent = `$${artwork.price ? artwork.price.toLocaleString() : '0'}`;
    document.getElementById('preview-status').textContent = artwork.status === 'active' ? 'Available' : artwork.status;
    
    // Update bid button based on status
    const bidBtn = document.getElementById('preview-bid-btn');
    if (artwork.status === 'sold') {
        bidBtn.textContent = 'Sold Out';
        bidBtn.disabled = true;
        bidBtn.classList.add('disabled');
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
    currentPreviewArtwork = null;
};

window.handleBidFromPreview = function() {
    if (currentPreviewArtwork) {
        closeArtworkPreview();
        handleBid(currentPreviewArtwork.id);
    }
};

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('artwork-preview-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeArtworkPreview();
            }
        });
    }
});
