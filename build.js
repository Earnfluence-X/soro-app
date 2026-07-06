// build.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Building SORO...');

// Read the TEMPLATE file from the template folder
const templatePath = path.join(__dirname, 'template', 'index.html');
let html = fs.readFileSync(templatePath, 'utf8');

// Get config from environment
const config = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
};

// Check if config is set
const isValid = config.apiKey && config.apiKey !== '';

if (!isValid) {
    console.error('❌ Firebase config missing! Set Vercel env vars.');
    process.exit(1);
}

console.log('📋 Config:', {
    apiKey: config.apiKey ? '✅' : '❌',
    projectId: config.projectId ? '✅' : '❌',
    authDomain: config.authDomain ? '✅' : '❌'
});

// Replace placeholders
html = html.replace(/{{FIREBASE_API_KEY}}/g, config.apiKey);
html = html.replace(/{{FIREBASE_AUTH_DOMAIN}}/g, config.authDomain);
html = html.replace(/{{FIREBASE_PROJECT_ID}}/g, config.projectId);
html = html.replace(/{{FIREBASE_STORAGE_BUCKET}}/g, config.storageBucket);
html = html.replace(/{{FIREBASE_MESSAGING_SENDER_ID}}/g, config.messagingSenderId);
html = html.replace(/{{FIREBASE_APP_ID}}/g, config.appId);

// Write to index.html in the root
fs.writeFileSync(path.join(__dirname, 'index.html'), html);

console.log('✅ Built index.html with config injected!');