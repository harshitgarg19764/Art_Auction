// My Collection Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        window.location.href = 'login.html?return=my-collection.html';
        return;
    }

    // Check if user is a collector (not an artist)
    const currentUser = window.authManager.getCurrentUser();
    if (currentUser && currentUser.is_artist) {
        showNotification('This page is for art collectors. Artists can use "Add Artwork" instead.', 'info');
        setTimeout(() => {
            window.location.href = 'add-artwork.html';
        }, 2000);
        return;
    }

    initCollectionPage();
    loadCollection();
    initCollectionFilters();
    initAddToCollection();
});

// Initialize collection page
function initCollectionPage() {
    // Add to collection button
    const addBtn = document.getElementById('add-to-collection-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openModal('add-collection-modal'));
    }

    // Browse gallery button
    const browseBtn = document.getElementById('browse-gallery-btn');
    if (browseBtn) {
        browseBtn.addEventListener('click', () => {
            window.location.href = 'gallery.html';
        });
    }

    // View toggle buttons
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            const grid = document.getElementById('collection-grid');
            if (grid) {
                grid.className = view === 'list' ? 'collection-list' : 'collection-grid';
            }
        });
    });
}

// Load user's collection
async function loadCollection() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        // For now, load from localStorage as a demo
        // In a real app, this would be an API call to get user's collection
        const collection = JSON.parse(localStorage.getItem('user_collection') || '[]');
        
        displayCollection(collection);
        updateCollectionStats(collection);
        
    } catch (error) {
        console.error('Error loading collection:', error);
        showNotification('Failed to load collection', 'error');
    }
}

// Display collection items
function displayCollection(collection) {
    const grid = document.getElementById('collection-grid');
    const emptyState = document.getElementById('empty-collection');
    
    if (!grid) return;

    if (collection.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = collection.map(item => `
        <div class="collection-item" data-category="${item.category}" data-price="${item.price || 0}">
            <div class="collection-image">
                <img src="${item.image || 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop'}" 
                     alt="${item.title}" loading="lazy">
                <div class="collection-overlay">
                    <button class="collection-btn" onclick="viewCollectionItem('${item.id}')">
                        <i data-lucide="eye"></i>
                    </button>
                    <button class="collection-btn" onclick="editCollectionItem('${item.id}')">
                        <i data-lucide="edit"></i>
                    </button>
                    <button class="collection-btn delete-btn" onclick="removeFromCollection('${item.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            <div class="collection-info">
                <h3 class="collection-title">${item.title}</h3>
                <p class="collection-artist">by ${item.artist}</p>
                <div class="collection-meta">
                    <span class="collection-category">${item.category}</span>
                    ${item.price ? `<span class="collection-price">$${item.price.toLocaleString()}</span>` : ''}
                </div>
                <div class="collection-date">
                    Added: ${new Date(item.dateAdded).toLocaleDateString()}
                </div>
                ${item.notes ? `<p class="collection-notes">${item.notes}</p>` : ''}
            </div>
        </div>
    `).join('');

    // Re-initialize Lucide icons
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
}

// Update collection statistics
function updateCollectionStats(collection) {
    const totalArtworks = collection.length;
    const totalValue = collection.reduce((sum, item) => sum + (item.price || 0), 0);
    const uniqueArtists = new Set(collection.map(item => item.artist)).size;
    const latestAddition = collection.length > 0 ? 
        Math.max(...collection.map(item => new Date(item.dateAdded).getTime())) : null;

    // Update stat displays
    const totalArtworksEl = document.getElementById('total-artworks');
    const totalValueEl = document.getElementById('total-value');
    const totalArtistsEl = document.getElementById('total-artists');
    const latestAdditionEl = document.getElementById('latest-addition');

    if (totalArtworksEl) totalArtworksEl.textContent = totalArtworks;
    if (totalValueEl) totalValueEl.textContent = `$${totalValue.toLocaleString()}`;
    if (totalArtistsEl) totalArtistsEl.textContent = uniqueArtists;
    if (latestAdditionEl) {
        latestAdditionEl.textContent = latestAddition ? 
            new Date(latestAddition).toLocaleDateString() : '-';
    }
}

// Initialize collection filters
function initCollectionFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
}

