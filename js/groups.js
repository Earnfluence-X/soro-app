// Group Management Module - Spark Plan (No Storage)
window.SoroGroups = {
    createGroup: function(name, description, memberIds, privacy) {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var addDoc = window.firebase.addDoc;
        var serverTimestamp = window.firebase.serverTimestamp;
        var userId = window.SoroAuth.currentUser.uid;

        var groupData = {
            type: 'group',
            participants: [userId].concat(memberIds),
            groupName: name,
            groupDescription: description || '',
            groupPhotoURL: null,
            groupPrivacy: privacy || 'public',
            slowMode: 0,
            ownerUid: userId,
            adminUids: [userId],
            lastMessage: 'Group created',
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: userId,
            createdAt: serverTimestamp(),
            communityId: null,
            isArchived: {},
            isPinned: {},
            isMuted: {},
            wallpaper: {}
        };

        var self = this;
        return addDoc(collection(db, 'chats'), groupData).then(function(groupRef) {
            return addDoc(collection(db, 'chats', groupRef.id, 'messages'), {
                senderId: userId,
                type: 'system',
                text: window.SoroAuth.userData.displayName + ' created the group',
                timestamp: serverTimestamp(),
                readBy: [userId]
            }).then(function() {
                U.showToast('Group created!');
                window.SoroApp.showScreen('chats');
                window.SoroChat.openChat(groupRef.id);
                return groupRef.id;
            });
        });
    },

    openGroupSettings: function() {
        if (!window.SoroChat.currentChatData || window.SoroChat.currentChatData.type !== 'group') {
            return;
        }

        var chat = window.SoroChat.currentChatData;
        var isOwner = chat.ownerUid === window.SoroAuth.currentUser.uid;
        var isAdmin = chat.adminUids && chat.adminUids.indexOf(window.SoroAuth.currentUser.uid) !== -1;
        var groupInitial = (chat.groupName || 'G').charAt(0).toUpperCase();

        var modal = document.getElementById('modal-overlay');
        var content = document.getElementById('modal-content');

        var html = '<h3>Group Settings</h3>';
        html += '<div style="text-align:center;margin-bottom:16px;">';
        html += '<div class="avatar avatar-lg" style="background:linear-gradient(135deg,#5A7A8A,#4A6A7A);margin:0 auto 8px;font-size:28px;">' + groupInitial + '</div>';
        html += '<div style="font-weight:600;color:var(--text-in)">' + U.escapeHtml(chat.groupName || 'Group') + '</div>';
        html += '<div style="font-size:12px;color:var(--terracotta)">' + (chat.participants ? chat.participants.length : 0) + ' members</div>';
        html += '</div>';

        html += '<div class="settings-section">Group Info</div>';
        html += '<div class="settings-item" onclick="window.SoroGroups.editGroupName()"><div class="settings-item-left">Group Name</div><span class="settings-value">' + U.escapeHtml(chat.groupName || '') + '</span></div>';
        html += '<div class="settings-item" onclick="window.SoroGroups.editGroupDescription()"><div class="settings-item-left">Description</div><span class="settings-value">' + U.escapeHtml(chat.groupDescription || '') + '</span></div>';

        html += '<div class="settings-section">Settings</div>';
        html += '<div class="settings-item" onclick="window.SoroGroups.toggleSlowMode()"><div class="settings-item-left">Slow Mode</div><span class="settings-value">' + (chat.slowMode ? chat.slowMode + 's' : 'Off') + '</span></div>';
        html += '<div class="settings-item" onclick="window.SoroGroups.toggleMute()"><div class="settings-item-left">Mute Group</div><div class="toggle ' + (chat.isMuted && chat.isMuted[window.SoroAuth.currentUser.uid] ? 'on' : '') + '"></div></div>';

        html += '<div class="settings-section">Actions</div>';
        if (isAdmin) {
            html += '<div class="settings-item" onclick="window.SoroGroups.sendBroadcast()"><div class="settings-item-left">Send Broadcast</div></div>';
            html += '<div class="settings-item" onclick="window.SoroGroups.manageMembers()"><div class="settings-item-left">Manage Members</div></div>';
        }
        html += '<div class="settings-item" onclick="window.SoroGroups.archiveGroup()"><div class="settings-item-left">Archive Group</div></div>';
        html += '<div class="settings-item danger-text" onclick="window.SoroGroups.exitGroup()"><div class="settings-item-left">Exit Group</div></div>';

        html += '<div class="modal-actions"><button class="btn btn-secondary" onclick="document.getElementById(\'modal-overlay\').classList.remove(\'open\')">Close</button></div>';

        content.innerHTML = html;
        modal.classList.add('open');
    },

    editGroupName: function() {
        var chat = window.SoroChat.currentChatData;
        var newName = prompt('Enter new group name:', chat.groupName);
        if (newName && newName.trim()) {
            var db = window.firebase.db;
            var doc = window.firebase.doc;
            var updateDoc = window.firebase.updateDoc;
            updateDoc(doc(db, 'chats', chat.id), { groupName: newName.trim() }).then(function() {
                chat.groupName = newName.trim();
                document.getElementById('chat-title').textContent = newName.trim();
                U.showToast('Group name updated');
            });
        }
    },

    editGroupDescription: function() {
        var chat = window.SoroChat.currentChatData;
        var newDesc = prompt('Enter new description:', chat.groupDescription);
        if (newDesc !== null) {
            var db = window.firebase.db;
            var doc = window.firebase.doc;
            var updateDoc = window.firebase.updateDoc;
            updateDoc(doc(db, 'chats', chat.id), { groupDescription: newDesc.trim() }).then(function() {
                chat.groupDescription = newDesc.trim();
                U.showToast('Description updated');
            });
        }
    },

    toggleSlowMode: function() {
        var chat = window.SoroChat.currentChatData;
        var options = [0, 10, 30, 60, 300];
        var currentIndex = options.indexOf(chat.slowMode || 0);
        var nextValue = options[(currentIndex + 1) % options.length];

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        updateDoc(doc(db, 'chats', chat.id), { slowMode: nextValue }).then(function() {
            chat.slowMode = nextValue;
            var label = nextValue === 0 ? 'Off' : nextValue + 's';
            U.showToast('Slow mode: ' + label);
        });
    },

    toggleMute: function() {
        var chat = window.SoroChat.currentChatData;
        var userId = window.SoroAuth.currentUser.uid;
        var isMuted = chat.isMuted && chat.isMuted[userId] ? true : false;

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var updateData = {};
        updateData['isMuted.' + userId] = !isMuted;

        updateDoc(doc(db, 'chats', chat.id), updateData).then(function() {
            if (!chat.isMuted) chat.isMuted = {};
            chat.isMuted[userId] = !isMuted;
            U.showToast(isMuted ? 'Group unmuted' : 'Group muted');
        });
    },

    sendBroadcast: function() {
        var message = prompt('Enter broadcast message:');
        if (message && message.trim()) {
            var db = window.firebase.db;
            var collection = window.firebase.collection;
            var addDoc = window.firebase.addDoc;
            var serverTimestamp = window.firebase.serverTimestamp;

            addDoc(collection(db, 'chats', window.SoroChat.currentChatId, 'messages'), {
                senderId: window.SoroAuth.currentUser.uid,
                type: 'system',
                text: message.trim(),
                isBroadcast: true,
                timestamp: serverTimestamp(),
                readBy: [window.SoroAuth.currentUser.uid]
            }).then(function() {
                U.showToast('Broadcast sent');
                document.getElementById('modal-overlay').classList.remove('open');
            });
        }
    },

    manageMembers: function() {
        var chat = window.SoroChat.currentChatData;
        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var getDoc = window.firebase.getDoc;

        var self = this;
        var membersHTML = '';
        var promises = [];

        chat.participants.forEach(function(uid) {
            promises.push(
                getDoc(doc(db, 'users', uid)).then(function(userDoc) {
                    if (userDoc.exists()) {
                        var user = userDoc.data();
                        var role = uid === chat.ownerUid ? 'Owner' :
                            (chat.adminUids && chat.adminUids.indexOf(uid) !== -1 ? 'Admin' : 'Member');
                        membersHTML += '<div class="settings-item">' +
                            '<div class="settings-item-left">' +
                            '<div class="avatar avatar-sm" style="background:linear-gradient(135deg,#D47A3A,#C26A4A);">' + user.displayName.charAt(0) + '</div>' +
                            '<div><div>' + U.escapeHtml(user.displayName) + '</div><div style="font-size:10px;color:var(--admin-badge)">' + role + '</div></div>' +
                            '</div>';
                        if (uid !== window.SoroAuth.currentUser.uid && window.SoroAuth.currentUser.uid === chat.ownerUid) {
                            membersHTML += '<button class="btn btn-secondary" style="padding:4px 10px;font-size:11px" onclick="window.SoroGroups.removeMember(\'' + uid + '\')">Remove</button>';
                        }
                        membersHTML += '</div>';
                    }
                })
            );
        });

        Promise.all(promises).then(function() {
            var content = document.getElementById('modal-content');
            content.innerHTML = '<h3>Manage Members</h3>' + membersHTML +
                '<div class="settings-item" onclick="window.SoroGroups.addMembers()"><div class="settings-item-left" style="color:var(--accent)">+ Add Members</div></div>' +
                '<div class="modal-actions"><button class="btn btn-secondary" onclick="window.SoroGroups.openGroupSettings()">Back</button></div>';
        });
    },

    removeMember: function(uid) {
        if (!confirm('Remove this member from the group?')) return;

        var chat = window.SoroChat.currentChatData;
        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;

        var newParticipants = chat.participants.filter(function(id) {
            return id !== uid;
        });
        var newAdmins = chat.adminUids ? chat.adminUids.filter(function(id) {
            return id !== uid;
        }) : [];

        updateDoc(doc(db, 'chats', chat.id), {
            participants: newParticipants,
            adminUids: newAdmins
        }).then(function() {
            chat.participants = newParticipants;
            chat.adminUids = newAdmins;
            U.showToast('Member removed');
            window.SoroGroups.manageMembers();
        });
    },

    addMembers: function() {
        var db = window.firebase.db;
        var collection = window.firebase.collection;
        var getDocs = window.firebase.getDocs;
        var userId = window.SoroAuth.currentUser.uid;

        getDocs(collection(db, 'users')).then(function(snapshot) {
            var userListHTML = '';

            snapshot.forEach(function(userDoc) {
                if (userDoc.id === userId || window.SoroChat.currentChatData.participants.indexOf(userDoc.id) !== -1) {
                    return;
                }
                var user = userDoc.data();
                userListHTML += '<div class="contact-check" onclick="this.classList.toggle(\'selected\'); this.querySelector(\'input\').checked = !this.querySelector(\'input\').checked">' +
                    '<input type="checkbox" value="' + userDoc.id + '">' +
                    '<div class="avatar avatar-sm" style="background:linear-gradient(135deg,#D47A3A,#C26A4A);">' + user.displayName.charAt(0) + '</div>' +
                    '<span>' + U.escapeHtml(user.displayName) + '</span>' +
                    '</div>';
            });

            var content = document.getElementById('modal-content');
            content.innerHTML = '<h3>Add Members</h3>' +
                '<div style="max-height:300px;overflow-y:auto">' + userListHTML + '</div>' +
                '<div class="modal-actions">' +
                '<button class="btn btn-secondary" onclick="window.SoroGroups.manageMembers()">Cancel</button>' +
                '<button class="btn btn-primary" onclick="window.SoroGroups.confirmAddMembers()">Add Selected</button>' +
                '</div>';
        });
    },

    confirmAddMembers: function() {
        var selected = document.querySelectorAll('#modal-content input:checked');
        if (selected.length === 0) {
            U.showToast('Select at least one person');
            return;
        }

        var chat = window.SoroChat.currentChatData;
        var newMembers = Array.from(selected).map(function(cb) {
            return cb.value;
        });
        var updatedParticipants = chat.participants.concat(newMembers);

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;

        updateDoc(doc(db, 'chats', chat.id), { participants: updatedParticipants }).then(function() {
            chat.participants = updatedParticipants;
            U.showToast(newMembers.length + ' member(s) added');
            window.SoroGroups.manageMembers();
        });
    },

    archiveGroup: function() {
        if (!confirm('Archive this group? You can restore it from Settings > Archived Chats.')) return;

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var userId = window.SoroAuth.currentUser.uid;
        var updateData = {};
        updateData['isArchived.' + userId] = true;

        updateDoc(doc(db, 'chats', window.SoroChat.currentChatId), updateData).then(function() {
            document.getElementById('modal-overlay').classList.remove('open');
            window.SoroChat.closeChat();
            window.SoroApp.showScreen('chats');
            U.showToast('Group archived');
        });
    },

    exitGroup: function() {
        if (!confirm('Leave this group? You will no longer receive messages.')) return;

        var chat = window.SoroChat.currentChatData;
        var userId = window.SoroAuth.currentUser.uid;
        var newParticipants = chat.participants.filter(function(uid) {
            return uid !== userId;
        });

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var updateData = {};

        if (chat.ownerUid === userId && newParticipants.length > 0) {
            var newOwner = (chat.adminUids || []).find(function(uid) {
                return uid !== userId;
            }) || newParticipants[0];
            updateData = {
                participants: newParticipants,
                ownerUid: newOwner,
                adminUids: (chat.adminUids || []).filter(function(uid) {
                    return uid !== userId;
                })
            };
        } else {
            updateData = {
                participants: newParticipants,
                adminUids: (chat.adminUids || []).filter(function(uid) {
                    return uid !== userId;
                })
            };
        }

        updateDoc(doc(db, 'chats', chat.id), updateData).then(function() {
            document.getElementById('modal-overlay').classList.remove('open');
            window.SoroChat.closeChat();
            window.SoroApp.showScreen('chats');
            U.showToast('You left the group');
        });
    }
};