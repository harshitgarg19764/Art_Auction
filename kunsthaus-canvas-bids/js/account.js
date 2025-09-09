// Account Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        window.location.href = 'login.html?return=account.html';
        return;
    }

    initAccountTabs();
    initProfileForm();
    initPasswordForm();
    initPreferencesForm();
    loadUserProfile();
    loadUserActivity();
    initPasswordStrength();
});

// Tab Management
function initAccountTabs() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const tabContents = document.querySelectorAll('.tab-content');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            
            // Update sidebar active state
            sidebarItems.forEach(si => si.classList.remove('active'));
            this.classList.add('active');
            
            // Update tab content
            tabContents.forEach(tc => tc.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Profile Form
function initProfileForm() {
    const profileForm = document.getElementById('profile-form');
    const cancelBtn = document.getElementById('cancel-profile');
    
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', loadUserProfile);
    }
}

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token');
        }
        
        const response = await fetch('/api/user/profile', {
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load profile');
        }
        
        const user = await response.json();
        
        // Populate form fields
        document.getElementById('profile-name').value = user.artist_profile?.name || user.username || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-user-type').value = user.is_artist ? 'artist' : 'collector';
        document.getElementById('profile-bio').value = user.artist_profile?.bio || '';
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('profile-email').value.trim(),
        artist_name: document.getElementById('profile-name').value.trim(),
        bio: document.getElementById('profile-bio').value.trim()
    };
    
    if (!formData.artist_name) {
        showNotification('Name is required', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token');
        }
        
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update profile');
        }
        
        const data = await response.json();
        
        showNotification('Profile updated successfully!', 'success');
        
        // Reload profile to show updated data
        loadUserProfile();
        
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Password Form
function initPasswordForm() {
    const passwordForm = document.getElementById('password-form');
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
    }
}

function initPasswordStrength() {
    const newPasswordInput = document.getElementById('new-password');
    const strengthIndicator = document.getElementById('password-strength-account');
    
    if (newPasswordInput && strengthIndicator) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrength(strengthIndicator, strength);
        });
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Special character');
    
    return { score, feedback };
}

function updatePasswordStrength(indicator, strength) {
    const { score, feedback } = strength;
    
    let strengthText = '';
    let strengthClass = '';
    
    if (score === 0) {
        strengthText = '';
        strengthClass = '';
    } else if (score <= 2) {
        strengthText = 'Weak';
        strengthClass = 'weak';
    } else if (score <= 3) {
        strengthText = 'Fair';
        strengthClass = 'fair';
    } else if (score <= 4) {
        strengthText = 'Good';
        strengthClass = 'good';
    } else {
        strengthText = 'Strong';
        strengthClass = 'strong';
    }
    
    indicator.innerHTML = strengthText ? `
        <div class="strength-bar ${strengthClass}">
            <div class="strength-fill"></div>
        </div>
        <div class="strength-text">${strengthText}</div>
        ${feedback.length > 0 ? `<div class="strength-feedback">Missing: ${feedback.join(', ')}</div>` : ''}
    ` : '';
}

async function handlePasswordUpdate(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('New password must be at least 8 characters long', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token');
        }
        
        const response = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update password');
        }
        
        showNotification('Password updated successfully!', 'success');
        e.target.reset();
        
        // Clear password strength indicator
        const strengthIndicator = document.getElementById('password-strength-account');
        if (strengthIndicator) {
            strengthIndicator.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Password update error:', error);
        showNotification(error.message || 'Failed to update password', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Preferences Form
function initPreferencesForm() {
    const preferencesForm = document.getElementById('preferences-form');
    
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', handlePreferencesUpdate);
    }
    
    // Load saved preferences
    loadPreferences();
}

function loadPreferences() {
    // Load theme preference
    const savedTheme = localStorage.getItem('kunsthaus_theme') || 'auto';
    const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (themeRadio) {
        themeRadio.checked = true;
    }
    
    // Load notification preferences
    const savedPrefs = JSON.parse(localStorage.getItem('kunsthaus_preferences') || '{}');
    
    document.getElementById('notify-auctions').checked = savedPrefs.notifyAuctions !== false;
    document.getElementById('notify-bids').checked = savedPrefs.notifyBids !== false;
    document.getElementById('notify-newsletter').checked = savedPrefs.notifyNewsletter === true;
    document.getElementById('notify-marketing').checked = savedPrefs.notifyMarketing === true;
}

function handlePreferencesUpdate(e) {
    e.preventDefault();
    
    // Save theme preference
    const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
    localStorage.setItem('kunsthaus_theme', selectedTheme);
    
    // Save notification preferences
    const preferences = {
        notifyAuctions: document.getElementById('notify-auctions').checked,
        notifyBids: document.getElementById('notify-bids').checked,
        notifyNewsletter: document.getElementById('notify-newsletter').checked,
        notifyMarketing: document.getElementById('notify-marketing').checked
    };
    
    localStorage.setItem('kunsthaus_preferences', JSON.stringify(preferences));
    
    // Apply theme change immediately
    if (window.applyTheme) {
        window.applyTheme(selectedTheme);
    }
    
    showNotification('Preferences saved successfully!', 'success');
}

// Activity Loading
async function loadUserActivity() {
    const activityList = document.getElementById('activity-list');
    
    if (!activityList) return;
    
    try {
        // Show loading state
        activityList.innerHTML = '<div class="loading">Loading activity...</div>';
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('No authentication token');
        }
        
        // Load user's artworks as activity
        const response = await fetch('/api/user/artworks', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load activity');
        }
        
        const data = await response.json();
        const artworks = data.artworks || [];
        
        // Convert artworks to activity format
        const activities = artworks.map(artwork => ({
            type: 'artwork',
            title: `Created artwork "${artwork.title}"`,
            amount: artwork.price ? `$${artwork.price.toLocaleString()}` : '',
            time: new Date(artwork.created_at).toLocaleDateString(),
            icon: 'image'
        }));
        
        // Add some mock login activity
        activities.unshift({
            type: 'login',
            title: 'Logged in to account',
            time: 'Today',
            icon: 'log-in'
        });
        
        if (activities.length === 0) {
            activityList.innerHTML = '<div class="no-activity">No recent activity</div>';
            return;
        }
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">
                        ${activity.amount ? `<span class="activity-amount">${activity.amount}</span>` : ''}
                        <span class="activity-time">${activity.time}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Re-initialize Lucide icons
        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
        
    } catch (error) {
        console.error('Error loading activity:', error);
        activityList.innerHTML = '<div class="error">Failed to load activity</div>';
    }
}

// Notification System (reuse from main script)
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