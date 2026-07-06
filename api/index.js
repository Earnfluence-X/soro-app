// api/index.js - Serves HTML with config injected from Vercel env vars
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // Read the HTML file
    const htmlPath = path.join(__dirname, '..', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Get config from Vercel environment variables
    const config = {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
    };

    // Replace placeholders with actual values
    html = html.replace(/{{FIREBASE_API_KEY}}/g, config.apiKey);
    html = html.replace(/{{FIREBASE_AUTH_DOMAIN}}/g, config.authDomain);
    html = html.replace(/{{FIREBASE_PROJECT_ID}}/g, config.projectId);
    html = html.replace(/{{FIREBASE_STORAGE_BUCKET}}/g, config.storageBucket);
    html = html.replace(/{{FIREBASE_MESSAGING_SENDER_ID}}/g, config.messagingSenderId);
    html = html.replace(/{{FIREBASE_APP_ID}}/g, config.appId);

    // Send the HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(html);
};