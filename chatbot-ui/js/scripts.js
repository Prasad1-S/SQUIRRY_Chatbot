document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const messagesContainer = document.getElementById("messages");

    // Audio
    const sendSound = new Audio("./sound/send.mp3");

    function addMessage(text, type, isTemporary = false, isTyping = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", type);
    
        if (isTyping) {
            messageDiv.innerHTML = `
                <div class="typing-container">
                    <img class="bot-icon img" src="./3C3D37.png">
                    <div class="typing-dots"><span></span><span></span><span></span></div>
                </div>`;
        } else {
            messageDiv.innerHTML = type === "sent"
                ? `<span class="message-content msgUser">${text}</span> <span class="material-symbols-outlined user-icon">account_circle</span>`
                : `<div class="received-container">
                      <img class="bot-icon img" src="./3C3D37.png">
                      <span class="message-content msgBot">${text}</span>
                   </div>`;
        }
    
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: "smooth" });
    
        return isTemporary ? messageDiv : null;
    }

    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === "") return;
    
        sendSound.volume = 0.5;
        sendSound.play();
    
        addMessage(userText, "sent");
        userInput.value = "";
    
        // Show waiting message before backend starts
        const waitingMessage = addMessage("The server is starting, please wait 30-50 seconds... ⏳", "received", true);
        
        // Show typing animation
        const typingMessage = addMessage("", "received", true, true);
    
        try {
            const response = await fetch("https://squirry-backend.onrender.com/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText }),
            });
    
            const data = await response.json();
            console.log("🔍 Full Dialogflow Response:", data);
    
            waitingMessage.remove(); // Remove waiting message when backend responds
            typingMessage.remove();
    
            if (!data || (!data.reply && (!data.richContent || data.richContent.length === 0))) {
                console.error("🚨 Error: Bot response is empty or undefined!");
                addMessage("Oops! I didn't get that. 😕", "received");
                return;
            }
    
            addMessage(data.reply, "received");
    
            sendSound.volume = 0.7;
            sendSound.play();
        } catch (error) {
            console.error("❌ Fetch Error:", error);
            waitingMessage.remove();
            typingMessage.remove();
            addMessage("Oops! Something went wrong. 😕", "received");
        }
    }
    
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});
