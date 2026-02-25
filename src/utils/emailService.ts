// EmailJS Email Notification Service
// Free service - no backend required!

// ============================================
// CONFIGURATION - Update these values!
// ============================================
const EMAILJS_CONFIG = {
    serviceId: 'service_ryxggsl',
    loginTemplateId: 'template_wyw6slw',    // Welcome/Login notification
    deleteTemplateId: 'template_faoxn1n',   // Account deletion notification
    publicKey: '7EA5pgn595Ku0EKJ-'
};

declare global {
    interface Window {
        emailjs?: any;
    }
}

// Load EmailJS SDK
const loadEmailJS = () => {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            resolve(window.emailjs);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            window.emailjs.init(EMAILJS_CONFIG.publicKey);
            resolve(window.emailjs);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

/**
 * Send login notification email to user
 * @param {Object} user - User object with name and email
 */
export async function sendLoginNotification(user: any) {
    if (!user?.email) return;

    try {
        const emailjs = await loadEmailJS() as any;

        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.loginTemplateId,
            {
                to_email: user.email,
                user_name: user.name || 'User',
                login_time: new Date().toLocaleString(),
                device_info: navigator.userAgent.split('(')[1]?.split(')')[0] || 'Unknown Device'
            }
        );

        console.log('Login notification email sent successfully');
    } catch (error) {
        console.error('Failed to send login notification:', error);
        // Don't throw - email failure shouldn't break login
    }
}

/**
 * Send account deletion notification email to user
 * @param {Object} user - User object with name and email
 */
export async function sendAccountDeletedNotification(user: any) {
    if (!user?.email) return;

    try {
        const emailjs = await loadEmailJS() as any;

        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.deleteTemplateId,
            {
                to_email: user.email,
                user_name: user.name || 'User',
                delete_time: new Date().toLocaleString()
            }
        );

        console.log('Account deletion notification email sent successfully');
    } catch (error) {
        console.error('Failed to send deletion notification:', error);
        // Don't throw - email failure shouldn't break deletion
    }
}
