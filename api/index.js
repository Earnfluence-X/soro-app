// api/index.js - Serverless function for Vercel
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // Read the HTML file
    const htmlPath = path.join(__dirname, '..', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace placeholders with environment variables
    const replacements = {
        '{{FIREBASE_API_KEY}}': process.env.FIREBASE_API_KEY || '',
        '{{FIREBASE_AUTH_DOMAIN}}': process.env.FIREBASE_AUTH_DOMAIN || '',
        '{{FIREBASE_PROJECT_ID}}': process.env.FIREBASE_PROJECT_ID || '',
        '{{FIREBASE_STORAGE_BUCKET}}': process.env.FIREBASE_STORAGE_BUCKET || '',
        '{{FIREBASE_MESSAGING_SENDER_ID}}': process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        '{{FIREBASE_APP_ID}}': process.env.FIREBASE_APP_ID || ''
    };

    for (const [key, value] of Object.entries(replacements)) {
        html = html.replace(new RegExp(key, 'g'), value);
    }
    
    // Verify config was replaced
    const isValid = html.includes('"YOUR_API_KEY"') === false;
    if (!isValid) {
        console.warn('⚠️ Firebase config placeholders still present! Check environment variables.');
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(html);
};