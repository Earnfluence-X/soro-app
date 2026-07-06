// Settings Module - Spark Plan (No Storage, Initials Avatar)
window.SoroSettings = {
    loadSettings: function() {
        var user = window.SoroAuth.userData;
        if (!user) {
            return;
        }

        document.getElementById('settings-name').textContent = user.displayName || 'User';
        document.getElementById('settings-username').textContent = '@' + (user.username || 'user');
        document.getElementById('val-displayName').textContent = user.displayName || 'Set name';
        document.getElementById('val-username').textContent = '@' + (user.username || 'user');
        document.getElementById('val-bio').textContent = user.bio || 'Add bio';
        document.getElementById('val-email').textContent = user.email || '';
        document.getElementById('val-theme').textContent = user.theme || 'Light';
        document.getElementById('val-lastSeen').textContent = user.lastSeenPrivacy || 'Contacts';

        var readReceiptsToggle = document.getElementById('read-receipts-toggle');
        if (readReceiptsToggle) {
            readReceiptsToggle.className = 'toggle' + (user.readReceiptsOn ? ' on' : '');
        }

        var dataSaverToggle = document.getElementById('data-saver-toggle');
        if (dataSaverToggle) {
            dataSaverToggle.className = 'toggle' + (user.dataSaverOn ? ' on' : '');
        }

        var avatarEl = document.getElementById('settings-avatar');
        if (avatarEl && !user.avatarURL) {
            var initials = (user.displayName || 'U').charAt(0).toUpperCase();
            var avatarStyle = window.SoroChat.getAvatarStyle(user.displayName || 'User');
            avatarEl.style.background = avatarStyle;
            avatarEl.innerHTML = '<span style="font-size:28px;font-weight:700;">' + initials + '</span>';
        }

        this.updateProfileProgress();
    },

    updateProfileProgress: function() {
        var user = window.SoroAuth.userData;
        var progress = 0;
        if (user.displayName && user.displayName !== (user.email ? user.email.split('@')[0] : '')) progress += 33;
        if (user.bio) progress += 33;
        if (user.username) progress += 34;

        var progressBar = document.getElementById('profile-progress');
        var progressText = document.getElementById('profile-progress-text');
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressText) progressText.textContent = 'Profile ' + progress + '% complete';
    },

    changeProfilePhoto: function() {
        var colors = [
            'linear-gradient(135deg, #D47A3A, #C26A4A)',
            'linear-gradient(135deg, #4A6FA5, #3B5A8A)',
            'linear-gradient(135deg, #6B8E5A, #5A7A4A)',
            'linear-gradient(135deg, #8B5A8A, #6A4A6A)',
            'linear-gradient(135deg, #D4A373, #C49363)',
            'linear-gradient(135deg, #5A7A8A, #4A6A7A)'
        ];
        var randomColor = colors[Math.floor(Math.random() * colors.length)];
        var avatarEl = document.getElementById('settings-avatar');
        if (avatarEl) {
            avatarEl.style.background = randomColor;
        }
        U.showToast('Avatar color updated');
    },

    editProfile: function(field) {
        var user = window.SoroAuth.userData;
        var currentValue = '';
        if (field === 'displayName') currentValue = user.displayName || '';
        else if (field === 'username') currentValue = user.username || '';
        else if (field === 'bio') currentValue = user.bio || '';
        else if (field === 'email') currentValue = user.email || '';

        var value = prompt('Edit ' + field + ':', currentValue);
        if (value === null || value.trim() === '') {
            return;
        }

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        var updateData = {};
        updateData[field] = value.trim();

        var self = this;
        updateDoc(doc(db, 'users', user.uid), updateData).then(function() {
            window.SoroAuth.userData[field] = value.trim();
            self.loadSettings();
            U.showToast(field + ' updated');
        });
    },

    changeTheme: function() {
        var themes = ['light', 'dark', 'system'];
        var current = window.SoroAuth.userData.theme || 'light';
        var nextIndex = (themes.indexOf(current) + 1) % themes.length;
        var nextTheme = themes[nextIndex];

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;

        updateDoc(doc(db, 'users', window.SoroAuth.currentUser.uid), { theme: nextTheme }).then(function() {
            window.SoroAuth.userData.theme = nextTheme;
            if (nextTheme === 'dark') {
                document.getElementById('app').classList.add('dark');
            } else {
                document.getElementById('app').classList.remove('dark');
            }
            document.getElementById('val-theme').textContent = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
            U.showToast('Theme: ' + nextTheme);
        });
    },

    toggleReadReceipts: function() {
        var toggle = document.getElementById('read-receipts-toggle');
        var newValue = !toggle.classList.contains('on');
        toggle.classList.toggle('on', newValue);

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        updateDoc(doc(db, 'users', window.SoroAuth.currentUser.uid), { readReceiptsOn: newValue });
        window.SoroAuth.userData.readReceiptsOn = newValue;
    },

    toggleDataSaver: function() {
        var toggle = document.getElementById('data-saver-toggle');
        var newValue = !toggle.classList.contains('on');
        toggle.classList.toggle('on', newValue);

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        updateDoc(doc(db, 'users', window.SoroAuth.currentUser.uid), { dataSaverOn: newValue });
        window.SoroAuth.userData.dataSaverOn = newValue;
        U.showToast('Data saver ' + (newValue ? 'on' : 'off'));
    },

    changeLastSeen: function() {
        var options = ['everyone', 'contacts', 'nobody'];
        var current = window.SoroAuth.userData.lastSeenPrivacy || 'contacts';
        var nextIndex = (options.indexOf(current) + 1) % options.length;
        var nextValue = options[nextIndex];

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var updateDoc = window.firebase.updateDoc;
        updateDoc(doc(db, 'users', window.SoroAuth.currentUser.uid), { lastSeenPrivacy: nextValue }).then(function() {
            window.SoroAuth.userData.lastSeenPrivacy = nextValue;
            document.getElementById('val-lastSeen').textContent = nextValue.charAt(0).toUpperCase() + nextValue.slice(1);
            U.showToast('Last seen: ' + nextValue);
        });
    },

    changePassword: function() {
        var newPassword = prompt('Enter new password (min 8 chars, 1 number):');
        if (!newPassword || newPassword.length < 8 || !/\d/.test(newPassword)) {
            U.showToast('Password must be 8+ characters with a number');
            return;
        }
        var updatePassword = window.firebase.updatePassword;
        var auth = window.firebase.auth;
        updatePassword(auth.currentUser, newPassword).then(function() {
            U.showToast('Password updated');
        }).catch(function(error) {
            U.showToast('Failed. Re-login and try again.');
        });
    },

    deleteAccount: function() {
        if (!confirm('Delete your SORO account? This cannot be undone.')) return;
        if (!confirm('Are you absolutely sure?')) return;

        var db = window.firebase.db;
        var doc = window.firebase.doc;
        var deleteDoc = window.firebase.deleteDoc;
        var auth = window.firebase.auth;
        var deleteUser = window.firebase.deleteUser;

        deleteDoc(doc(db, 'users', window.SoroAuth.currentUser.uid)).then(function() {
            return deleteUser(auth.currentUser);
        }).then(function() {
            U.showToast('Account deleted');
        }).catch(function(error) {
            U.showToast('Failed. Re-login and try again.');
        });
    },

    openActiveSessions: function() {
        var modal = document.getElementById('modal-overlay');
        var content = document.getElementById('modal-content');
        content.innerHTML =
            '<h3>Active Sessions</h3>' +
            '<div class="settings-item">' +
            '<div class="settings-item-left">' +
            '<span class="settings-icon-box"><svg class="icon" viewBox="0 0 24 24"><use href="#icon-device"/></svg></span>' +
            '<div><div style="font-weight:600">Current Device</div><div style="font-size:10px;opacity:0.5">' + navigator.userAgent.substring(0, 50) + '...</div></div>' +
            '</div>' +
            '<span style="color:var(--online);font-size:11px">Current</span>' +
            '</div>' +
            '<div class="modal-actions"><button class="btn btn-secondary" onclick="document.getElementById(\'modal-overlay\').classList.remove(\'open\')">Close</button></div>';
        modal.classList.add('open');
    },

    openBlockedUsers: function() {
        var modal = document.getElementById('modal-overlay');
        var content = document.getElementById('modal-content');
        content.innerHTML =
            '<h3>Blocked Users</h3>' +
            '<p style="text-align:center;color:var(--terracotta);opacity:0.5;padding:20px">No blocked users</p>' +
            '<div class="modal-actions"><button class="btn btn-secondary" onclick="document.getElementById(\'modal-overlay\').classList.remove(\'open\')">Close</button></div>';
        modal.classList.add('open');
    }
};