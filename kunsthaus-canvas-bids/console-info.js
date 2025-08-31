// Console Information and Error Suppression for kunstHaus

// Add informational message about 401 errors
console.info(`
🎨 kunstHaus Authentication System
==================================

ℹ️  The 401 (UNAUTHORIZED) errors you see are NORMAL behavior.
   They occur when the system checks if you're logged in and finds you're not.
   
✅ This is expected and not a problem!

🔧 To test the authentication system:
   1. Visit signup.html to create an account
   2. Visit login.html to sign in
   3. Visit debug-auth.html to run diagnostics

📚 For more info, see AUTHENTICATION_SETUP.md
`);

// Optionally suppress 401 error messages in console (uncomment if desired)
/*
const originalFetch = window.fetch;
window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(error => {
        // Suppress 401 errors from /api/auth/me endpoint
        if (args[0] && args[0].includes('/api/auth/me') && error.message.includes('401')) {
            // Silently handle expected 401 errors
            return Promise.reject(error);
        }
        // Re-throw other errors normally
        return Promise.reject(error);
    });
};
*/