// Main Application Controller
window.SoroApp = {
    screens: {},
    currentScreen: null,
    listeners: {},
    
    init() {
        // Cache screen elements
        document.querySelectorAll('.screen').forEach(screen => {
            this.screens[screen.id] = screen;
        });

        // Initialize auth
        window.SoroAuth.init();

        // Handle back button
        window.addEventListener('popstate', () => this.goBack());
        
        // Handle online/offline
        window.addEventListener('online', () => U.showToast('Back online'));
        window.addEventListener('offline', () => U.showToast('You are offline'));
    },

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        
        // Show target screen
        const screenId = `screen-${screenName}`;
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
            this.updateNavBar(screenName);
            this.onScreenChange(screenName);
        }
    },

    updateNavBar(screenName) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const navMap = {
            'chats': 0,
            'communities': 1,
            'settings': 3
        };
        
        const index = navMap[screenName];
        if (index !== undefined && navItems[index]) {
            navItems[index].classList.add('active');
        }
    },

    onScreenChange(screenName) {
        switch(screenName) {
            case 'chats':
                window.SoroChat.loadChatList();
                window.SoroStories.loadStories();
                break;
            case 'communities':
                window.SoroCommunities.loadCommunities();
                break;
            case 'settings':
                window.SoroSettings.loadSettings();
                break;
        }
    },

    goBack() {
        const navigationStack = ['login', 'chats', 'communities', 'settings'];
        const currentIndex = navigationStack.indexOf(this.currentScreen);
        if (currentIndex > 0) {
            this.showScreen(navigationStack[currentIndex - 1]);
        }
    },

    showTutorial() {
        // Simple tutorial overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 100; display: flex;
            align-items: center; justify-content: center; flex-direction: column;
            color: white; text-align: center; padding: 40px;
        `;
        overlay.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">SORO</div>
            <h2 style="margin-bottom: 12px;">Welcome to SORO</h2>
            <p style="opacity: 0.7; margin-bottom: 24px; line-height: 1.6;">Your chats live here. Tap to talk. Swipe to organize. Use @ to mention friends.</p>
            <button style="padding: 14px 40px; background: #D47A3A; color: white; border: none; border-radius: 24px; font-size: 16px; font-weight: 600; cursor: pointer;">Get Started</button>
        `;
        
        document.body.appendChild(overlay);
        overlay.querySelector('button').addEventListener('click', async () => {
            overlay.remove();
            const { db, doc, updateDoc } = window.firebase;
            await updateDoc(doc(db, 'users', window.SoroAuth.currentUser.uid), {
                hasSeenTutorial: true
            });
            window.SoroAuth.userData.hasSeenTutorial = true;
            window.SoroApp.showScreen('chats');
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.SoroApp.init();
});