// Apply filters to collection
function applyFilters() {
    const categoryFilter = document.getElementById('category-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    const items = document.querySelectorAll('.collection-item');

    // Filter by category
    items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        const shouldShow = !categoryFilter || itemCategory === categoryFilter;
        item.style.display = shouldShow ? 'block' : 'none';
    });

    // Sort items
    const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
    const grid = document.getElementById('collection-grid');

    if (sortFilter && grid) {
        visibleItems.sort((a, b) => {
            switch (sortFilter) {
                case 'price-desc':
                    return parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price'));
                case 'price-asc':
                    return parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price'));
                case 'title':
                    return a.querySelector('.collection-title').textContent.localeCompare(
                        b.querySelector('.collection-title').textContent
                    );
                default:
                    return 0;
            }
        });

        // Re-append sorted items
        visibleItems.forEach(item => grid.appendChild(item));
    }
}

// Initialize add to collection functionality
function initAddToCollection() {
    const form = document.getElementById('add-collection-form');
    if (form) {
        form.addEventListener('submit', handleAddToCollection);
    }
}

// Handle adding artwork to collection
async function handleAddToCollection(e) {
    e.preventDefault();

    const formData = {
        id: Date.now().toString(), // Simple ID generation
        title: document.getElementById('artwork-title').value.trim(),
        artist: document.getElementById('artist-name').value.trim(),
        category: document.getElementById('artwork-category').value,
        price: parseFloat(document.getElementById('purchase-price').value) || 0,
        purchaseDate: document.getElementById('purchase-date').value,
        notes: document.getElementById('artwork-notes').value.trim(),
        image: document.getElementById('artwork-image').value.trim(),
        dateAdded: new Date().toISOString()
    };

    if (!formData.title || !formData.artist || !formData.category) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    try {
        // Get existing collection
        const collection = JSON.parse(localStorage.getItem('user_collection') || '[]');
        
        // Add new item
        collection.push(formData);
        
        // Save to localStorage (in a real app, this would be an API call)
        localStorage.setItem('user_collection', JSON.stringify(collection));

        showNotification('Artwork added to your collection!', 'success');
        
        // Reset form and close modal
        e.target.reset();
        closeModal('add-collection-modal');
        
        // Reload collection display
        loadCollection();

    } catch (error) {
        console.error('Error adding to collection:', error);
        showNotification('Failed to add artwork to collection', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// View collection item details
function viewCollectionItem(itemId) {
    const collection = JSON.parse(localStorage.getItem('user_collection') || '[]');
    const item = collection.find(i => i.id === itemId);
    
    if (item) {
        // Create a simple view modal (you could expand this)
        alert(`${item.title} by ${item.artist}\nCategory: ${item.category}\nPrice: $${item.price}\nNotes: ${item.notes || 'None'}`);
    }
}

// Edit collection item
function editCollectionItem(itemId) {
    const collection = JSON.parse(localStorage.getItem('user_collection') || '[]');
    const item = collection.find(i => i.id === itemId);
    
    if (item) {
        // Pre-fill the form with existing data
        document.getElementById('artwork-title').value = item.title;
        document.getElementById('artist-name').value = item.artist;
        document.getElementById('artwork-category').value = item.category;
        document.getElementById('purchase-price').value = item.price;
        document.getElementById('purchase-date').value = item.purchaseDate;
        document.getElementById('artwork-notes').value = item.notes;
        document.getElementById('artwork-image').value = item.image;
        
        // Remove the old item (will be re-added when form is submitted)
        removeFromCollection(itemId, false);
        
        // Open the modal
        openModal('add-collection-modal');
    }
}

// Remove item from collection
function removeFromCollection(itemId, showConfirm = true) {
    if (showConfirm && !confirm('Are you sure you want to remove this artwork from your collection?')) {
        return;
    }

    try {
        const collection = JSON.parse(localStorage.getItem('user_collection') || '[]');
        const updatedCollection = collection.filter(item => item.id !== itemId);
        
        localStorage.setItem('user_collection', JSON.stringify(updatedCollection));
        
        if (showConfirm) {
            showNotification('Artwork removed from collection', 'success');
        }
        
        loadCollection();
        
    } catch (error) {
        console.error('Error removing from collection:', error);
        showNotification('Failed to remove artwork', 'error');
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Notification system (reuse from other files)
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