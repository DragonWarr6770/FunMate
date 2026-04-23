// PTT Logic: Only send audio when the button is pressed
function handlePTT() {
    let centerX = (width + 240) / 2;
    let centerY = height / 2;

    if (state === "CONNECTED" && mouseIsPressed && dist(mouseX, mouseY, centerX, centerY) < 110) {
        if (currentStream) {
            currentStream.getAudioTracks()[0].enabled = true;
            fill("#00FFAB"); // Neon Green when talking
        }
    } else {
        if (currentStream) {
            currentStream.getAudioTracks()[0].enabled = false;
            fill("#008F5D"); // Dark Green when listening
        }
    }
}