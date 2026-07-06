// Authentication Module
window.SoroAuth = {
    currentUser: null,
    userData: null,

    init() {
        const { auth, onAuthStateChanged, db, doc, getDoc, setDoc, serverTimestamp, rtdb, rtdbRef, set, onDisconnect, rtdbTimestamp } = window.firebase;

        onAuthStateChanged(auth, async (user) => {
            document.getElementById('loading-screen').classList.add('active');
            
            if (user) {
                this.currentUser = user;
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                
                if (userDoc.exists()) {
                    this.userData = { uid: user.uid, ...userDoc.data() };
                } else {
                    // Create user document
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
                
                if (!this.userData.hasSeenTutorial) {
                    window.SoroApp.showTutorial();
                } else {
                    window.SoroApp.showScreen('chats');
                }
            } else {
                this.currentUser = null;
                this.userData = null;
                document.getElementById('loading-screen').classList.remove('active');
                window.SoroApp.showScreen('login');
            }
        });
    },

    setupPresence() {
        const { rtdb, rtdbRef, set, onDisconnect, rtdbTimestamp, db, doc, updateDoc, serverTimestamp } = window.firebase;
        if (!this.currentUser) return;

        const presenceRef = rtdbRef(rtdb, `presence/${this.currentUser.uid}`);
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

    async login(email, password) {
        const { auth, signInWithEmailAndPassword } = window.firebase;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            U.showToast('Welcome back!');
        } catch (error) {
            throw error;
        }
    },

    async signup(email, username, password) {
        const { auth, createUserWithEmailAndPassword, db, collection, query, where, getDocs } = window.firebase;
        
        // Check username uniqueness
        const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
        const existingUsers = await getDocs(usernameQuery);
        if (!existingUsers.empty) {
            throw new Error('Username already taken');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    async logout() {
        const { auth, signOut, db, doc, updateDoc, serverTimestamp, rtdb, rtdbRef, set } = window.firebase;
        
        if (this.currentUser) {
            await updateDoc(doc(db, 'users', this.currentUser.uid), {
                isOnline: false,
                lastSeen: serverTimestamp()
            });
            set(rtdbRef(rtdb, `presence/${this.currentUser.uid}`), {
                online: false,
                lastSeen: firebase.database.ServerValue.TIMESTAMP,
                typingIn: null
            });
        }
        
        await signOut(auth);
        U.showToast('Logged out');
    },

    async resetPassword(email) {
        const { auth, sendPasswordResetEmail } = window.firebase;
        await sendPasswordResetEmail(auth, email);
        U.showToast('Password reset email sent');
    }
};