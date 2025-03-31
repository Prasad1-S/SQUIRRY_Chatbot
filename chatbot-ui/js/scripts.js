document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const messagesContainer = document.getElementById("messages");

    // Audio
    const sendSound = new Audio("./sound/send.mp3");

    // Backend URL
    const backendURL = "https://squirry-backend.onrender.com/send-message";

    // Function to add a message to the chatbox
    function addMessage(text, type) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", type);

        messageDiv.innerHTML = type === "sent"
            ? `<span class="message-content msgUser">${text}</span> <span class="material-symbols-outlined user-icon">account_circle</span>`
            : `<div class="received-container">
                  <img class="bot-icon img" src="./3C3D37.png">
                  <span class="message-content msgBot">${text}</span>
               </div>`;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: "smooth" });
    }

    // Function to check if backend is ready
    async function isBackendReady() {
        try {
            const response = await fetch(backendURL, { method: "OPTIONS" });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Function to wait for backend startup
    async function waitForBackend() {
        alert("⏳ Backend is starting, please wait...");
        while (!(await isBackendReady())) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
        alert("✅ Backend is ready! You can now chat.");
    }

    // Function to handle sending messages
    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === "") return;

        sendSound.volume = 0.5;
        sendSound.play();

        addMessage(userText, "sent");
        userInput.value = "";

        // Check if backend is ready before sending message
        if (!(await isBackendReady())) {
            await waitForBackend();
            return;
        }

        try {
            const response = await fetch(backendURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText }),
            });

            const data = await response.json();

            if (!data || !data.reply) {
                console.error("🚨 Error: Bot response is empty!");
                addMessage("Oops! I didn't get that. 😕", "received");
                return;
            }

            addMessage(data.reply, "received");
            sendSound.volume = 0.7;
            sendSound.play();
        } catch (error) {
            console.error("❌ Fetch Error:", error);
            addMessage("Oops! Something went wrong. 😕", "received");
        }
    }

    // Event listeners
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Check backend status on page load
    waitForBackend();
});
