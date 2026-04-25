// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- PEERJS & AUDIO LOGIC ---
const peer = new Peer(); 
let localStream;
const statusEl = document.createElement('div');
statusEl.id = "status";
statusEl.innerText = "Connecting...";
document.body.appendChild(statusEl);

const talkBtn = document.createElement('button');
talkBtn.id = "talkBtn";
talkBtn.innerText = "PUSH TO TALK";
document.body.appendChild(talkBtn);

// Get microphone access
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    localStream = stream;
    statusEl.innerText = "Ready to Vokie!";
});

peer.on('open', (id) => {
    // Save your ID to a global "lobby" in Firebase
    db.ref('lobby').push(id);
    
    // Listen for incoming calls
    peer.on('call', (call) => {
        call.answer(localStream);
        call.on('stream', (remoteStream) => {
            playStream(remoteStream);
        });
    });
});

talkBtn.onclick = () => {
    // Find someone else in the lobby to talk to
    db.ref('lobby').limitToLast(5).once('value', snapshot => {
        const users = snapshot.val();
        const ids = Object.values(users);
        const randomId = ids[Math.floor(Math.random() * ids.length)];

        if (randomId !== peer.id) {
            const call = peer.call(randomId, localStream);
            call.on('stream', (remoteStream) => {
                playStream(remoteStream);
            });
            statusEl.innerText = "Connected!";
        }
    });
};

function playStream(stream) {
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();
}