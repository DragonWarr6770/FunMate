// REPLACE THESE with your keys from Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const statusEl = document.getElementById('status');
const talkBtn = document.getElementById('talkBtn');

const peer = new Peer(); 
let localStream;

// Get Microphone
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    localStream = stream;
    statusEl.innerText = "MIC READY";
}).catch(() => {
    statusEl.innerText = "ERROR: MIC BLOCKED";
});

peer.on('open', (id) => {
    statusEl.innerText = "ONLINE: " + id;
    const myRef = db.ref('lobby').push(id);
    myRef.onDisconnect().remove();
});

// Receiving a call
peer.on('call', (call) => {
    statusEl.innerText = "INCOMING VOKIE...";
    call.answer(localStream);
    call.on('stream', (remoteStream) => {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play();
        statusEl.innerText = "CONNECTED";
    });
});

// Making a call
talkBtn.onclick = () => {
    statusEl.innerText = "SEARCHING...";
    db.ref('lobby').limitToLast(5).once('value', snapshot => {
        const users = snapshot.val();
        if (!users) return;
        const ids = Object.values(users).filter(uid => uid !== peer.id);
        if (ids.length > 0) {
            const targetId = ids[Math.floor(Math.random() * ids.length)];
            const call = peer.call(targetId, localStream);
            call.on('stream', (remoteStream) => {
                const audio = new Audio();
                audio.srcObject = remoteStream;
                audio.play();
                statusEl.innerText = "TALKING TO: " + targetId;
            });
        } else {
            statusEl.innerText = "NO ONE ONLINE";
        }
    });
};
