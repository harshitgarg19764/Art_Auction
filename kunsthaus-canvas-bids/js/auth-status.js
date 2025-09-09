// Authentication Status Indicator

document.addEventListener('DOMContentLoaded', function() {
    // Only show status indicator in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        createAuthStatusIndicator();
    }
});

function createAuthStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'auth-status-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-family: monospace;
        z-index: 10000;
        transition: all 0.3s ease;
        cursor: pointer;
        user-select: none;
    `;
    
    updateAuthStatus(indicator);
    
    // Update status when auth state changes
    if (window.authManager) {
        window.authManager.addAuthListener(() => {
            updateAuthStatus(indicator);
        });
    }
    
    // Click to toggle visibility
    let isMinimized = false;
    indicator.addEventListener('click', function() {
        isMinimized = !isMinimized;
        if (isMinimized) {
            this.style.transform = 'scale(0.8)';
            this.style.opacity = '0.6';
        } else {
            this.style.transform = 'scale(1)';
            this.style.opacity = '1';
        }
    });
    
    document.body.appendChild(indicator);
}

function updateAuthStatus(indicator) {
    const isAuthenticated = window.authManager && window.authManager.isAuthenticated();
    const currentUser = window.authManager && window.authManager.getCurrentUser();
    
    if (isAuthenticated && currentUser) {
        indicator.innerHTML = `
            🟢 Authenticated<br>
            👤 ${currentUser.name}<br>
            📧 ${currentUser.email}
        `;
        indicator.style.background = 'rgba(40, 167, 69, 0.9)';
    } else {
        indicator.innerHTML = `
            🔴 Not Authenticated<br>
            ℹ️ 401 errors are normal<br>
            👆 Click to minimize
        `;
        indicator.style.background = 'rgba(108, 117, 125, 0.9)';
    }
}