// 1. IMMEDIATE UI SETUP (To fix the "Grey/Empty" screen)
document.body.innerHTML = `
    <div style="text-align:center;">
        <h1 style="color:#ff0066; font-size:1.5rem; margin-top:20px;">FUNMATE: VOKIE TOKIE</h1>
        <div id="status" style="color:#00ffcc; margin-bottom:40px; font-family:sans-serif;">INITIALIZING...</div>
        <button id="talkBtn">PUSH TO TALK</button>
    </div>
`;

const statusEl = document.getElementById('status');
const talkBtn = document.getElementById('talkBtn');

// 2. FIREBASE CONFIGURATION
// Replace this block with your actual Firebase "Web App" config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 3. PEERJS SETUP
const peer = new Peer(); 
let localStream;

// Ask for Microphone immediately
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        localStream = stream;
        statusEl.innerText = "MIC READY - WAITING FOR PEERS";
    })
    .catch(err => {
        statusEl.innerText = "ERROR: MIC ACCESS DENIED";
        console.error(err);
    });

peer.on('open', (id) => {
    console.log('My Peer ID: ' + id);
    statusEl.innerText = "ONLINE: " + id;
    
    // Add your ID to the lobby so others can find you
    const myRef = db.ref('lobby').push(id);
    myRef.onDisconnect().remove(); // Remove ID when you close the app
});

// 4. HANDLING CALLS
peer.on('call', (call) => {
    statusEl.innerText = "INCOMING VOKIE...";
    call.answer(localStream); // Answer with your mic
    
    call.on('stream', (remoteStream) => {
        playAudio(remoteStream);
        statusEl.innerText = "CONNECTED / TALKING";
    });
});

// 5. THE "PUSH TO TALK" ACTION
talkBtn.onclick = () => {
    statusEl.innerText = "SEARCHING FOR VOKIES...";
    
    db.ref('lobby').limitToLast(10).once('value', snapshot => {
        const users = snapshot.val();
        if (!users) return;

        const ids = Object.values(users);
        // Find a random user who isn't YOU
        const filteredIds = ids.filter(remoteId => remoteId !== peer.id);
        
        if (filteredIds.length > 0) {
            const targetId = filteredIds[Math.floor(Math.random() * filteredIds.length)];
            const call = peer.call(targetId, localStream);
            
            call.on('stream', (remoteStream) => {
                playAudio(remoteStream);
                statusEl.innerText = "CONNECTED TO: " + targetId;
            });
        } else {
            statusEl.innerText = "NO ONE ELSE IS ONLINE YET";
        }
    });
};

// Function to actually play the sound
function playAudio(stream) {
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();
}