// Authentication Page Functionality

document.addEventListener('DOMContentLoaded', function () {
    initAuthForms();
    initPasswordStrength();
    initForgotPassword();
});

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

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Enhanced password validation
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: `Password must be at least ${minLength} characters long` };
    }

    if (!hasUpperCase) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!hasLowerCase) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!hasNumbers) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (!hasSpecialChar) {
        return { isValid: false, message: 'Password must contain at least one special character' };
    }

    return { isValid: true, message: 'Password is strong' };
}

// Rate limiting for login attempts
let loginAttempts = 0;
let lastLoginAttempt = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit() {
    const now = Date.now();

    // Reset attempts if lockout period has passed
    if (now - lastLoginAttempt > LOCKOUT_DURATION) {
        loginAttempts = 0;
    }

    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - lastLoginAttempt)) / 60000);
        throw new Error(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
    }

    return true;
}

function recordLoginAttempt(success) {
    if (success) {
        loginAttempts = 0;
    } else {
        loginAttempts++;
        lastLoginAttempt = Date.now();
    }
}

function initAuthForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember') ? document.getElementById('remember').checked : false;

    // Validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    try {
        checkRateLimit();
    } catch (error) {
        showNotification(error.message, 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
    }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            recordLoginAttempt(false);
            throw new Error(data.error || 'Login failed');
        }

        recordLoginAttempt(true);
        showNotification('Welcome back! Login successful.', 'success');

        // Store auth token and user data
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
        }
        
        if (data.user) {
            const userData = {
                id: data.user.id,
                email: data.user.email,
                username: data.user.username,
                is_artist: data.user.is_artist,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('kunsthaus_user', JSON.stringify(userData));
            
            // Update auth manager
            if (window.authManager) {
                window.authManager.currentUser = userData;
                window.authManager.notifyAuthListeners(true);
            }
        }

        // Redirect based on user type or return URL
        const returnUrl = new URLSearchParams(window.location.search).get('return') || 'index.html';
        setTimeout(() => {
            window.location.href = returnUrl === 'current' ? 'gallery.html' : returnUrl;
        }, 800);

    }).catch((err) => {
        showNotification(err.message || 'Login error', 'error');
    }).finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function handleSignupSubmit(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const userType = document.getElementById('userType').value;
    const terms = document.getElementById('terms').checked;
    const newsletter = document.getElementById('newsletter') ? document.getElementById('newsletter').checked : false;

    // Enhanced validation
    if (!firstName || !lastName) {
        showNotification('Please enter your full name', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    if (!terms) {
        showNotification('Please accept the Terms of Service', 'error');
        return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showNotification(passwordValidation.message, 'error');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    // Create bio based on user type
    let bio = '';
    if (userType === 'artist') {
        bio = 'Artist and creator at kunstHaus';
    } else if (userType === 'both') {
        bio = 'Artist and art collector at kunstHaus';
    } else {
        bio = 'Art enthusiast and collector at kunstHaus';
    }

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: `${firstName}_${lastName}`.toLowerCase().replace(/\s+/g, '_'),
            email,
            password,
            is_artist: userType === 'artist' || userType === 'both',
            artist_name: userType === 'artist' || userType === 'both' ? `${firstName} ${lastName}` : undefined,
            bio: bio,
            specialty: userType === 'artist' ? 'Contemporary Art' : undefined
        })
    }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || 'Signup failed');
        }
        showNotification(`Welcome to kunstHaus, ${firstName}! Account created successfully.`, 'success');
        
        // Store auth token and user data
        if (data.access_token) {
            localStorage.setItem('auth_token', data.access_token);
        }
        
        if (data.user) {
            const userData = {
                id: data.user.id,
                username: data.user.username,
                email: data.user.email,
                is_artist: data.user.is_artist,
                newsletter: newsletter,
                signupTime: new Date().toISOString()
            };
            localStorage.setItem('kunsthaus_user', JSON.stringify(userData));
            
            // Update auth manager
            if (window.authManager) {
                window.authManager.currentUser = userData;
                window.authManager.notifyAuthListeners(true);
            }
        }
        setTimeout(() => { window.location.href = 'gallery.html'; }, 800);
    }).catch((err) => {
        showNotification(err.message || 'Signup error', 'error');
    }).finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('password-strength');

    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function () {
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

// Forgot Password functionality
function initForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
}

function showForgotPasswordModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('forgot-password-modal');
    if (!modal) {
        modal = createForgotPasswordModal();
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function createForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.id = 'forgot-password-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Reset Password</h2>
                <button class="modal-close" onclick="closeForgotPasswordModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <form id="forgot-password-form">
                <div class="form-group">
                    <label class="form-label" for="reset-email">Email Address</label>
                    <input type="email" id="reset-email" class="form-input" required 
                           placeholder="Enter your email address">
                </div>
                <p class="form-help">
                    We'll send you a link to reset your password.
                </p>
                <button type="submit" class="btn btn-hero form-submit">Send Reset Link</button>
            </form>
            <div class="form-footer">
                <p>Remember your password? <a href="#" onclick="closeForgotPasswordModal()">Back to login</a></p>
            </div>
        </div>
    `;

    // Add event listeners
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeForgotPasswordModal();
        }
    });

    const form = modal.querySelector('#forgot-password-form');
    form.addEventListener('submit', handleForgotPasswordSubmit);

    return modal;
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

async function handleForgotPasswordSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('reset-email').value;

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        // Simulate password reset request (since we don't have email service)
        await new Promise(resolve => setTimeout(resolve, 1500));

        showNotification('Password reset link sent! Check your email.', 'success');
        closeForgotPasswordModal();

    } catch (error) {
        showNotification('Failed to send reset link. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}