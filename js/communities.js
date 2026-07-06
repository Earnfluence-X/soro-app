// Communities Module
window.SoroCommunities = {
    async loadCommunities() {
        const { db, collection, query, where, getDocs } = window.firebase;
        const container = document.getElementById('communities-list');
        if (!container) return;

        const communitiesQuery = query(
            collection(db, 'communities'),
            where('memberUids', 'array-contains', window.SoroAuth.currentUser.uid)
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
            item.className = 'channel-item';
            item.innerHTML = `
                <div class="channel-icon">
                    <svg class="icon" viewBox="0 0 24 24"><use href="#icon-users"/></svg>
                </div>
                <div style="flex:1">
                    <div style="font-weight:600;color:var(--text-in)">${U.escapeHtml(community.name)}</div>
                    <div style="font-size:11px;opacity:0.5;color:var(--text-in)">${U.escapeHtml(community.description || '')}</div>
                </div>
                <span style="font-size:11px;opacity:0.4">${community.channelIds?.length || 0} channels</span>
            `;
            item.addEventListener('click', () => this.openCommunity(community.id, community));
            container.appendChild(item);
        });
    },

    async createCommunity() {
        const name = prompt('Community name:');
        if (!name || !name.trim()) return;

        const description = prompt('Description (optional):') || '';

        const { db, collection, addDoc, serverTimestamp } = window.firebase;

        await addDoc(collection(db, 'communities'), {
            name: name.trim(),
            description: description.trim(),
            photoURL: null,
            ownerUid: window.SoroAuth.currentUser.uid,
            adminUids: [window.SoroAuth.currentUser.uid],
            memberUids: [window.SoroAuth.currentUser.uid],
            channelIds: [],
            privacy: 'public',
            createdAt: serverTimestamp()
        });

        U.showToast('Community created!');
        this.loadCommunities();
    },

    openCommunity(communityId, community) {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');

        content.innerHTML = `
            <div class="community-hero">
                <div class="community-avatar">
                    <svg class="icon" viewBox="0 0 24 24"><use href="#icon-users"/></svg>
                </div>
                <div class="community-name">${U.escapeHtml(community.name)}</div>
                <div class="community-desc">${U.escapeHtml(community.description || '')}</div>
                <div style="font-size:11px;color:var(--terracotta);margin-top:4px">${community.channelIds?.length || 0} channels · ${community.memberUids?.length || 0} members</div>
            </div>

            <div class="settings-section">Actions</div>
            <div class="settings-item" onclick="window.SoroCommunities.addChannel('${communityId}')">
                <div class="settings-item-left">+ Add Channel</div>
            </div>
            <div class="settings-item danger-text" onclick="window.SoroCommunities.leaveCommunity('${communityId}')">
                <div class="settings-item-left">Leave Community</div>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="document.getElementById('modal-overlay').classList.remove('open')">Close</button>
            </div>
        `;

        modal.classList.add('open');
    },

    async addChannel(communityId) {
        const name = prompt('Channel name:');
        if (!name || !name.trim()) return;

        const { db, doc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp } = window.firebase;

        // Create the group chat as a channel
        const channelRef = await addDoc(collection(db, 'chats'), {
            type: 'group',
            participants: [window.SoroAuth.currentUser.uid],
            groupName: name.trim(),
            groupDescription: '',
            groupPhotoURL: null,
            groupPrivacy: 'public',
            slowMode: 0,
            ownerUid: window.SoroAuth.currentUser.uid,
            adminUids: [window.SoroAuth.currentUser.uid],
            lastMessage: 'Channel created',
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: window.SoroAuth.currentUser.uid,
            createdAt: serverTimestamp(),
            communityId: communityId,
            isArchived: {},
            isPinned: {},
            isMuted: {},
            wallpaper: {}
        });

        // Add channel to community
        await updateDoc(doc(db, 'communities', communityId), {
            channelIds: arrayUnion(channelRef.id)
        });

        U.showToast('Channel added!');
        document.getElementById('modal-overlay').classList.remove('open');
        this.loadCommunities();
    },

    async leaveCommunity(communityId) {
        if (!confirm('Leave this community?')) return;

        const { db, doc, updateDoc, arrayRemove } = window.firebase;
        const userId = window.SoroAuth.currentUser.uid;

        await updateDoc(doc(db, 'communities', communityId), {
            memberUids: arrayRemove(userId)
        });

        document.getElementById('modal-overlay').classList.remove('open');
        U.showToast('Left community');
        this.loadCommunities();
    }
};