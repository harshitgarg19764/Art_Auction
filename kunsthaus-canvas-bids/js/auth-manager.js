// Global Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.isInitialized = false;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Check for existing auth on page load
        this.checkAuthStatus();
        
        // Set up logout handler
        this.setupLogoutHandler();
        
        // Update UI based on auth status
        this.updateAuthUI();
        
        this.isInitialized = true;
    }

    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('kunsthaus_user');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.notifyAuthListeners(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        } else {
            this.currentUser = null;
            this.notifyAuthListeners(false);
        }
    }

    // Alias for backward compatibility
    checkAuthState() {
        return this.checkAuthStatus();
    }

    updateAuthUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userDisplayName = document.getElementById('user-display-name');
        const addArtworkLink = document.getElementById('add-artwork-link');
        const myCollectionLink = document.getElementById('my-collection-link');

        if (this.currentUser) {
            // User is logged in
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            
            // Update username display
            if (userDisplayName) {
                const displayName = this.currentUser.username || 
                                  this.currentUser.email?.split('@')[0] || 
                                  'User';
                userDisplayName.textContent = displayName;
            }

            // Show artist-specific links if user is an artist
            if (this.currentUser.is_artist) {
                if (addArtworkLink) addArtworkLink.style.display = 'flex';
            }
            
            // Always show collection link for logged-in users
            if (myCollectionLink) myCollectionLink.style.display = 'flex';

        } else {
            // User is not logged in
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (addArtworkLink) addArtworkLink.style.display = 'none';
            if (myCollectionLink) myCollectionLink.style.display = 'none';
        }
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    logout() {
        // Clear stored data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('kunsthaus_user');
        
        // Reset current user
        this.currentUser = null;
        
        // Notify listeners
        this.notifyAuthListeners(false);
        
        // Update UI
        this.updateAuthUI();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('You have been logged out successfully.', 'info');
        }
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    login(userData, token) {
        // Store auth data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('kunsthaus_user', JSON.stringify(userData));
        
        // Set current user
        this.currentUser = userData;
        
        // Notify listeners
        this.notifyAuthListeners(true);
        
        // Update UI
        this.updateAuthUI();
    }

    isAuthenticated() {
        return this.currentUser !== null && localStorage.getItem('auth_token') !== null;
    }

    getAuthToken() {
        return localStorage.getItem('auth_token');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Auth listeners for other components
    addAuthListener(callback) {
        this.authListeners.push(callback);
    }

    removeAuthListener(callback) {
        this.authListeners = this.authListeners.filter(listener => listener !== callback);
    }

    notifyAuthListeners(isAuthenticated) {
        this.authListeners.forEach(callback => {
            try {
                callback(isAuthenticated, this.currentUser);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    // Authenticated fetch helper
    async authenticatedFetch(url, options = {}) {
        const token = this.getAuthToken();
        
        if (!token) {
            throw new Error('No authentication token available');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle token expiration
        if (response.status === 401) {
            this.logout();
            throw new Error('Session expired. Please log in again.');
        }

        return response;
    }

    // Method to manually refresh the UI (useful for debugging)
    refreshUI() {
        this.checkAuthStatus();
        this.updateAuthUI();
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Add a global function to refresh auth UI (for debugging)
window.refreshAuthUI = () => {
    if (window.authManager) {
        window.authManager.refreshUI();
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Utility function for authenticated requests (backward compatibility)
window.authenticatedFetch = (url, options = {}) => {
    return window.authManager.authenticatedFetch(url, options);
};

// Show notification function (if not already defined)
if (!window.showNotification) {
    window.showNotification = function(message, type = 'info') {
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
    };
}