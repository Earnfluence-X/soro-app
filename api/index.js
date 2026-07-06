// api/index.js - Clean version with proper HTML injection
module.exports = (req, res) => {
    // Get Firebase config from environment variables
    const config = {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || ''
    };

    // Log config status (this will appear in Vercel function logs)
    console.log('🔧 Firebase Config Status:');
    console.log('  API Key:', config.apiKey ? '✅ Set' : '❌ Missing');
    console.log('  Project ID:', config.projectId ? '✅ Set' : '❌ Missing');
    console.log('  Auth Domain:', config.authDomain ? '✅ Set' : '❌ Missing');

    // Build the HTML - all content is inlined here
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="theme-color" content="#D47A3A">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="SORO">
    <meta name="description" content="SORO - talk, simply. A warm messaging app.">
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
    <link rel="apple-touch-icon" href="/icons/icon.svg">
    <title>SORO - talk, simply.</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div id="app">
        <svg style="display:none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <symbol id="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></symbol>
                <symbol id="icon-community" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
                <symbol id="icon-settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></symbol>
                <symbol id="icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></symbol>
                <symbol id="icon-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></symbol>
                <symbol id="icon-send" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></symbol>
                <symbol id="icon-story" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></symbol>
                <symbol id="icon-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></symbol>
                <symbol id="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></symbol>
            </defs>
        </svg>

        <!-- Loading Screen -->
        <div id="loading-screen" class="screen active">
            <div class="loading-container">
                <div class="loading-text">SORO</div>
                <div class="loading-spinner"></div>
                <div id="loading-status" style="font-size:12px;color:var(--terracotta);opacity:0.6;margin-top:8px;">Loading...</div>
            </div>
        </div>

        <!-- Login Screen -->
        <div id="screen-login" class="screen">
            <div class="auth-container">
                <div class="auth-logo">S</div>
                <div class="auth-title">SORO</div>
                <div class="auth-subtitle">talk, simply.</div>
                <input type="email" id="login-email" class="input" placeholder="Email">
                <input type="password" id="login-password" class="input" placeholder="Password">
                <button class="btn btn-primary btn-block" id="login-btn">Sign In</button>
                <span class="auth-link" id="goto-signup">Create account</span>
            </div>
        </div>

        <!-- Signup Screen -->
        <div id="screen-signup" class="screen">
            <div class="auth-container">
                <div class="auth-logo">S</div>
                <div class="auth-title">SORO</div>
                <div class="auth-subtitle">Create your account</div>
                <input type="text" id="signup-username" class="input" placeholder="Username">
                <input type="email" id="signup-email" class="input" placeholder="Email">
                <input type="password" id="signup-password" class="input" placeholder="Password (8+ chars, 1 number)">
                <button class="btn btn-primary btn-block" id="signup-btn">Sign Up</button>
                <span class="auth-link" id="goto-login">Back to Sign In</span>
            </div>
        </div>

        <!-- Chats Screen -->
        <div id="screen-chats" class="screen">
            <div class="header">
                <div class="logo">SORO</div>
                <button class="btn-icon" id="create-story-btn"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-story"/></svg></button>
            </div>
            <div id="stories-row" class="stories-row">
                <div class="story-item" id="add-story-item">
                    <div class="story-ring" style="border-color:var(--accent)">
                        <div class="story-avatar" style="background:var(--accent);color:white;"><svg class="icon" viewBox="0 0 24 24" style="color:white"><use href="#icon-plus"/></svg></div>
                    </div>
                    <span class="story-name">Add Story</span>
                </div>
            </div>
            <div id="chat-list" class="chat-list"></div>
            <div class="bottom-nav">
                <button class="nav-item active" data-screen="chats"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-chat"/></svg></button>
                <button class="nav-item" data-screen="communities"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-community"/></svg></button>
                <button class="nav-item" data-screen="settings"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-settings"/></svg></button>
            </div>
        </div>

        <!-- Chat Screen -->
        <div id="screen-chat" class="screen">
            <div class="header">
                <button class="btn-back" id="chat-back-btn"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-arrow-left"/></svg></button>
                <span id="chat-title" class="header-title">Chat</span>
                <button id="group-settings-btn" class="btn-icon" style="display:none"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-settings"/></svg></button>
            </div>
            <div id="messages-area" class="messages-area"></div>
            <div id="typing-indicator" class="typing-indicator" style="display:none">Someone is typing...</div>
            <div class="input-bar">
                <textarea id="chat-input" class="input textarea" rows="1" placeholder="Message..."></textarea>
                <button class="btn btn-primary" id="send-btn" style="border-radius:50%;padding:12px;height:44px;width:44px;"><svg class="icon" viewBox="0 0 24 24" style="color:white"><use href="#icon-send"/></svg></button>
            </div>
        </div>

        <!-- Communities Screen -->
        <div id="screen-communities" class="screen">
            <div class="header">
                <div class="logo">Communities</div>
                <button class="btn-icon" id="create-community-btn"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-plus"/></svg></button>
            </div>
            <div id="communities-list" class="chat-list"></div>
            <div class="bottom-nav">
                <button class="nav-item" data-screen="chats"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-chat"/></svg></button>
                <button class="nav-item active" data-screen="communities"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-community"/></svg></button>
                <button class="nav-item" data-screen="settings"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-settings"/></svg></button>
            </div>
        </div>

        <!-- Settings Screen -->
        <div id="screen-settings" class="screen">
            <div class="header"><div class="logo">Settings</div></div>
            <div style="text-align:center;padding:16px">
                <div id="settings-avatar" class="profile-avatar-lg">U</div>
                <div id="settings-name" style="font-weight:700;color:var(--text-in)">User</div>
                <div id="settings-username" style="font-size:12px;color:var(--terracotta)">@user</div>
                <div class="progress-bar"><div id="profile-progress" class="progress-fill" style="width:0%"></div></div>
                <div id="profile-progress-text" style="font-size:10px;opacity:0.5">Profile 0% complete</div>
            </div>
            <div class="settings-section">Profile</div>
            <div class="settings-item" data-edit="displayName"><span>Display Name</span><span id="val-displayName" class="settings-value">Set name</span></div>
            <div class="settings-item" data-edit="username"><span>Username</span><span id="val-username" class="settings-value">@user</span></div>
            <div class="settings-item" data-edit="bio"><span>Bio</span><span id="val-bio" class="settings-value">Add bio</span></div>
            <div class="settings-section">Account</div>
            <div class="settings-item" data-edit="email"><span>Email</span><span id="val-email" class="settings-value"></span></div>
            <div class="settings-item" id="change-password-btn"><span>Change Password</span></div>
            <div class="settings-section">Privacy</div>
            <div class="settings-item" id="change-lastseen-btn"><span>Last Seen</span><span id="val-lastSeen" class="settings-value">Contacts</span></div>
            <div class="settings-item" id="toggle-readreceipts"><span>Read Receipts</span><div id="read-receipts-toggle" class="toggle on"></div></div>
            <div class="settings-section">Appearance</div>
            <div class="settings-item" id="change-theme-btn"><span>Theme</span><span id="val-theme" class="settings-value">Light</span></div>
            <div class="settings-section">Data</div>
            <div class="settings-item" id="toggle-datasaver"><span>Data Saver</span><div id="data-saver-toggle" class="toggle"></div></div>
            <div class="settings-section">Danger</div>
            <div class="settings-item danger-text" id="delete-account-btn">Delete Account</div>
            <div class="settings-item" id="logout-btn" style="border-bottom:none;margin-bottom:20px"><span style="color:var(--rust)">Sign Out</span></div>
            <div class="bottom-nav">
                <button class="nav-item" data-screen="chats"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-chat"/></svg></button>
                <button class="nav-item" data-screen="communities"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-community"/></svg></button>
                <button class="nav-item active" data-screen="settings"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-settings"/></svg></button>
            </div>
        </div>

        <!-- Modal -->
        <div id="modal-overlay" class="modal-overlay">
            <div class="modal"><div id="modal-content"></div></div>
        </div>

        <!-- Toast -->
        <div id="toast" class="toast"></div>
    </div>

    <script type="importmap">
    {
        "imports": {
            "firebase/app": "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js",
            "firebase/auth": "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js",
            "firebase/firestore": "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js",
            "firebase/database": "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
        }
    }
    </script>

    <script type="module">
        // Firebase config - injected from Vercel environment variables
        const firebaseConfig = {
            apiKey: "${config.apiKey}",
            authDomain: "${config.authDomain}",
            projectId: "${config.projectId}",
            storageBucket: "${config.storageBucket}",
            messagingSenderId: "${config.messagingSenderId}",
            appId: "${config.appId}"
        };

        // Check if config is valid
        const isValid = firebaseConfig.apiKey && 
                       firebaseConfig.apiKey !== '' &&
                       firebaseConfig.projectId !== '' &&
                       firebaseConfig.projectId !== 'your_project_id';

        if (!isValid) {
            document.getElementById('loading-status').textContent = '⚠️ Firebase config not set in Vercel environment variables';
            document.getElementById('loading-status').style.color = 'var(--rust)';
            console.error('❌ Firebase config not set!');
            console.error('Add these to Vercel: FIREBASE_API_KEY, FIREBASE_PROJECT_ID, etc.');
        } else {
            console.log('✅ Firebase config loaded from environment variables');
            document.getElementById('loading-status').textContent = 'Config loaded!';
        }

        import { initializeApp } from 'firebase/app';
        import { 
            getAuth, 
            signInWithEmailAndPassword, 
            createUserWithEmailAndPassword, 
            signOut, 
            onAuthStateChanged,
            updatePassword,
            deleteUser
        } from 'firebase/auth';
        import { 
            getFirestore, 
            collection, 
            doc, 
            setDoc, 
            getDoc, 
            updateDoc, 
            deleteDoc, 
            query, 
            where, 
            orderBy, 
            limit, 
            onSnapshot, 
            addDoc, 
            serverTimestamp, 
            arrayUnion, 
            arrayRemove, 
            increment, 
            writeBatch, 
            getDocs, 
            runTransaction 
        } from 'firebase/firestore';
        import { 
            getDatabase, 
            ref as rtdbRef, 
            set, 
            onDisconnect, 
            serverTimestamp as rtdbTimestamp, 
            onValue 
        } from 'firebase/database';

        if (!isValid) {
            throw new Error('Firebase config not set');
        }

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const rtdb = getDatabase(app);

        window.firebase = {
            auth, db, rtdb,
            serverTimestamp,
            arrayUnion,
            arrayRemove,
            increment,
            signInWithEmailAndPassword,
            createUserWithEmailAndPassword,
            signOut,
            onAuthStateChanged,
            updatePassword,
            deleteUser,
            collection,
            doc,
            setDoc,
            getDoc,
            updateDoc,
            deleteDoc,
            query,
            where,
            orderBy,
            limit,
            onSnapshot,
            addDoc,
            writeBatch,
            getDocs,
            runTransaction,
            rtdbRef,
            set,
            onDisconnect,
            rtdbTimestamp,
            onValue
        };

        // ==================== UTILITY FUNCTIONS ====================
        const U = {
            showToast(message) {
                const toast = document.getElementById('toast');
                if (!toast) return;
                toast.textContent = message;
                toast.classList.add('show');
                clearTimeout(toast._timeout);
                toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
            },
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
            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },
            extractMentions(text) {
                const mentions = [];
                const regex = /@(\\w+)/g;
                let match;
                while ((match = regex.exec(text)) !== null) {
                    mentions.push(match[1]);
                }
                return mentions;
            },
            highlightMentions(text) {
                return text.replace(/@(\\w+)/g, '<span class="mention">@$1</span>');
            }
        };
        window.U = U;

        // ==================== APP CONTROLLER ====================
        const SoroApp = {
            screens: {},
            currentScreen: null,
            currentUser: null,
            userData: null,

            init() {
                document.querySelectorAll('.screen').forEach(screen => {
                    this.screens[screen.id] = screen;
                });

                document.querySelectorAll('.nav-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const screen = item.dataset.screen;
                        if (screen) this.showScreen(screen);
                    });
                });

                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        this.currentUser = user;
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        
                        if (userDoc.exists()) {
                            this.userData = { uid: user.uid, ...userDoc.data() };
                        } else {
                            this.userData = {
                                uid: user.uid,
                                email: user.email,
                                username: user.email.split('@')[0],
                                displayName: user.email.split('@')[0],
                                bio: '',
                                avatarURL: '',
                                createdAt: serverTimestamp(),
                                isOnline: true,
                                lastSeen: serverTimestamp(),
                                theme: 'light',
                                readReceiptsOn: true,
                                lastSeenPrivacy: 'contacts',
                                dataSaverOn: false,
                                hasSeenTutorial: false
                            };
                            await setDoc(doc(db, 'users', user.uid), this.userData);
                        }

                        this.setupPresence();
                        document.getElementById('loading-screen').classList.remove('active');
                        this.showScreen('chats');
                    } else {
                        this.currentUser = null;
                        this.userData = null;
                        document.getElementById('loading-screen').classList.remove('active');
                        this.showScreen('login');
                    }
                });

                // Login
                document.getElementById('login-btn').addEventListener('click', () => {
                    const email = document.getElementById('login-email').value;
                    const password = document.getElementById('login-password').value;
                    signInWithEmailAndPassword(auth, email, password)
                        .then(() => U.showToast('Welcome back!'))
                        .catch(err => U.showToast('Login failed: ' + err.message));
                });

                document.getElementById('goto-signup').addEventListener('click', () => {
                    document.getElementById('screen-login').style.display = 'none';
                    document.getElementById('screen-signup').style.display = 'flex';
                });

                // Signup
                document.getElementById('signup-btn').addEventListener('click', async () => {
                    const email = document.getElementById('signup-email').value;
                    const username = document.getElementById('signup-username').value;
                    const password = document.getElementById('signup-password').value;

                    try {
                        const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
                        const existingUsers = await getDocs(usernameQuery);
                        if (!existingUsers.empty) {
                            U.showToast('Username already taken');
                            return;
                        }
                        await createUserWithEmailAndPassword(auth, email, password);
                        U.showToast('Account created!');
                    } catch (err) {
                        U.showToast('Signup failed: ' + err.message);
                    }
                });

                document.getElementById('goto-login').addEventListener('click', () => {
                    document.getElementById('screen-signup').style.display = 'none';
                    document.getElementById('screen-login').style.display = 'flex';
                });

                // Chat back
                document.getElementById('chat-back-btn').addEventListener('click', () => {
                    this.showScreen('chats');
                });

                // Send message
                document.getElementById('send-btn').addEventListener('click', () => {
                    this.sendMessage();
                });

                document.getElementById('chat-input').addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });

                // Stories
                document.getElementById('add-story-item').addEventListener('click', () => {
                    this.createStory();
                });
                document.getElementById('create-story-btn').addEventListener('click', () => {
                    this.createStory();
                });

                // Communities
                document.getElementById('create-community-btn').addEventListener('click', () => {
                    this.createCommunity();
                });

                // Settings
                document.querySelectorAll('.settings-item[data-edit]').forEach(item => {
                    item.addEventListener('click', () => {
                        this.editProfile(item.dataset.edit);
                    });
                });

                document.getElementById('change-password-btn').addEventListener('click', () => {
                    this.changePassword();
                });

                document.getElementById('change-lastseen-btn').addEventListener('click', () => {
                    this.changeLastSeen();
                });

                document.getElementById('toggle-readreceipts').addEventListener('click', () => {
                    this.toggleReadReceipts();
                });

                document.getElementById('change-theme-btn').addEventListener('click', () => {
                    this.changeTheme();
                });

                document.getElementById('toggle-datasaver').addEventListener('click', () => {
                    this.toggleDataSaver();
                });

                document.getElementById('delete-account-btn').addEventListener('click', () => {
                    this.deleteAccount();
                });

                document.getElementById('logout-btn').addEventListener('click', () => {
                    this.logout();
                });

                document.getElementById('modal-overlay').addEventListener('click', (e) => {
                    if (e.target === e.currentTarget) {
                        e.currentTarget.classList.remove('open');
                    }
                });

                document.getElementById('loading-status').textContent = 'Ready!';
                setTimeout(() => {
                    document.getElementById('loading-status').style.display = 'none';
                }, 500);
            },

            setupPresence() {
                if (!this.currentUser) return;
                const presenceRef = rtdbRef(rtdb, \`presence/\${this.currentUser.uid}\`);
                set(presenceRef, {
                    online: true,
                    lastSeen: rtdbTimestamp(),
                    typingIn: null
                });
                onDisconnect(presenceRef).set({
                    online: false,
                    lastSeen: rtdbTimestamp(),
                    typingIn: null
                });
                updateDoc(doc(db, 'users', this.currentUser.uid), {
                    isOnline: true,
                    lastSeen: serverTimestamp()
                });
            },

            showScreen(screenName) {
                Object.values(this.screens).forEach(s => s.classList.remove('active'));
                const screenId = \`screen-\${screenName}\`;
                const screen = document.getElementById(screenId);
                if (screen) {
                    screen.classList.add('active');
                    this.currentScreen = screenName;
                    this.updateNavBar(screenName);
                    this.onScreenChange(screenName);
                }
            },

            updateNavBar(screenName) {
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                document.querySelectorAll(\`.nav-item[data-screen="\${screenName}"]\`).forEach(item => item.classList.add('active'));
            },

            onScreenChange(screenName) {
                switch(screenName) {
                    case 'chats':
                        this.loadChatList();
                        this.loadStories();
                        break;
                    case 'communities':
                        this.loadCommunities();
                        break;
                    case 'settings':
                        this.loadSettings();
                        break;
                }
            },

            // ==================== CHAT FUNCTIONS ====================
            currentChatId: null,
            currentChatData: null,
            messagesListener: null,
            chatListListener: null,

            avatarColors: [
                'linear-gradient(135deg, #D47A3A, #C26A4A)',
                'linear-gradient(135deg, #4A6FA5, #3B5A8A)',
                'linear-gradient(135deg, #6B8E5A, #5A7A4A)',
                'linear-gradient(135deg, #8B5A8A, #6A4A6A)',
                'linear-gradient(135deg, #D4A373, #C49363)',
                'linear-gradient(135deg, #5A7A8A, #4A6A7A)'
            ],

            getAvatarStyle(name) {
                let hash = 0;
                for (let i = 0; i < name.length; i++) {
                    hash = name.charCodeAt(i) + ((hash << 5) - hash);
                }
                return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
            },

            loadChatList() {
                if (!this.currentUser) return;
                if (this.chatListListener) this.chatListListener();

                const chatsQuery = query(
                    collection(db, 'chats'),
                    where('participants', 'array-contains', this.currentUser.uid),
                    orderBy('lastMessageTime', 'desc'),
                    limit(20)
                );

                this.chatListListener = onSnapshot(chatsQuery, (snapshot) => {
                    const chatList = document.getElementById('chat-list');
                    if (!chatList) return;
                    chatList.innerHTML = '';

                    snapshot.forEach((chatDoc) => {
                        const chat = chatDoc.data();
                        chat.id = chatDoc.id;

                        const isArchived = chat.isArchived && chat.isArchived[this.currentUser.uid];
                        if (isArchived) return;

                        const isGroup = chat.type === 'group';
                        let displayName = 'Chat';
                        let initials = '?';
                        let avatarStyle = this.avatarColors[0];
                        let onlineDot = '';

                        if (isGroup) {
                            displayName = chat.groupName || 'Group';
                            initials = displayName.charAt(0).toUpperCase();
                            avatarStyle = 'linear-gradient(135deg, #5A7A8A, #4A6A7A)';
                            this.renderChatItem(chatList, chat, displayName, initials, avatarStyle, onlineDot);
                        } else {
                            const otherUid = chat.participants.find(uid => uid !== this.currentUser.uid);
                            if (otherUid) {
                                getDoc(doc(db, 'users', otherUid)).then((userDoc) => {
                                    if (userDoc.exists()) {
                                        const userData = userDoc.data();
                                        displayName = userData.displayName || 'User';
                                        initials = displayName.charAt(0).toUpperCase();
                                        avatarStyle = this.getAvatarStyle(displayName);
                                        if (userData.isOnline) onlineDot = '<span class="online-dot"></span>';
                                        this.renderChatItem(chatList, chat, displayName, initials, avatarStyle, onlineDot);
                                    }
                                });
                            }
                        }
                    });
                });
            },

            renderChatItem(chatList, chat, displayName, initials, avatarStyle, onlineDot) {
                const isPinned = chat.isPinned && chat.isPinned[this.currentUser.uid];
                const time = U.formatTime(chat.lastMessageTime);
                const preview = chat.lastMessage || 'No messages yet';
                const hasUnread = chat.lastMessageSenderId !== this.currentUser.uid;

                const chatItem = document.createElement('div');
                chatItem.className = 'chat-item';
                chatItem.innerHTML = \`
                    <div class="avatar" style="background:\${avatarStyle};width:44px;height:44px;font-size:16px;">
                        \${initials}\${onlineDot}
                    </div>
                    <div class="chat-info">
                        <div class="chat-name">
                            \${isPinned ? '<span class="pinned-badge">Pinned</span>' : ''}
                            \${U.escapeHtml(displayName)}
                        </div>
                        <div class="chat-preview">\${U.highlightMentions(U.escapeHtml(preview))}</div>
                    </div>
                    <div class="chat-meta">
                        <div class="chat-time">\${time}</div>
                        \${hasUnread ? '<span class="unread-badge">1</span>' : ''}
                    </div>
                \`;

                chatItem.addEventListener('click', () => this.openChat(chat.id));
                chatList.appendChild(chatItem);
            },

            openChat(chatId) {
                this.closeChat();
                this.currentChatId = chatId;

                getDoc(doc(db, 'chats', chatId)).then((chatDoc) => {
                    if (!chatDoc.exists()) {
                        U.showToast('Chat not found');
                        return;
                    }

                    this.currentChatData = chatDoc.data();
                    this.currentChatData.id = chatId;

                    const isGroup = this.currentChatData.type === 'group';
                    document.getElementById('chat-title').textContent = isGroup ?
                        (this.currentChatData.groupName || 'Group') : 'Chat';
                    document.getElementById('group-settings-btn').style.display = isGroup ? 'flex' : 'none';

                    this.loadMessages(chatId);
                    this.markMessagesAsRead(chatId);
                    this.showScreen('chat');
                });
            },

            loadMessages(chatId) {
                if (this.messagesListener) this.messagesListener();

                const messagesQuery = query(
                    collection(db, 'chats', chatId, 'messages'),
                    orderBy('timestamp', 'asc'),
                    limit(30)
                );

                this.messagesListener = onSnapshot(messagesQuery, (snapshot) => {
                    const messagesArea = document.getElementById('messages-area');
                    if (!messagesArea || this.currentChatId !== chatId) return;

                    messagesArea.innerHTML = '';
                    snapshot.forEach((msgDoc) => {
                        const msg = msgDoc.data();
                        msg.id = msgDoc.id;
                        this.renderMessage(msg, messagesArea);
                    });

                    messagesArea.scrollTop = messagesArea.scrollHeight;
                });
            },

            renderMessage(msg, container) {
                const isMine = msg.senderId === this.currentUser.uid;
                const msgDiv = document.createElement('div');
                msgDiv.className = 'msg ' + (isMine ? 'out' : 'in');

                if (msg.type === 'system') {
                    msgDiv.className = 'time-divider';
                    msgDiv.textContent = msg.text;
                } else {
                    const time = U.formatTime(msg.timestamp);
                    msgDiv.innerHTML = \`
                        \${U.highlightMentions(U.escapeHtml(msg.text || ''))}
                        <div class="msg-meta">\${time}</div>
                    \`;
                }

                container.appendChild(msgDiv);
            },

            sendMessage() {
                const input = document.getElementById('chat-input');
                const text = input.value.trim();
                if (!text || !this.currentChatId) return;

                const messageData = {
                    senderId: this.currentUser.uid,
                    type: 'text',
                    text: text,
                    timestamp: serverTimestamp(),
                    readBy: [this.currentUser.uid],
                    deliveredTo: [this.currentUser.uid],
                    isEdited: false,
                    isDeleted: false,
                    isPinned: false,
                    mentions: U.extractMentions(text),
                    reactions: {}
                };

                addDoc(collection(db, 'chats', this.currentChatId, 'messages'), messageData)
                    .then(() => {
                        return updateDoc(doc(db, 'chats', this.currentChatId), {
                            lastMessage: text,
                            lastMessageTime: serverTimestamp(),
                            lastMessageSenderId: this.currentUser.uid
                        });
                    })
                    .then(() => {
                        input.value = '';
                        input.style.height = 'auto';
                    })
                    .catch(() => U.showToast('Failed to send message'));
            },

            markMessagesAsRead(chatId) {
                if (!this.userData || !this.userData.readReceiptsOn) return;

                const unreadQuery = query(
                    collection(db, 'chats', chatId, 'messages'),
                    where('senderId', '!=', this.currentUser.uid),
                    orderBy('timestamp', 'desc'),
                    limit(30)
                );

                getDocs(unreadQuery).then((snapshot) => {
                    const batch = writeBatch(db);
                    let count = 0;

                    snapshot.forEach((msgDoc) => {
                        const readBy = msgDoc.data().readBy || [];
                        if (readBy.indexOf(this.currentUser.uid) === -1) {
                            readBy.push(this.currentUser.uid);
                            batch.update(msgDoc.ref, { readBy });
                            count++;
                        }
                    });

                    if (count > 0) return batch.commit();
                });
            },

            closeChat() {
                this.currentChatId = null;
                this.currentChatData = null;
                if (this.messagesListener) {
                    this.messagesListener();
                    this.messagesListener = null;
                }
            },

            // ==================== STORY FUNCTIONS ====================
            createStory() {
                const text = prompt('Write your story (text only):');
                if (!text || !text.trim()) return;

                addDoc(collection(db, 'stories'), {
                    userId: this.currentUser.uid,
                    type: 'text',
                    textContent: text.trim(),
                    createdAt: serverTimestamp(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    viewCount: 0,
                    viewedBy: []
                }).then(() => {
                    U.showToast('Story posted!');
                    this.loadStories();
                });
            },

            loadStories() {
                const storiesRow = document.getElementById('stories-row');
                if (!storiesRow) return;

                const existingStories = storiesRow.querySelectorAll('.story-item:not(:first-child)');
                existingStories.forEach(el => el.remove());

                const storiesQuery = query(
                    collection(db, 'stories'),
                    where('expiresAt', '>', new Date()),
                    orderBy('expiresAt', 'desc'),
                    limit(15)
                );

                getDocs(storiesQuery).then((snapshot) => {
                    snapshot.forEach((storyDoc) => {
                        const story = storyDoc.data();
                        if (story.userId === this.currentUser.uid) return;

                        getDoc(doc(db, 'users', story.userId)).then((userDoc) => {
                            if (!userDoc.exists()) return;

                            const user = userDoc.data();
                            const isViewed = story.viewedBy && story.viewedBy.indexOf(this.currentUser.uid) !== -1;
                            const avatarStyle = this.getAvatarStyle(user.displayName);

                            const storyItem = document.createElement('div');
                            storyItem.className = 'story-item';
                            storyItem.innerHTML = \`
                                <div class="story-ring \${isViewed ? 'viewed' : ''}">
                                    <div class="story-avatar" style="background:\${avatarStyle};color:white;">\${user.displayName.charAt(0)}</div>
                                </div>
                                <span class="story-name">\${U.escapeHtml(user.displayName)}</span>
                            \`;

                            storyItem.addEventListener('click', () => {
                                this.viewStory(storyDoc.id, story, user);
                            });

                            storiesRow.appendChild(storyItem);
                        });
                    });
                });
            },

            viewStory(storyId, story, user) {
                updateDoc(doc(db, 'stories', storyId), {
                    viewCount: increment(1),
                    viewedBy: arrayUnion(this.currentUser.uid)
                });

                const modal = document.getElementById('modal-overlay');
                const content = document.getElementById('modal-content');
                const avatarStyle = this.getAvatarStyle(user.displayName);

                content.innerHTML = \`
                    <div style="text-align:center;padding:20px">
                        <div class="avatar avatar-lg" style="background:\${avatarStyle};margin:0 auto 8px;">\${user.displayName.charAt(0)}</div>
                        <div style="font-weight:600;color:var(--text-in)">\${U.escapeHtml(user.displayName)}</div>
                        <div style="margin:20px 0;padding:30px;background:var(--incoming);border-radius:var(--radius-md);font-size:18px;color:var(--text-in);line-height:1.5;">\${U.escapeHtml(story.textContent || '')}</div>
                        <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:16px;color:var(--text-in);font-size:12px;">
                            <svg class="icon-sm" viewBox="0 0 24 24"><use href="#icon-eye"/></svg>
                            Seen by \${story.viewCount || 0} people
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('open')">Close</button>
                        </div>
                    </div>
                \`;

                modal.classList.add('open');
            },

            // ==================== COMMUNITY FUNCTIONS ====================
            async createCommunity() {
                const name = prompt('Community name:');
                if (!name || !name.trim()) return;
                const description = prompt('Description (optional):') || '';

                await addDoc(collection(db, 'communities'), {
                    name: name.trim(),
                    description: description.trim(),
                    photoURL: null,
                    ownerUid: this.currentUser.uid,
                    adminUids: [this.currentUser.uid],
                    memberUids: [this.currentUser.uid],
                    channelIds: [],
                    privacy: 'public',
                    createdAt: serverTimestamp()
                });

                U.showToast('Community created!');
                this.loadCommunities();
            },

            async loadCommunities() {
                const container = document.getElementById('communities-list');
                if (!container) return;

                const communitiesQuery = query(
                    collection(db, 'communities'),
                    where('memberUids', 'array-contains', this.currentUser.uid)
                );

                const snapshot = await getDocs(communitiesQuery);

                if (snapshot.empty) {
                    container.innerHTML = '<p style="text-align:center;color:var(--terracotta);opacity:0.5;padding:30px;font-size:13px">No communities yet</p>';
                    return;
                }

                container.innerHTML = '';
                snapshot.forEach(doc => {
                    const community = { id: doc.id, ...doc.data() };
                    const item = document.createElement('div');
                    item.className = 'chat-item';
                    item.innerHTML = \`
                        <div class="avatar" style="background:linear-gradient(135deg,#5A7A8A,#4A6A7A);width:44px;height:44px;font-size:16px;">
                            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-users"/></svg>
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">\${U.escapeHtml(community.name)}</div>
                            <div class="chat-preview">\${U.escapeHtml(community.description || '')}</div>
                        </div>
                        <div class="chat-meta">
                            <div class="chat-time">\${community.channelIds?.length || 0} channels</div>
                        </div>
                    \`;
                    container.appendChild(item);
                });
            },

            // ==================== SETTINGS FUNCTIONS ====================
            loadSettings() {
                const user = this.userData;
                if (!user) return;

                document.getElementById('settings-name').textContent = user.displayName || 'User';
                document.getElementById('settings-username').textContent = '@' + (user.username || 'user');
                document.getElementById('val-displayName').textContent = user.displayName || 'Set name';
                document.getElementById('val-username').textContent = '@' + (user.username || 'user');
                document.getElementById('val-bio').textContent = user.bio || 'Add bio';
                document.getElementById('val-email').textContent = user.email || '';
                document.getElementById('val-theme').textContent = user.theme || 'Light';
                document.getElementById('val-lastSeen').textContent = user.lastSeenPrivacy || 'Contacts';

                const readReceiptsToggle = document.getElementById('read-receipts-toggle');
                if (readReceiptsToggle) {
                    readReceiptsToggle.className = 'toggle' + (user.readReceiptsOn ? ' on' : '');
                }

                const dataSaverToggle = document.getElementById('data-saver-toggle');
                if (dataSaverToggle) {
                    dataSaverToggle.className = 'toggle' + (user.dataSaverOn ? ' on' : '');
                }

                const avatarEl = document.getElementById('settings-avatar');
                if (avatarEl && !user.avatarURL) {
                    const initials = (user.displayName || 'U').charAt(0).toUpperCase();
                    const avatarStyle = this.getAvatarStyle(user.displayName || 'User');
                    avatarEl.style.background = avatarStyle;
                    avatarEl.innerHTML = \`<span style="font-size:28px;font-weight:700;">\${initials}</span>\`;
                }

                this.updateProfileProgress();
            },

            updateProfileProgress() {
                const user = this.userData;
                let progress = 0;
                if (user.displayName && user.displayName !== (user.email ? user.email.split('@')[0] : '')) progress += 33;
                if (user.bio) progress += 33;
                if (user.username) progress += 34;

                const progressBar = document.getElementById('profile-progress');
                const progressText = document.getElementById('profile-progress-text');
                if (progressBar) progressBar.style.width = progress + '%';
                if (progressText) progressText.textContent = 'Profile ' + progress + '% complete';
            },

            editProfile(field) {
                const user = this.userData;
                const currentValue = user[field] || '';
                const value = prompt('Edit ' + field + ':', currentValue);
                if (value === null || value.trim() === '') return;

                const updateData = {};
                updateData[field] = value.trim();

                updateDoc(doc(db, 'users', user.uid), updateData).then(() => {
                    this.userData[field] = value.trim();
                    this.loadSettings();
                    U.showToast(field + ' updated');
                });
            },

            changePassword() {
                const newPassword = prompt('Enter new password (min 8 chars, 1 number):');
                if (!newPassword || newPassword.length < 8 || !/\\d/.test(newPassword)) {
                    U.showToast('Password must be 8+ characters with a number');
                    return;
                }
                updatePassword(auth.currentUser, newPassword)
                    .then(() => U.showToast('Password updated'))
                    .catch(() => U.showToast('Failed. Re-login and try again.'));
            },

            changeLastSeen() {
                const options = ['everyone', 'contacts', 'nobody'];
                const current = this.userData.lastSeenPrivacy || 'contacts';
                const nextIndex = (options.indexOf(current) + 1) % options.length;
                const nextValue = options[nextIndex];

                updateDoc(doc(db, 'users', this.currentUser.uid), { lastSeenPrivacy: nextValue }).then(() => {
                    this.userData.lastSeenPrivacy = nextValue;
                    document.getElementById('val-lastSeen').textContent = nextValue.charAt(0).toUpperCase() + nextValue.slice(1);
                    U.showToast('Last seen: ' + nextValue);
                });
            },

            toggleReadReceipts() {
                const toggle = document.getElementById('read-receipts-toggle');
                const newValue = !toggle.classList.contains('on');
                toggle.classList.toggle('on', newValue);
                updateDoc(doc(db, 'users', this.currentUser.uid), { readReceiptsOn: newValue });
                this.userData.readReceiptsOn = newValue;
            },

            changeTheme() {
                const themes = ['light', 'dark', 'system'];
                const current = this.userData.theme || 'light';
                const nextIndex = (themes.indexOf(current) + 1) % themes.length;
                const nextTheme = themes[nextIndex];

                updateDoc(doc(db, 'users', this.currentUser.uid), { theme: nextTheme }).then(() => {
                    this.userData.theme = nextTheme;
                    if (nextTheme === 'dark') {
                        document.getElementById('app').classList.add('dark');
                    } else {
                        document.getElementById('app').classList.remove('dark');
                    }
                    document.getElementById('val-theme').textContent = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
                    U.showToast('Theme: ' + nextTheme);
                });
            },

            toggleDataSaver() {
                const toggle = document.getElementById('data-saver-toggle');
                const newValue = !toggle.classList.contains('on');
                toggle.classList.toggle('on', newValue);
                updateDoc(doc(db, 'users', this.currentUser.uid), { dataSaverOn: newValue });
                this.userData.dataSaverOn = newValue;
                U.showToast('Data saver ' + (newValue ? 'on' : 'off'));
            },

            deleteAccount() {
                if (!confirm('Delete your SORO account? This cannot be undone.')) return;
                if (!confirm('Are you absolutely sure?')) return;

                deleteDoc(doc(db, 'users', this.currentUser.uid))
                    .then(() => deleteUser(auth.currentUser))
                    .then(() => U.showToast('Account deleted'))
                    .catch(() => U.showToast('Failed. Re-login and try again.'));
            },

            logout() {
                if (this.currentUser) {
                    updateDoc(doc(db, 'users', this.currentUser.uid), {
                        isOnline: false,
                        lastSeen: serverTimestamp()
                    });
                    set(rtdbRef(rtdb, \`presence/\${this.currentUser.uid}\`), {
                        online: false,
                        lastSeen: rtdbTimestamp(),
                        typingIn: null
                    });
                }
                signOut(auth);
                U.showToast('Logged out');
            }
        };

        // Initialize the app
        document.getElementById('loading-status').textContent = 'Starting app...';
        SoroApp.init();
    </script>
</body>
</html>`;

    // Send the HTML response
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(html);
};