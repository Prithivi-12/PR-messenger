// PR Messenger - Real-time Chat Application
class PRMessenger {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingStartTime = null;
        this.recordingTimer = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.isInCall = false;
        this.callStartTime = null;
        this.callTimer = null;
        this.dataChannel = null;
        this.syncInterval = null;
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('PR Messenger initializing...');
        this.bindEvents();
        this.showLandingPage();
        this.startSync();
        this.setupWebRTC();
        console.log('PR Messenger initialized successfully');
    }

    // Event Binding
    bindEvents() {
        // Landing page events
        const createBtn = document.getElementById('createRoomBtn');
        const joinBtn = document.getElementById('joinRoomBtn');
        
        if (createBtn) {
            createBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Create room button clicked');
                this.showCreateRoomModal();
            });
        }
        
        if (joinBtn) {
            joinBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Join room button clicked');
                this.showJoinRoomModal();
            });
        }
        
        // Modal events
        const joinConfirm = document.getElementById('joinRoomConfirm');
        const enterBtn = document.getElementById('enterRoomBtn');
        const copyBtn = document.getElementById('copyCodeBtn');
        
        if (joinConfirm) {
            joinConfirm.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.joinRoom();
            });
        }
        
        if (enterBtn) {
            enterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.enterRoom();
            });
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.copyRoomCode();
            });
        }
        
        // Chat events
        const sendBtn = document.getElementById('sendMessageBtn');
        const messageInput = document.getElementById('messageInput');
        const leaveBtn = document.getElementById('leaveRoomBtn');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.sendMessage();
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (leaveBtn) {
            leaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Leave room button clicked');
                this.leaveRoom();
            });
        }
        
        // Logo click to return home
        const navbar = document.querySelector('.navbar-brand');
        if (navbar) {
            navbar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Logo clicked - returning to home');
                this.leaveRoom();
            });
            navbar.style.cursor = 'pointer';
        }
        
        // Media events
        const voiceBtn = document.getElementById('voiceRecordBtn');
        const fileBtn = document.getElementById('fileUploadBtn');
        const videoBtn = document.getElementById('videoCallBtn');
        const callBtn = document.getElementById('voiceCallBtn');
        const screenBtn = document.getElementById('screenShareBtn');
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startVoiceRecording();
            });
        }
        
        if (fileBtn) {
            fileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.triggerFileUpload();
            });
        }
        
        if (videoBtn) {
            videoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startVideoCall();
            });
        }
        
        if (callBtn) {
            callBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startVoiceCall();
            });
        }
        
        if (screenBtn) {
            screenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startScreenShare();
            });
        }
        
        // Voice recording modal events
        const stopBtn = document.getElementById('stopRecordingBtn');
        const discardBtn = document.getElementById('discardRecordingBtn');
        const sendVoiceBtn = document.getElementById('sendVoiceBtn');
        
        if (stopBtn) {
            stopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.stopRecording();
            });
        }
        
        if (discardBtn) {
            discardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.discardRecording();
            });
        }
        
        if (sendVoiceBtn) {
            sendVoiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.sendVoiceMessage();
            });
        }
        
        // Call control events
        const endCallBtn = document.getElementById('endCallBtn');
        const muteBtn = document.getElementById('muteBtn');
        const cameraBtn = document.getElementById('cameraBtn');
        const shareScreenBtn = document.getElementById('shareScreenBtn');
        
        if (endCallBtn) {
            endCallBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.endCall();
            });
        }
        
        if (muteBtn) {
            muteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMute();
            });
        }
        
        if (cameraBtn) {
            cameraBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCamera();
            });
        }
        
        if (shareScreenBtn) {
            shareScreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleScreenShare();
            });
        }
        
        // File upload events
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        // Storage events for real-time sync
        window.addEventListener('storage', (e) => this.handleStorageChange(e));
        
        // Drag and drop for files
        this.setupDragAndDrop();
    }

    // Room Management
    generateRoomCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    showCreateRoomModal() {
        console.log('Showing create room modal');
        const code = this.generateRoomCode();
        const codeInput = document.getElementById('generatedRoomCode');
        if (codeInput) {
            codeInput.value = code;
        }
        
        const modal = document.getElementById('createRoomModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    showJoinRoomModal() {
        console.log('Showing join room modal');
        const modal = document.getElementById('joinRoomModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    copyRoomCode() {
        const codeInput = document.getElementById('generatedRoomCode');
        if (codeInput) {
            codeInput.select();
            navigator.clipboard.writeText(codeInput.value).then(() => {
                this.showToast('Room code copied to clipboard!');
            }).catch(() => {
                // Fallback for older browsers
                document.execCommand('copy');
                this.showToast('Room code copied to clipboard!');
            });
        }
    }

    createRoom() {
        const codeInput = document.getElementById('generatedRoomCode');
        const nameInput = document.getElementById('creatorNameInput');
        
        if (!codeInput || !nameInput) {
            this.showToast('Error accessing form elements', 'error');
            return;
        }
        
        const code = codeInput.value;
        const userName = nameInput.value.trim();
        
        if (!userName) {
            this.showToast('Please enter your name', 'error');
            return;
        }

        const room = {
            code: code,
            created: new Date().toISOString(),
            participants: [],
            messages: [{
                id: this.generateId(),
                type: 'system',
                content: `Room ${code} created`,
                sender: 'System',
                timestamp: new Date().toISOString()
            }],
            active: true
        };

        this.currentUser = {
            id: this.generateId(),
            name: userName,
            currentRoom: code,
            role: 'creator'
        };

        room.participants.push(this.currentUser);
        
        this.saveRoom(room);
        this.currentRoom = room;
        
        // Hide modal
        const modal = document.getElementById('createRoomModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
        
        this.showChatInterface();
    }

    joinRoom() {
        const codeInput = document.getElementById('roomCodeInput');
        const nameInput = document.getElementById('userNameInput');
        
        if (!codeInput || !nameInput) {
            this.showToast('Error accessing form elements', 'error');
            return;
        }
        
        const code = codeInput.value.trim();
        const userName = nameInput.value.trim();
        
        if (!code || code.length !== 6) {
            this.showToast('Please enter a valid 6-digit room code', 'error');
            return;
        }
        
        if (!userName) {
            this.showToast('Please enter your name', 'error');
            return;
        }

        const room = this.getRoom(code);
        if (!room || !room.active) {
            this.showToast('Room not found or inactive', 'error');
            return;
        }

        this.currentUser = {
            id: this.generateId(),
            name: userName,
            currentRoom: code,
            role: 'participant'
        };

        room.participants.push(this.currentUser);
        room.messages.push({
            id: this.generateId(),
            type: 'system',
            content: `${userName} joined the room`,
            sender: 'System',
            timestamp: new Date().toISOString()
        });

        this.saveRoom(room);
        this.currentRoom = room;
        
        // Hide modal
        const modal = document.getElementById('joinRoomModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
        
        this.showChatInterface();
    }

    enterRoom() {
        this.createRoom();
    }

    leaveRoom() {
        console.log('Leaving room...');
        
        // End any active call first
        if (this.isInCall) {
            this.endCall();
        }
        
        // Stop sync interval
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        if (this.currentRoom && this.currentUser) {
            // Add leave message
            this.currentRoom.messages.push({
                id: this.generateId(),
                type: 'system',
                content: `${this.currentUser.name} left the room`,
                sender: 'System',
                timestamp: new Date().toISOString()
            });

            // Remove participant
            this.currentRoom.participants = this.currentRoom.participants.filter(p => p.id !== this.currentUser.id);
            
            // If no participants left, deactivate room
            if (this.currentRoom.participants.length === 0) {
                this.currentRoom.active = false;
            }

            this.saveRoom(this.currentRoom);
        }
        
        // Reset state
        this.currentRoom = null;
        this.currentUser = null;
        
        // Clear any form inputs
        const inputs = ['roomCodeInput', 'userNameInput', 'creatorNameInput', 'messageInput'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        console.log('Showing landing page...');
        this.showLandingPage();
        this.startSync(); // Restart sync for new sessions
        
        this.showToast('Left the room successfully');
    }

    // UI Management
    showLandingPage() {
        console.log('Displaying landing page');
        const landingPage = document.getElementById('landingPage');
        const chatInterface = document.getElementById('chatInterface');
        const callInterface = document.getElementById('callInterface');
        
        if (landingPage) {
            landingPage.classList.remove('d-none');
            console.log('Landing page shown');
        }
        if (chatInterface) {
            chatInterface.classList.add('d-none');
            console.log('Chat interface hidden');
        }
        if (callInterface) {
            callInterface.classList.add('d-none');
            console.log('Call interface hidden');
        }
    }

    showChatInterface() {
        console.log('Displaying chat interface');
        const landingPage = document.getElementById('landingPage');
        const chatInterface = document.getElementById('chatInterface');
        
        if (landingPage) {
            landingPage.classList.add('d-none');
            console.log('Landing page hidden');
        }
        if (chatInterface) {
            chatInterface.classList.remove('d-none');
            console.log('Chat interface shown');
        }
        
        const roomCodeEl = document.getElementById('currentRoomCode');
        if (roomCodeEl && this.currentRoom) {
            roomCodeEl.textContent = this.currentRoom.code;
        }
        
        this.updateParticipantsList();
        this.updateMessages();
        this.scrollToBottom();
    }

    updateParticipantsList() {
        const container = document.getElementById('participantsList');
        const count = document.getElementById('participantCount');
        
        if (!container || !this.currentRoom) return;
        
        container.innerHTML = '';
        
        this.currentRoom.participants.forEach(participant => {
            const participantEl = document.createElement('div');
            participantEl.className = 'participant online';
            participantEl.innerHTML = `
                <div class="avatar">${participant.name.charAt(0).toUpperCase()}</div>
                <div class="name">${participant.name}</div>
                <div class="status"></div>
            `;
            container.appendChild(participantEl);
        });

        if (count) {
            count.textContent = `${this.currentRoom.participants.length} participant${this.currentRoom.participants.length !== 1 ? 's' : ''}`;
        }
    }

    updateMessages() {
        const container = document.getElementById('messagesContainer');
        if (!container || !this.currentRoom) return;
        
        container.innerHTML = '';

        this.currentRoom.messages.forEach(message => {
            const messageEl = this.createMessageElement(message);
            container.appendChild(messageEl);
        });

        this.scrollToBottom();
    }

    createMessageElement(message) {
        const messageEl = document.createElement('div');
        const isOwn = message.sender === this.currentUser?.name;
        const isSystem = message.type === 'system';

        messageEl.className = `message ${isOwn ? 'own' : ''} ${isSystem ? 'system' : ''}`;

        if (isSystem) {
            messageEl.innerHTML = `
                <div class="message-bubble">${message.content}</div>
            `;
        } else {
            const time = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            let content = '';

            switch (message.type) {
                case 'text':
                    content = `<div class="message-bubble">${this.escapeHtml(message.content)}</div>`;
                    break;
                case 'voice':
                    content = `
                        <div class="message-bubble">
                            <div class="voice-message">
                                <button class="play-btn" onclick="this.nextElementSibling.play()">
                                    <i class="bi bi-play-fill"></i>
                                </button>
                                <audio controls>
                                    <source src="${message.audioUrl}" type="audio/webm">
                                </audio>
                                <span class="duration">${message.duration || '0:00'}</span>
                            </div>
                        </div>
                    `;
                    break;
                case 'file':
                    content = `
                        <div class="message-bubble">
                            <div class="file-message">
                                <div class="file-icon ${message.fileType}">
                                    <i class="bi bi-${this.getFileIcon(message.fileName)}"></i>
                                </div>
                                <div class="file-info">
                                    <div class="file-name">${message.fileName}</div>
                                    <div class="file-size">${this.formatFileSize(message.fileSize)}</div>
                                </div>
                                <button class="btn btn-sm btn-primary download-btn" onclick="window.open('${message.fileUrl}')">
                                    <i class="bi bi-download"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    break;
            }

            messageEl.innerHTML = `
                ${content}
                <div class="message-info">
                    ${!isOwn ? `<strong>${message.sender}</strong> • ` : ''}${time}
                </div>
            `;
        }

        return messageEl;
    }

    // Messaging
    sendMessage() {
        const input = document.getElementById('messageInput');
        if (!input || !this.currentRoom || !this.currentUser) return;
        
        const content = input.value.trim();
        
        if (!content) return;

        const message = {
            id: this.generateId(),
            type: 'text',
            content: content,
            sender: this.currentUser.name,
            timestamp: new Date().toISOString()
        };

        this.currentRoom.messages.push(message);
        this.saveRoom(this.currentRoom);
        
        input.value = '';
        this.updateMessages();
    }

    // Voice Recording
    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            this.recordingStartTime = Date.now();

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blob);
                const recordedAudio = document.getElementById('recordedAudio');
                if (recordedAudio) {
                    recordedAudio.src = audioUrl;
                }
                
                // Show recorded state
                const recordingState = document.getElementById('recordingState');
                const recordedState = document.getElementById('recordedState');
                const stopBtn = document.getElementById('stopRecordingBtn');
                const discardBtn = document.getElementById('discardRecordingBtn');
                const sendBtn = document.getElementById('sendVoiceBtn');
                
                if (recordingState) recordingState.classList.add('d-none');
                if (recordedState) recordedState.classList.remove('d-none');
                if (stopBtn) stopBtn.classList.add('d-none');
                if (discardBtn) discardBtn.classList.remove('d-none');
                if (sendBtn) sendBtn.classList.remove('d-none');
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Show recording modal
            const modal = document.getElementById('voiceRecordModal');
            if (modal) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
            
            // Start timer
            this.recordingTimer = setInterval(() => {
                const elapsed = Date.now() - this.recordingStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                const durationEl = document.getElementById('recordingDuration');
                if (durationEl) {
                    durationEl.textContent = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
            }, 1000);

        } catch (error) {
            this.showToast('Microphone access denied', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            clearInterval(this.recordingTimer);
            
            // Stop all tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    discardRecording() {
        this.recordedChunks = [];
        const modal = document.getElementById('voiceRecordModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
        this.resetRecordingModal();
    }

    sendVoiceMessage() {
        if (!this.currentRoom || !this.currentUser) return;
        
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        const duration = this.formatDuration(Date.now() - this.recordingStartTime);

        const message = {
            id: this.generateId(),
            type: 'voice',
            audioUrl: audioUrl,
            duration: duration,
            sender: this.currentUser.name,
            timestamp: new Date().toISOString()
        };

        this.currentRoom.messages.push(message);
        this.saveRoom(this.currentRoom);
        
        const modal = document.getElementById('voiceRecordModal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
        this.resetRecordingModal();
        this.updateMessages();
    }

    resetRecordingModal() {
        const recordingState = document.getElementById('recordingState');
        const recordedState = document.getElementById('recordedState');
        const stopBtn = document.getElementById('stopRecordingBtn');
        const discardBtn = document.getElementById('discardRecordingBtn');
        const sendBtn = document.getElementById('sendVoiceBtn');
        const durationEl = document.getElementById('recordingDuration');
        
        if (recordingState) recordingState.classList.remove('d-none');
        if (recordedState) recordedState.classList.add('d-none');
        if (stopBtn) stopBtn.classList.remove('d-none');
        if (discardBtn) discardBtn.classList.add('d-none');
        if (sendBtn) sendBtn.classList.add('d-none');
        if (durationEl) durationEl.textContent = '00:00';
    }

    // File Handling
    triggerFileUpload() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    setupDragAndDrop() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            messagesContainer.addEventListener(eventName, this.preventDefaults);
        });

        messagesContainer.addEventListener('drop', (e) => this.handleDrop(e));
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileUpload(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        if (!this.currentRoom || !this.currentUser) return;
        
        files.forEach(file => {
            if (file.size > 50000000) { // 50MB limit
                this.showToast(`File "${file.name}" is too large (max 50MB)`, 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const message = {
                    id: this.generateId(),
                    type: 'file',
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: this.getFileType(file.name),
                    fileUrl: e.target.result,
                    sender: this.currentUser.name,
                    timestamp: new Date().toISOString()
                };

                this.currentRoom.messages.push(message);
                this.saveRoom(this.currentRoom);
                this.updateMessages();
            };
            reader.readAsDataURL(file);
        });
    }

    getFileType(fileName) {
        const extension = fileName.toLowerCase().split('.').pop();
        const types = {
            images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
            audio: ['mp3', 'wav', 'ogg', 'm4a'],
            video: ['mp4', 'webm', 'mov', 'avi']
        };

        for (const [type, extensions] of Object.entries(types)) {
            if (extensions.includes(extension)) return type;
        }
        return 'document';
    }

    getFileIcon(fileName) {
        const type = this.getFileType(fileName);
        const icons = {
            images: 'image',
            documents: 'file-text',
            audio: 'music-note',
            video: 'camera-video'
        };
        return icons[type] || 'file';
    }

    // WebRTC Setup and Call Management
    setupWebRTC() {
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    async startVideoCall() {
        if (!this.currentRoom || this.currentRoom.participants.length < 2) {
            this.showToast('Need at least 2 participants for a call', 'error');
            return;
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            this.peerConnection = new RTCPeerConnection(this.rtcConfig);
            this.setupPeerConnection();
            
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            const localVideo = document.getElementById('localVideo');
            const callInterface = document.getElementById('callInterface');
            const callStatus = document.getElementById('callStatus');
            
            if (localVideo) localVideo.srcObject = this.localStream;
            if (callInterface) callInterface.classList.remove('d-none');
            if (callStatus) callStatus.textContent = 'Video Call Active';
            
            this.isInCall = true;
            this.startCallTimer();
            
            this.showToast('Video call started');
            
        } catch (error) {
            this.showToast('Failed to start video call', 'error');
        }
    }

    async startVoiceCall() {
        if (!this.currentRoom || this.currentRoom.participants.length < 2) {
            this.showToast('Need at least 2 participants for a call', 'error');
            return;
        }

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: false, 
                audio: true 
            });
            
            this.peerConnection = new RTCPeerConnection(this.rtcConfig);
            this.setupPeerConnection();
            
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            const callInterface = document.getElementById('callInterface');
            const localVideo = document.getElementById('localVideo');
            const remoteVideo = document.getElementById('remoteVideo');
            const callStatus = document.getElementById('callStatus');
            
            if (callInterface) callInterface.classList.remove('d-none');
            if (localVideo) localVideo.style.display = 'none';
            if (remoteVideo) remoteVideo.style.display = 'none';
            if (callStatus) callStatus.textContent = 'Voice Call Active';
            
            this.isInCall = true;
            this.startCallTimer();
            
            this.showToast('Voice call started');
            
        } catch (error) {
            this.showToast('Failed to start voice call', 'error');
        }
    }

    async startScreenShare() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: true, 
                audio: true 
            });
            
            if (this.peerConnection) {
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = this.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }

            const localVideo = document.getElementById('localVideo');
            if (localVideo) localVideo.srcObject = screenStream;
            this.showToast('Screen sharing started');
            
            screenStream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };
            
        } catch (error) {
            this.showToast('Failed to start screen sharing', 'error');
        }
    }

    stopScreenShare() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
            );
            
            if (sender && videoTrack) {
                sender.replaceTrack(videoTrack);
                const localVideo = document.getElementById('localVideo');
                if (localVideo) localVideo.srcObject = this.localStream;
            }
        }
        this.showToast('Screen sharing stopped');
    }

    setupPeerConnection() {
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            const remoteVideo = document.getElementById('remoteVideo');
            if (remoteVideo) remoteVideo.srcObject = this.remoteStream;
        };

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real app, send candidate to remote peer
                console.log('ICE candidate:', event.candidate);
            }
        };

        // Create data channel for file transfer
        this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
        this.setupDataChannel();
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
        };

        this.dataChannel.onmessage = (event) => {
            console.log('Received data:', event.data);
        };
    }

    endCall() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
            this.remoteStream = null;
        }

        const callInterface = document.getElementById('callInterface');
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        
        if (callInterface) callInterface.classList.add('d-none');
        if (localVideo) localVideo.style.display = 'block';
        if (remoteVideo) remoteVideo.style.display = 'block';
        
        this.isInCall = false;
        this.stopCallTimer();
        
        this.showToast('Call ended');
    }

    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                const btn = document.getElementById('muteBtn');
                if (btn) {
                    btn.innerHTML = audioTrack.enabled ? '<i class="bi bi-mic"></i>' : '<i class="bi bi-mic-mute"></i>';
                }
            }
        }
    }

    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                const btn = document.getElementById('cameraBtn');
                if (btn) {
                    btn.innerHTML = videoTrack.enabled ? '<i class="bi bi-camera-video"></i>' : '<i class="bi bi-camera-video-off"></i>';
                }
            }
        }
    }

    toggleScreenShare() {
        // Toggle between screen share and camera
        const localVideo = document.getElementById('localVideo');
        if (localVideo && localVideo.srcObject !== this.localStream) {
            this.stopScreenShare();
        } else {
            this.startScreenShare();
        }
    }

    startCallTimer() {
        this.callStartTime = Date.now();
        this.callTimer = setInterval(() => {
            const elapsed = Date.now() - this.callStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const durationEl = document.getElementById('callDuration');
            if (durationEl) {
                durationEl.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopCallTimer() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
    }

    // Data Management
    saveRoom(room) {
        const rooms = this.getRooms();
        rooms[room.code] = room;
        localStorage.setItem('prMessengerRooms', JSON.stringify(rooms));
    }

    getRoom(code) {
        const rooms = this.getRooms();
        return rooms[code] || null;
    }

    getRooms() {
        const rooms = localStorage.getItem('prMessengerRooms');
        return rooms ? JSON.parse(rooms) : {};
    }

    // Real-time Sync
    startSync() {
        // Clear existing interval if any
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            if (this.currentRoom) {
                const updatedRoom = this.getRoom(this.currentRoom.code);
                if (updatedRoom && JSON.stringify(updatedRoom) !== JSON.stringify(this.currentRoom)) {
                    this.currentRoom = updatedRoom;
                    this.updateMessages();
                    this.updateParticipantsList();
                }
            }
        }, 1000);
    }

    handleStorageChange(e) {
        if (e.key === 'prMessengerRooms' && this.currentRoom) {
            const rooms = JSON.parse(e.newValue || '{}');
            const updatedRoom = rooms[this.currentRoom.code];
            if (updatedRoom) {
                this.currentRoom = updatedRoom;
                this.updateMessages();
                this.updateParticipantsList();
            }
        }
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastBody = document.getElementById('toastMessage');
        
        if (!toast || !toastBody) return;
        
        toastBody.textContent = message;
        
        // Update toast icon based on type
        const header = toast.querySelector('.toast-header i');
        if (header) {
            header.className = `bi me-2 ${type === 'error' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-info-circle-fill text-primary'}`;
        }
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Initialize the application
let prMessenger;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        prMessenger = new PRMessenger();
    });
} else {
    prMessenger = new PRMessenger();
}
