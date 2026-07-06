// Chat System Module - Spark Plan (Text Only, Optimized)
window.SoroChat = {
    currentChatId: null,
    currentChatData: null,
    messagesListener: null,
    chatListListener: null,
    typingTimeout: null,

    avatarColors: [
        'linear-gradient(135deg, #D47A3A, #C26A4A)',
        'linear-gradient(135deg, #4A6FA5, #3B5A8A)',
        'linear-gradient(135deg, #6B8E5A, #5A7A4A)',
        'linear-gradient(135deg, #8B5A8A, #6A4A6A)',
        'linear-gradient(135deg, #D4A373, #C49363)',
        'linear-gradient(135deg, #5A7A8A, #4A6A7A)'
    ],

    getAvatarStyle: function(name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
    },

    loadChatList: function() {
        var self = this;
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var query = window.firebase.query;
        var where = window.firebase.where;
        var orderBy = window.firebase.orderBy;
        var limit = window.firebase.limit;
        var onSnapshot = window.firebase.onSnapshot;
        var doc = window.firebase.doc;
        var getDoc = window.firebase.getDoc;
        var user = window.SoroAuth.currentUser;

        if (!user) {
            return;
        }

        if (this.chatListListener) {
            this.chatListListener();
        }

        var chatsQuery = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', user.uid),
            orderBy('lastMessageTime', 'desc'),
            limit(20)
        );

        this.chatListListener = onSnapshot(chatsQuery, function(snapshot) {
            var chatList = document.getElementById('chat-list');
            if (!chatList) {
                return;
            }
            chatList.innerHTML = '';

            snapshot.forEach(function(chatDoc) {
                var chat = chatDoc.data();
                chat.id = chatDoc.id;

                var isArchived = chat.isArchived && chat.isArchived[user.uid];
                if (isArchived) {
                    return;
                }

                var isGroup = chat.type === 'group';
                var displayName = 'Chat';
                var initials = '?';
                var avatarStyle = self.avatarColors[0];
                var onlineDot = '';

                if (isGroup) {
                    displayName = chat.groupName || 'Group';
                    initials = displayName.charAt(0).toUpperCase();
                    avatarStyle = 'linear-gradient(135deg, #5A7A8A, #4A6A7A)';
                    self.renderChatItem(chatList, chat, displayName, initials, avatarStyle, onlineDot, false);
                } else {
                    var otherUid = chat.participants.find(function(uid) {
                        return uid !== user.uid;
                    });
                    if (otherUid) {
                        getDoc(doc(db, 'users', otherUid)).then(function(userDoc) {
                            if (userDoc.exists()) {
                                var userData = userDoc.data();
                                displayName = userData.displayName || 'User';
                                initials = displayName.charAt(0).toUpperCase();
                                avatarStyle = self.getAvatarStyle(displayName);
                                if (userData.isOnline) {
                                    onlineDot = '<span class="online-dot"></span>';
                                }
                                self.renderChatItem(chatList, chat, displayName, initials, avatarStyle, onlineDot, true);
                            }
                        });
                    }
                }
            });

            self.loadFriendRequests();
        });
    },

    renderChatItem: function(chatList, chat, displayName, initials, avatarStyle, onlineDot, isDirect) {
        var user = window.SoroAuth.currentUser;
        var isPinned = chat.isPinned && chat.isPinned[user.uid];
        var time = U.formatTime(chat.lastMessageTime);
        var preview = chat.lastMessage || 'No messages yet';
        var hasUnread = chat.lastMessageSenderId !== user.uid;

        var chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.innerHTML =
            '<div class="avatar" style="background:' + avatarStyle + ';width:44px;height:44px;font-size:16px;">' +
            initials + onlineDot +
            '</div>' +
            '<div class="chat-info">' +
            '<div class="chat-name">' +
            (isPinned ? '<span class="pinned-badge">Pinned</span>' : '') +
            U.escapeHtml(displayName) +
            '</div>' +
            '<div class="chat-preview">' + U.highlightMentions(U.escapeHtml(preview)) + '</div>' +
            '</div>' +
            '<div class="chat-meta">' +
            '<div class="chat-time">' + time + '</div>' +
            (hasUnread ? '<span class="unread-badge">1</span>' : '') +
            '</div>';

        chatItem.addEventListener('click', function() {
            window.SoroChat.openChat(chat.id);
        });

        chatList.appendChild(chatItem);
    },

    openChat: function(chatId) {
        var self = this;
        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var getDoc = window.firebase.getDoc;

        this.closeChat();
        this.currentChatId = chatId;

        getDoc(doc(db, 'chats', chatId)).then(function(chatDoc) {
            if (!chatDoc.exists()) {
                U.showToast('Chat not found');
                return;
            }

            self.currentChatData = chatDoc.data();
            self.currentChatData.id = chatId;

            var isGroup = self.currentChatData.type === 'group';
            document.getElementById('chat-title').textContent = isGroup ?
                (self.currentChatData.groupName || 'Group') : 'Chat';
            document.getElementById('group-settings-btn').style.display = isGroup ? 'flex' : 'none';

            self.loadMessages(chatId);
            self.markMessagesAsRead(chatId);
            window.SoroApp.showScreen('chat');
            self.setupTypingIndicator();
        });
    },

    loadMessages: function(chatId) {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var query = window.firebase.query;
        var orderBy = window.firebase.orderBy;
        var limit = window.firebase.limit;
        var onSnapshot = window.firebase.onSnapshot;

        if (this.messagesListener) {
            this.messagesListener();
        }

        var messagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'asc'),
            limit(30)
        );

        var self = this;
        this.messagesListener = onSnapshot(messagesQuery, function(snapshot) {
            var messagesArea = document.getElementById('messages-area');
            if (!messagesArea || self.currentChatId !== chatId) {
                return;
            }

            messagesArea.innerHTML = '';
            snapshot.forEach(function(msgDoc) {
                var msg = msgDoc.data();
                msg.id = msgDoc.id;
                self.renderMessage(msg, messagesArea);
            });

            messagesArea.scrollTop = messagesArea.scrollHeight;
        });
    },

    renderMessage: function(msg, container) {
        var isMine = msg.senderId === window.SoroAuth.currentUser.uid;
        var msgDiv = document.createElement('div');
        msgDiv.className = 'msg ' + (isMine ? 'out' : 'in');

        if (msg.type === 'system') {
            msgDiv.className = 'time-divider';
            msgDiv.textContent = msg.text;
        } else if (msg.type === 'poll') {
            msgDiv.innerHTML = this.renderPoll(msg);
        } else if (msg.type === 'story_reply') {
            msgDiv.className = 'msg ' + (isMine ? 'out' : 'in');
            msgDiv.innerHTML =
                '<div style="font-size:10px;opacity:0.5;margin-bottom:4px;">Replied to story</div>' +
                U.escapeHtml(msg.text || '') +
                '<div class="msg-meta">' + U.formatTime(msg.timestamp) + '</div>';
        } else {
            var time = U.formatTime(msg.timestamp);
            var checks = isMine ? this.getReadReceiptIcon(msg) : '';
            var edited = msg.isEdited ? ' (edited)' : '';
            msgDiv.innerHTML =
                U.highlightMentions(U.escapeHtml(msg.text || '')) +
                '<div class="msg-meta">' + time + ' ' + checks + edited + '</div>';
        }

        container.appendChild(msgDiv);
    },

    renderPoll: function(msg) {
        var poll = msg.pollData;
        var totalVotes = 0;
        poll.options.forEach(function(opt) {
            totalVotes += (opt.votes || 0);
        });

        var self = this;
        var optionsHTML = poll.options.map(function(opt, i) {
            var percentage = totalVotes > 0 ? ((opt.votes || 0) / totalVotes * 100) : 0;
            var isVoted = (opt.voters || []).indexOf(window.SoroAuth.currentUser.uid) !== -1;
            return '<div class="poll-option ' + (isVoted ? 'voted' : '') + '" onclick="window.SoroChat.votePoll(\'' + msg.id + '\', ' + i + ')">' +
                '<span>' + U.escapeHtml(opt.text) + '</span>' +
                '<div class="poll-bar"><div class="poll-fill" style="width:' + percentage + '%"></div></div>' +
                '<span class="poll-votes">' + (opt.votes || 0) + '</span>' +
                '</div>';
        }).join('');

        return '<div class="poll-card">' +
            '<div class="poll-title">' + U.escapeHtml(poll.question) + '</div>' +
            optionsHTML +
            '<div class="poll-footer">' + totalVotes + ' votes &middot; Tap to vote</div>' +
            '</div>';
    },

    getReadReceiptIcon: function(msg) {
        if (!window.SoroAuth.userData || !window.SoroAuth.userData.readReceiptsOn) {
            return '';
        }
        var readBy = msg.readBy || [];
        if (readBy.length > 1) {
            return '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-check-double"/></svg>';
        }
        return '<svg class="icon" viewBox="0 0 24 24"><use href="#icon-check"/></svg>';
    },

    sendMessage: function() {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var addDoc = window.firebase.addDoc;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var serverTimestamp = window.firebase.serverTimestamp;

        var input = document.getElementById('chat-input');
        var text = input.value.trim();
        if (!text || !this.currentChatId) {
            return;
        }

        var messageData = {
            senderId: window.SoroAuth.currentUser.uid,
            type: 'text',
            text: text,
            timestamp: serverTimestamp(),
            readBy: [window.SoroAuth.currentUser.uid],
            deliveredTo: [window.SoroAuth.currentUser.uid],
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            mentions: U.extractMentions(text),
            reactions: {}
        };

        var self = this;
        addDoc(collection(db, 'chats', this.currentChatId, 'messages'), messageData)
            .then(function() {
                return updateDoc(doc(db, 'chats', self.currentChatId), {
                    lastMessage: text,
                    lastMessageTime: serverTimestamp(),
                    lastMessageSenderId: window.SoroAuth.currentUser.uid
                });
            })
            .then(function() {
                input.value = '';
                input.style.height = 'auto';
                self.clearTyping();
            })
            .catch(function(error) {
                U.showToast('Failed to send message');
            });
    },

    votePoll: function(messageId, optionIndex) {
        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var runTransaction = window.firebase.runTransaction;
        var userId = window.SoroAuth.currentUser.uid;
        var messageRef = doc(db, 'chats', this.currentChatId, 'messages', messageId);

        runTransaction(db, function(transaction) {
            return transaction.get(messageRef).then(function(msgDoc) {
                if (!msgDoc.exists()) {
                    return;
                }
                var poll = msgDoc.data().pollData;
                poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
                if (!poll.options[optionIndex].voters) {
                    poll.options[optionIndex].voters = [];
                }
                poll.options[optionIndex].voters.push(userId);
                transaction.update(messageRef, { pollData: poll });
            });
        }).catch(function(error) {
            U.showToast('Failed to vote');
        });
    },

    markMessagesAsRead: function(chatId) {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var query = window.firebase.query;
        var where = window.firebase.where;
        var orderBy = window.firebase.orderBy;
        var limit = window.firebase.limit;
        var getDocs = window.firebase.getDocs;
        var writeBatch = window.firebase.writeBatch;
        var userId = window.SoroAuth.currentUser.uid;

        if (!window.SoroAuth.userData || !window.SoroAuth.userData.readReceiptsOn) {
            return;
        }

        var unreadQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            where('senderId', '!=', userId),
            orderBy('timestamp', 'desc'),
            limit(30)
        );

        getDocs(unreadQuery).then(function(snapshot) {
            var batch = writeBatch(db);
            var count = 0;

            snapshot.forEach(function(msgDoc) {
                var readBy = msgDoc.data().readBy || [];
                if (readBy.indexOf(userId) === -1) {
                    readBy.push(userId);
                    batch.update(msgDoc.ref, { readBy: readBy });
                    count++;
                }
            });

            if (count > 0) {
                return batch.commit();
            }
        });
    },

    setupTypingIndicator: function() {
        var rtdb = window.firebase.rtdb;
        var rtdbRef = window.firebase.rtdbRef;
        var onValue = window.firebase.onValue;
        var userId = window.SoroAuth.currentUser.uid;
        var otherUid = null;

        if (this.currentChatData && this.currentChatData.participants) {
            otherUid = this.currentChatData.participants.find(function(uid) {
                return uid !== userId;
            });
        }

        if (otherUid) {
            var self = this;
            var typingRef = rtdbRef(rtdb, 'presence/' + otherUid + '/typingIn');
            onValue(typingRef, function(snapshot) {
                var typingIn = snapshot.val();
                var indicator = document.getElementById('typing-indicator');
                if (indicator) {
                    if (typingIn === self.currentChatId) {
                        indicator.style.display = 'block';
                    } else {
                        indicator.style.display = 'none';
                    }
                }
            });
        }
    },

    setTyping: function() {
        var rtdb = window.firebase.rtdb;
        var rtdbRef = window.firebase.rtdbRef;
        var set = window.firebase.set;

        clearTimeout(this.typingTimeout);
        set(rtdbRef(rtdb, 'presence/' + window.SoroAuth.currentUser.uid + '/typingIn'), this.currentChatId);

        var self = this;
        this.typingTimeout = setTimeout(function() {
            self.clearTyping();
        }, 3000);
    },

    clearTyping: function() {
        var rtdb = window.firebase.rtdb;
        var rtdbRef = window.firebase.rtdbRef;
        var set = window.firebase.set;
        set(rtdbRef(rtdb, 'presence/' + window.SoroAuth.currentUser.uid + '/typingIn'), null);
    },

    createPoll: function(question, options, multipleChoice, anonymous, duration) {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var addDoc = window.firebase.addDoc;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var serverTimestamp = window.firebase.serverTimestamp;

        var pollData = {
            question: question,
            options: options.map(function(text) {
                return { text: text, votes: 0, voters: [] };
            }),
            multipleChoice: multipleChoice,
            anonymous: anonymous,
            duration: duration,
            closesAt: null
        };

        var messageData = {
            senderId: window.SoroAuth.currentUser.uid,
            type: 'poll',
            text: 'Poll: ' + question,
            pollData: pollData,
            timestamp: serverTimestamp(),
            readBy: [window.SoroAuth.currentUser.uid]
        };

        var self = this;
        addDoc(collection(db, 'chats', this.currentChatId, 'messages'), messageData).then(function() {
            return updateDoc(doc(db, 'chats', self.currentChatId), {
                lastMessage: 'Poll: ' + question,
                lastMessageTime: serverTimestamp(),
                lastMessageSenderId: window.SoroAuth.currentUser.uid
            });
        });
    },

    closeChat: function() {
        this.currentChatId = null;
        this.currentChatData = null;

        if (this.messagesListener) {
            this.messagesListener();
            this.messagesListener = null;
        }

        this.clearTyping();
    },

    loadFriendRequests: function() {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var query = window.firebase.query;
        var where = window.firebase.where;
        var getDocs = window.firebase.getDocs;
        var doc = window.firebase.doc;
        var getDoc = window.firebase.getDoc;
        var userId = window.SoroAuth.currentUser.uid;

        var requestsQuery = query(
            collection(db, 'friendRequests'),
            where('to', '==', userId),
            where('status', '==', 'pending')
        );

        var self = this;
        getDocs(requestsQuery).then(function(snapshot) {
            snapshot.forEach(function(requestDoc) {
                var request = requestDoc.data();
                getDoc(doc(db, 'users', request.from)).then(function(fromUser) {
                    if (fromUser.exists()) {
                        var userData = fromUser.data();
                        self.renderFriendRequest(requestDoc.id, userData);
                    }
                });
            });
        });
    },

    renderFriendRequest: function(requestId, userData) {
        var chatList = document.getElementById('chat-list');
        if (!chatList || chatList.querySelector('[data-request-id="' + requestId + '"]')) {
            return;
        }

        var avatarStyle = this.getAvatarStyle(userData.displayName);
        var requestItem = document.createElement('div');
        requestItem.className = 'chat-item request-item';
        requestItem.setAttribute('data-request-id', requestId);
        requestItem.innerHTML =
            '<div class="avatar" style="background:' + avatarStyle + ';width:44px;height:44px;font-size:16px;">' +
            userData.displayName.charAt(0) +
            '</div>' +
            '<div class="chat-info">' +
            '<div class="chat-name">' + U.escapeHtml(userData.displayName) + ' <span class="request-badge">New</span></div>' +
            '<div class="chat-preview">Wants to connect on SORO</div>' +
            '</div>';

        var self = this;
        requestItem.addEventListener('click', function() {
            self.showFriendRequestModal(requestId, userData);
        });

        chatList.insertBefore(requestItem, chatList.firstChild);
    },

    showFriendRequestModal: function(requestId, userData) {
        var modal = document.getElementById('modal-overlay');
        var content = document.getElementById('modal-content');
        var avatarStyle = this.getAvatarStyle(userData.displayName);

        content.innerHTML =
            '<h3>Friend Request</h3>' +
            '<div style="text-align:center;margin-bottom:16px;">' +
            '<div class="avatar avatar-lg" style="background:' + avatarStyle + ';margin:0 auto 8px;">' + userData.displayName.charAt(0) + '</div>' +
            '<div style="font-weight:600;color:var(--text-in)">' + U.escapeHtml(userData.displayName) + '</div>' +
            '<div style="font-size:12px;color:var(--terracotta)">@' + U.escapeHtml(userData.username) + '</div>' +
            '</div>' +
            '<p style="color:var(--text-in);margin-bottom:16px;text-align:center">' + U.escapeHtml(userData.displayName) + ' wants to add you as a friend on SORO.</p>' +
            '<div class="modal-actions">' +
            '<button class="btn btn-secondary" onclick="window.SoroChat.respondToRequest(\'' + requestId + '\', \'declined\')">Decline</button>' +
            '<button class="btn btn-primary" onclick="window.SoroChat.respondToRequest(\'' + requestId + '\', \'accepted\')">Accept</button>' +
            '</div>';

        modal.classList.add('open');
    },

    respondToRequest: function(requestId, status) {
        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var getDoc = window.firebase.getDoc;
        var collection = window.firebase.collection;
        var addDoc = window.firebase.addDoc;
        var serverTimestamp = window.firebase.serverTimestamp;

        var self = this;
        updateDoc(doc(db, 'friendRequests', requestId), { status: status }).then(function() {
            if (status === 'accepted') {
                return getDoc(doc(db, 'friendRequests', requestId)).then(function(requestDoc) {
                    var request = requestDoc.data();
                    return addDoc(collection(db, 'chats'), {
                        type: 'direct',
                        participants: [request.from, request.to],
                        lastMessage: 'Chat started! Say hello.',
                        lastMessageTime: serverTimestamp(),
                        lastMessageSenderId: request.to,
                        createdAt: serverTimestamp(),
                        isArchived: {},
                        isPinned: {},
                        isMuted: {},
                        wallpaper: {}
                    });
                });
            }
        }).then(function() {
            document.getElementById('modal-overlay').classList.remove('open');
            U.showToast(status === 'accepted' ? 'Request accepted!' : 'Request declined');
            self.loadChatList();
        });
    }
};