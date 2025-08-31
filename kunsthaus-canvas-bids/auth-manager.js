// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.init();
    }

    init() {
        // Check for existing auth token and user data
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('kunsthaus_user');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
                this.logout();
            }
        }
    }

    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        return !!(token && this.currentUser);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async checkAuthState() {
        return this.isAuthenticated();
    }

    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            
            // Store auth data
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('kunsthaus_user', JSON.stringify(data.user));
            this.currentUser = data.user;

            // Notify listeners
            this.notifyAuthListeners(true);

            return data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        // Clear auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('kunsthaus_user');
        this.currentUser = null;

        // Notify listeners
        this.notifyAuthListeners(false);
    }

    addAuthListener(callback) {
        this.authListeners.push(callback);
    }

    removeAuthListener(callback) {
        this.authListeners = this.authListeners.filter(listener => listener !== callback);
    }

    notifyAuthListeners(isAuthenticated) {
        this.authListeners.forEach(callback => {
            try {
                callback(isAuthenticated);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    updateUIBasedOnAuth(isAuthenticated) {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userNameDisplay = document.getElementById('user-name');
        const addArtworkLink = document.getElementById('add-artwork-link');
        const myCollectionLink = document.getElementById('my-collection-link');
        
        if (isAuthenticated && this.currentUser) {
            // Show user menu, hide auth buttons
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            
            // Update user name display
            if (userNameDisplay) {
                userNameDisplay.textContent = this.currentUser.username || 'User';
            }
            
            // Show add artwork link for artists
            if (addArtworkLink && this.currentUser.is_artist) {
                addArtworkLink.style.display = 'block';
            }
            
            // Show collection link for collectors (non-artists)
            if (myCollectionLink && !this.currentUser.is_artist) {
                myCollectionLink.style.display = 'block';
            }
        } else {
            // Show auth buttons, hide user menu
            if (authButtons) authButtons.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            
            // Hide user-specific links
            if (addArtworkLink) {
                addArtworkLink.style.display = 'none';
            }
            if (myCollectionLink) {
                myCollectionLink.style.display = 'none';
            }
        }
    }
}

// Initialize global auth manager
window.authManager = new AuthManager();

// Update UI on page load
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = window.authManager.isAuthenticated();
    window.authManager.updateUIBasedOnAuth(isAuthenticated);
    
    // Add logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.authManager.logout();
            window.location.href = 'index.html';
        });
    }
});