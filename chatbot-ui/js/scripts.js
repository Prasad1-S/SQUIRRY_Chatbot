document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const messagesContainer = document.getElementById("messages");

    // Audio
    const sendSound = new Audio("./sound/send.mp3");

    // Function to add a message to the chatbox
    function addMessage(text, type, isTemporary = false, isTyping = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", type);
    
        if (isTyping) {
            // Ensure proper structure: Bot Image + Typing Dots inside a flex container
            messageDiv.innerHTML = `
                <div class="typing-container">
                    <img class="bot-icon img" src="./3C3D37.png">
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
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
    
    

    // Function to handle sending messages
    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === "") return;
    
        // Play send sound
        sendSound.volume = 0.5;
        sendSound.play();
    
        // Add user message
        addMessage(userText, "sent");
        userInput.value = "";
    
        // Show typing animation
        const typingMessage = addMessage("", "received", true, true);
    
        try {
            // Send message to backend (Dialogflow API)
            const response = await fetch("https://squirry-backend.onrender.com/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText }),
            });
    
            const data = await response.json();
            console.log("🔍 Full Dialogflow Response:", data); // Log entire response
    
            // Remove typing animation
            typingMessage.remove();
    
            if (!data || (!data.reply && (!data.richContent || data.richContent.length === 0))) {


                console.error("🚨 Error: Bot response is empty or undefined!");
                addMessage("Oops! I didn't get that. 😕", "received");
                return;
            }
    
            // Display bot response
            addMessage(data.reply, "received");
    
            sendSound.volume = 0.7;
            sendSound.play();
        } catch (error) {
            console.error("❌ Fetch Error:", error);
            typingMessage.remove();
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
});
