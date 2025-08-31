/**
 * Authentication State Management
 * Handles user authentication state across the application
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authListeners = [];
        this.init();
    }

    async init() {
        // Check for existing session on page load
        await this.checkAuthState();
        this.setupEventListeners();
    }

    async checkAuthState() {
        try {
            // Check localStorage first for quick UI update
            const storedUser = localStorage.getItem('kunsthaus_user');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                this.updateUIBasedOnAuth(true);
            }

            // Verify session with server
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                localStorage.setItem('kunsthaus_user', JSON.stringify(data.user));
                this.updateUIBasedOnAuth(true);
                return true;
            } else if (response.status === 401) {
                // 401 is expected when not logged in - not an error
                this.currentUser = null;
                localStorage.removeItem('kunsthaus_user');
                this.updateUIBasedOnAuth(false);
                return false;
            } else {
                throw new Error(`Auth check failed: ${response.status}`);
            }
        } catch (error) {
            // Only log actual errors, not expected 401s
            if (!error.message.includes('401') && !error.message.includes('Not authenticated')) {
                console.error('Auth check failed:', error);
            }
            this.currentUser = null;
            localStorage.removeItem('kunsthaus_user');
            this.updateUIBasedOnAuth(false);
            return false;
        }
    }

    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Login failed');
            }

            const data = await response.json();
            this.currentUser = data.user;
            localStorage.setItem('kunsthaus_user', JSON.stringify(data.user));
            this.updateUIBasedOnAuth(true);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            localStorage.removeItem('kunsthaus_user');
            this.updateUIIOnLogout();
        }
    }

    updateUIBasedOnAuth(isAuthenticated) {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userNameDisplay = document.getElementById('user-display-name');
        const addArtworkLink = document.getElementById('add-artwork-link');

        if (isAuthenticated && this.currentUser) {
            // Show user menu, hide auth buttons
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (userNameDisplay) {
                userNameDisplay.textContent = this.currentUser.name || 'Account';
            }
            
            // Show/hide add artwork link based on user type
            if (addArtworkLink) {
                if (this.currentUser.user_type === 'artist' || this.currentUser.user_type === 'both') {
                    addArtworkLink.style.display = 'flex';
                } else {
                    addArtworkLink.style.display = 'none';
                }
            }
        } else {
            // Show auth buttons, hide user menu
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (addArtworkLink) addArtworkLink.style.display = 'none';
        }

        // Re-initialize theme icon after UI changes
        setTimeout(() => {
            if (window.updateThemeIcon) {
                window.updateThemeIcon();
            }
        }, 100);

        // Notify all listeners about auth state change
        this.notifyAuthListeners(isAuthenticated);
    }

    updateUIIOnLogout() {
        // Update UI elements to reflect logged out state
        this.updateUIBasedOnAuth(false);
        
        // If on a protected page, redirect to home
        const protectedPages = ['account.html', 'profile.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }

    // Observer pattern for auth state changes
    addAuthListener(callback) {
        this.authListeners.push(callback);
        // Return unsubscribe function
        return () => {
            this.authListeners = this.authListeners.filter(cb => cb !== callback);
        };
    }

    notifyAuthListeners(isAuthenticated) {
        this.authListeners.forEach(callback => {
            try {
                callback(isAuthenticated, this.currentUser);
            } catch (error) {
                console.error('Auth listener error:', error);
            }
        });
    }

    setupEventListeners() {
        // Handle logout button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager only if not already initialized
if (!window.authManager) {
    window.authManager = new AuthManager();
}

// Export for ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = document.authManager;
}
