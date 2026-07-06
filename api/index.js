// api/index.js - With better error handling
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    try {
        // Read the HTML file
        const htmlPath = path.join(__dirname, '..', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Get config from environment variables
        const config = {
            apiKey: process.env.FIREBASE_API_KEY || '',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
            projectId: process.env.FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.FIREBASE_APP_ID || ''
        };

        // Replace placeholders - using simple string replacement
        html = html.split('{{FIREBASE_API_KEY}}').join(config.apiKey);
        html = html.split('{{FIREBASE_AUTH_DOMAIN}}').join(config.authDomain);
        html = html.split('{{FIREBASE_PROJECT_ID}}').join(config.projectId);
        html = html.split('{{FIREBASE_STORAGE_BUCKET}}').join(config.storageBucket);
        html = html.split('{{FIREBASE_MESSAGING_SENDER_ID}}').join(config.messagingSenderId);
        html = html.split('{{FIREBASE_APP_ID}}').join(config.appId);

        // Check if config is valid
        const isValid = config.apiKey && config.apiKey !== '';
        
        // If config is missing, show a helpful error
        if (!isValid) {
            console.error('❌ Firebase config missing! Check Vercel env vars.');
            // Replace the loading status with an error message
            html = html.replace(
                'id="loading-status" style="font-size:12px;color:var(--terracotta);opacity:0.6;margin-top:8px;">Loading...',
                'id="loading-status" style="font-size:12px;color:var(--rust);margin-top:8px;">⚠️ Config missing - Check Vercel env vars'
            );
        }

        // Send the HTML
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(html);
        
    } catch (error) {
        console.error('❌ Error in API function:', error);
        res.status(500).send('Server error: ' + error.message);
    }
};