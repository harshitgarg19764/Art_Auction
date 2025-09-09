// Add Artwork Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated and is an artist
    checkArtistAccess();
    
    // Initialize form functionality
    initAddArtworkForm();
    initPreview();
    
    // Initialize Lucide icons
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
});

async function checkArtistAccess() {
    try {
        // Wait for auth manager to be ready
        if (!window.authManager) {
            setTimeout(checkArtistAccess, 100);
            return;
        }
        
        // Remove authentication redirect - let page load normally
        // The global auth system handles UI visibility
        
        const user = window.authManager.getCurrentUser();
        if (user && user.username) {
            // Update preview with artist name if user is logged in
            document.getElementById('preview-artist').textContent = `by ${user.username}`;
        }
        
    } catch (error) {
        console.error('Error checking artist access:', error);
    }
}

function initAddArtworkForm() {
    const form = document.getElementById('add-artwork-form');
    if (form) {
        form.addEventListener('submit', handleAddArtwork);
    }
}

function initPreview() {
    // Update preview when form fields change
    const fields = [
        { id: 'artwork-title', preview: 'preview-title', default: 'Artwork Title' },
        { id: 'artwork-price', preview: 'preview-price-amount', default: '$0', prefix: '$' },
        { id: 'artwork-medium', preview: 'preview-medium', default: 'Medium' },
        { id: 'artwork-dimensions', preview: 'preview-dimensions', default: 'Dimensions' },
        { id: 'artwork-year', preview: 'preview-year', default: 'Year' },
        { id: 'artwork-image', preview: 'preview-img', default: '', type: 'image' }
    ];
    
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const preview = document.getElementById(field.preview);
        
        if (input && preview) {
            input.addEventListener('input', function() {
                let value = this.value.trim();
                
                if (field.type === 'image') {
                    if (value && isValidImageUrl(value)) {
                        preview.src = value;
                        preview.onerror = function() {
                            this.src = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop';
                        };
                    }
                } else {
                    if (!value) {
                        value = field.default;
                    } else if (field.prefix) {
                        value = field.prefix + parseInt(value).toLocaleString();
                    }
                    preview.textContent = value;
                }
            });
        }
    });
}

function isValidImageUrl(url) {
    try {
        new URL(url);
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes('unsplash.com') || url.includes('images.');
    } catch {
        return false;
    }
}

