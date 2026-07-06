// Utility functions for SORO
window.SoroUtils = {
    // Toast notification
    showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
    },

    // Format timestamp
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    // Generate random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Extract mentions from text
    extractMentions(text) {
        const mentions = [];
        const regex = /@(\w+)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            mentions.push(match[1]);
        }
        return mentions;
    },

    // Highlight mentions in text
    highlightMentions(text) {
        return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    },

    // Check if online
    isOnline() {
        return navigator.onLine;
    },

    // File size formatter
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    // Get file icon based on type
    getFileIconClass(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            pdf: 'pdf',
            doc: 'doc',
            docx: 'doc',
            xls: 'doc',
            xlsx: 'doc',
            ppt: 'doc',
            pptx: 'doc',
            jpg: 'img',
            jpeg: 'img',
            png: 'img',
            gif: 'img',
            webp: 'img',
            mp4: 'img',
            mov: 'img',
        };
        return icons[ext] || 'doc';
    }
};

// Shortcut
const U = window.SoroUtils;