// Stories System Module - Spark Plan (Text Only)
window.SoroStories = {
    loadStories: function() {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var query = window.firebase.query;
        var where = window.firebase.where;
        var orderBy = window.firebase.orderBy;
        var getDocs = window.firebase.getDocs;
        var doc = window.firebase.doc;
        var getDoc = window.firebase.getDoc;
        var storiesRow = document.getElementById('stories-row');

        if (!storiesRow) {
            return;
        }

        var existingStories = storiesRow.querySelectorAll('.story-item:not(:first-child)');
        existingStories.forEach(function(el) {
            el.remove();
        });

        var storiesQuery = query(
            collection(db, 'stories'),
            where('expiresAt', '>', new Date()),
            orderBy('expiresAt', 'desc'),
            limit(15)
        );

        var self = this;
        getDocs(storiesQuery).then(function(snapshot) {
            snapshot.forEach(function(storyDoc) {
                var story = storyDoc.data();
                story.id = storyDoc.id;

                if (story.userId === window.SoroAuth.currentUser.uid) {
                    return;
                }

                getDoc(doc(db, 'users', story.userId)).then(function(userDoc) {
                    if (!userDoc.exists()) {
                        return;
                    }

                    var user = userDoc.data();
                    var isViewed = story.viewedBy && story.viewedBy.indexOf(window.SoroAuth.currentUser.uid) !== -1;
                    var avatarStyle = window.SoroChat.getAvatarStyle(user.displayName);

                    var storyItem = document.createElement('div');
                    storyItem.className = 'story-item';
                    storyItem.innerHTML =
                        '<div class="story-ring ' + (isViewed ? 'viewed' : '') + '">' +
                        '<div class="story-avatar" style="background:' + avatarStyle + ';color:white;">' + user.displayName.charAt(0) + '</div>' +
                        '</div>' +
                        '<span class="story-name">' + U.escapeHtml(user.displayName) + '</span>';

                    storyItem.addEventListener('click', function() {
                        self.viewStory(storyDoc.id, story, user);
                    });

                    storiesRow.appendChild(storyItem);
                });
            });
        });
    },

    createStory: function() {
        var text = prompt('Write your story (text only):');
        if (!text || !text.trim()) {
            return;
        }

        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var addDoc = window.firebase.addDoc;
        var serverTimestamp = window.firebase.serverTimestamp;

        var self = this;
        addDoc(collection(db, 'stories'), {
            userId: window.SoroAuth.currentUser.uid,
            type: 'text',
            textContent: text.trim(),
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            viewCount: 0,
            viewedBy: []
        }).then(function() {
            U.showToast('Story posted!');
            self.loadStories();
        });
    },

    viewStory: function(storyId, story, user) {
        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var arrayUnion = window.firebase.arrayUnion;
        var increment = window.firebase.increment;

        updateDoc(doc(db, 'stories', storyId), {
            viewCount: increment(1),
            viewedBy: arrayUnion(window.SoroAuth.currentUser.uid)
        });

        var modal = document.getElementById('modal-overlay');
        var content = document.getElementById('modal-content');
        var avatarStyle = window.SoroChat.getAvatarStyle(user.displayName);

        content.innerHTML =
            '<div style="text-align:center;padding:20px">' +
            '<div class="avatar avatar-lg" style="background:' + avatarStyle + ';margin:0 auto 8px;">' + user.displayName.charAt(0) + '</div>' +
            '<div style="font-weight:600;color:var(--text-in)">' + U.escapeHtml(user.displayName) + '</div>' +
            '<div style="font-size:11px;color:var(--terracotta)">2h ago</div>' +
            '<div style="margin:20px 0;padding:30px;background:var(--incoming);border-radius:var(--radius-md);font-size:18px;color:var(--text-in);line-height:1.5;">' + U.escapeHtml(story.textContent || '') + '</div>' +
            '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:16px;color:var(--text-in);font-size:12px;">' +
            '<svg class="icon-sm" viewBox="0 0 24 24"><use href="#icon-eye"/></svg>' +
            'Seen by ' + (story.viewCount || 0) + ' people' +
            '</div>' +
            '<div style="display:flex;gap:8px">' +
            '<input type="text" id="story-reply-input" class="input" placeholder="Reply to story..." style="flex:1">' +
            '<button class="btn btn-primary" onclick="window.SoroStories.replyToStory(\'' + story.userId + '\')">Reply</button>' +
            '</div>' +
            '</div>';

        modal.classList.add('open');
    },

    replyToStory: function(storyOwnerId) {
        var replyText = document.getElementById('story-reply-input');
        if (!replyText || !replyText.value.trim()) {
            return;
        }
        var text = replyText.value.trim();

        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var query = window.firebase.query;
        var where = window.firebase.where;
        var getDocs = window.firebase.getDocs;
        var addDoc = window.firebase.addDoc;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var serverTimestamp = window.firebase.serverTimestamp;
        var userId = window.SoroAuth.currentUser.uid;

        var chatsQuery = query(
            collection(db, 'chats'),
            where('type', '==', 'direct'),
            where('participants', 'array-contains', userId)
        );

        getDocs(chatsQuery).then(function(snapshot) {
            var chatId = null;
            snapshot.forEach(function(chatDoc) {
                if (chatDoc.data().participants.indexOf(storyOwnerId) !== -1) {
                    chatId = chatDoc.id;
                }
            });

            if (chatId) {
                return addDoc(collection(db, 'chats', chatId, 'messages'), {
                    senderId: userId,
                    type: 'story_reply',
                    text: text,
                    timestamp: serverTimestamp(),
                    readBy: [userId],
                    deliveredTo: [userId],
                    isEdited: false,
                    isDeleted: false
                }).then(function() {
                    return updateDoc(doc(db, 'chats', chatId), {
                        lastMessage: 'Replied to your story: ' + text,
                        lastMessageTime: serverTimestamp(),
                        lastMessageSenderId: userId
                    });
                });
            } else {
                return addDoc(collection(db, 'chats'), {
                    type: 'direct',
                    participants: [userId, storyOwnerId],
                    lastMessage: 'Replied to your story: ' + text,
                    lastMessageTime: serverTimestamp(),
                    lastMessageSenderId: userId,
                    createdAt: serverTimestamp(),
                    isArchived: {},
                    isPinned: {},
                    isMuted: {},
                    wallpaper: {}
                }).then(function(newChatRef) {
                    return addDoc(collection(db, 'chats', newChatRef.id, 'messages'), {
                        senderId: userId,
                        type: 'story_reply',
                        text: text,
                        timestamp: serverTimestamp(),
                        readBy: [userId],
                        deliveredTo: [userId],
                        isEdited: false,
                        isDeleted: false
                    });
                });
            }
        }).then(function() {
            document.getElementById('modal-overlay').classList.remove('open');
            U.showToast('Reply sent!');
        });
    }
};