async function handleAddArtwork(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        title: document.getElementById('artwork-title').value.trim(),
        description: document.getElementById('artwork-description').value.trim(),
        starting_price: parseFloat(document.getElementById('artwork-price').value),
        image_url: document.getElementById('artwork-image').value.trim(),
        category: document.getElementById('artwork-category').value
    };
    
    // Validate required fields
    if (!formData.title) {
        showNotification('Please enter an artwork title', 'error');
        return;
    }
    
    if (!formData.starting_price || formData.starting_price < 1) {
        showNotification('Please enter a valid starting price', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i data-lucide="loader"></i> Adding Artwork...';
    submitBtn.disabled = true;
    
    // Re-initialize icons for the loading spinner
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
    
    try {
        // Debug: Check current user
        const currentUser = JSON.parse(localStorage.getItem('kunsthaus_user') || '{}');
        console.log('Current user:', currentUser);
        console.log('Is artist:', currentUser.is_artist);
        console.log('Sending artwork data:', formData);

        // Check if token exists
        const token = localStorage.getItem('auth_token');
        if (!token) {
            showNotification('Please login to add artwork', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        // Use authenticated fetch if available, otherwise fallback to manual token handling
        let response;
        if (window.authManager && window.authManager.authenticatedFetch) {
            response = await window.authManager.authenticatedFetch('/api/artworks', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        } else {
            // Fallback method
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No authentication token');
            }

            response = await fetch('/api/artworks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Server response:', response.status, error);
            
            // Handle expired token
            if (response.status === 401 && error.msg && error.msg.includes('expired')) {
                if (window.authManager) {
                    window.authManager.handleTokenExpiration();
                } else {
                    // Fallback if auth manager not available
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('kunsthaus_user');
                    showNotification('Your session has expired. Please login again.', 'error');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
                return;
            }
            
            throw new Error(error.error || error.msg || `Failed to add artwork (${response.status})`);
        }
        
        const artwork = await response.json();
        
        // Show success notification - multiple methods for reliability
        console.log('Artwork added successfully:', artwork);
        
        // Method 1: Enhanced notification
        try {
            showEnhancedSuccessNotification(artwork);
        } catch (error) {
            console.error('Error showing enhanced notification:', error);
        }
        
        // Method 2: Simple notification
        try {
            showNotification('🎉 Artwork added successfully! Redirecting to gallery...', 'success');
        } catch (error) {
            console.error('Error showing simple notification:', error);
        }
        
        // Method 3: Browser alert as ultimate fallback
        const artworkTitle = artwork && artwork.title ? artwork.title : 'Your artwork';
        alert('✅ SUCCESS!\n\nArtwork "' + artworkTitle + '" has been added!\n\n👁️ Now visible in Gallery\n🔨 Available in Auctions\n\nRedirecting to gallery...');
        
        // Method 4: Console success message
        console.log('%c✅ ARTWORK ADDED SUCCESSFULLY!', 'color: green; font-size: 16px; font-weight: bold;');
        console.log('Title:', artworkTitle);
        console.log('ID:', artwork.id);
        console.log('Artist:', artwork.artist);
        
        // Reset form
        e.target.reset();
        resetPreview();
        
        // Redirect to gallery to see the new artwork
        setTimeout(() => {
            window.location.href = 'gallery.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error adding artwork:', error);
        showNotification(error.message || 'Failed to add artwork', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Re-initialize icons
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }
}

function resetPreview() {
    document.getElementById('preview-title').textContent = 'Artwork Title';
    document.getElementById('preview-price-amount').textContent = '$0';
    document.getElementById('preview-medium').textContent = 'Medium';
    document.getElementById('preview-dimensions').textContent = 'Dimensions';
    document.getElementById('preview-year').textContent = 'Year';
    document.getElementById('preview-img').src = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop';
}

// Utility function to show notifications (if not already defined)
function showEnhancedSuccessNotification(artwork) {
    console.log('Showing success notification for:', artwork);
    
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    
    const artworkTitle = artwork && artwork.title ? artwork.title : 'Your Artwork';
    
    notification.innerHTML = `
        <div class="notification-header">
            <i data-lucide="check-circle"></i>
            <h3>Artwork Added Successfully!</h3>
        </div>
        <div class="notification-content">
            <p><strong>"${artworkTitle}"</strong> has been added to kunstHaus</p>
            <div class="notification-details">
                <div class="detail-item">
                    <i data-lucide="eye"></i>
                    <span>Now visible in Gallery</span>
                </div>
                <div class="detail-item">
                    <i data-lucide="gavel"></i>
                    <span>Available for bidding in Auctions</span>
                </div>
                <div class="detail-item">
                    <i data-lucide="users"></i>
                    <span>Visible to all users</span>
                </div>
            </div>
            <p class="redirect-info">Redirecting to gallery in 4 seconds...</p>
        </div>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '350px',
        padding: '1.5rem',
        borderRadius: '12px',
        backgroundColor: '#10b981',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
    });
    
    // Style the header
    const header = notification.querySelector('.notification-header');
    Object.assign(header.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
    });
    
    const headerIcon = header.querySelector('i');
    Object.assign(headerIcon.style, {
        width: '24px',
        height: '24px'
    });
    
    const headerTitle = header.querySelector('h3');
    Object.assign(headerTitle.style, {
        margin: '0',
        fontSize: '1.1rem',
        fontWeight: '600'
    });
    
    // Style the content
    const content = notification.querySelector('.notification-content');
    Object.assign(content.style, {
        fontSize: '0.9rem',
        lineHeight: '1.4'
    });
    
    // Style the details
    const details = notification.querySelector('.notification-details');
    Object.assign(details.style, {
        margin: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    });
    
    const detailItems = notification.querySelectorAll('.detail-item');
    detailItems.forEach(item => {
        Object.assign(item.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            opacity: '0.9'
        });
        
        const icon = item.querySelector('i');
        Object.assign(icon.style, {
            width: '16px',
            height: '16px'
        });
    });
    
    // Style redirect info
    const redirectInfo = notification.querySelector('.redirect-info');
    Object.assign(redirectInfo.style, {
        fontSize: '0.8rem',
        opacity: '0.8',
        fontStyle: 'italic',
        marginTop: '1rem',
        marginBottom: '0'
    });
    
    document.body.appendChild(notification);
    
    // Initialize Lucide icons in the notification
    if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function showNotification(message, type = 'info') {
    // Check if the function exists in the global scope and is not this same function
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback notification implementation
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