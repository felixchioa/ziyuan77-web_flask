document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    const messages = document.getElementById("messages");
    const messagesContainer = document.getElementById("messages-container");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");

    // 滚动到底部的函数
    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    // 格式化时间的函数
    function formatTime(timestamp) {
        try {
            if (typeof timestamp === 'string') {
                timestamp = JSON.parse(timestamp);
            }

            const date = new Date(timestamp);

            if (isNaN(date.getTime())) {
                return '';
            }

            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    }

    // 创建消息元素的函数
    function createMessageElement(message) {
        const messageElement = document.createElement("div");
        const messageContent = document.createElement("div");
        const timeStamp = document.createElement("div");

        messageElement.className = "message";
        messageContent.className = "message-content";
        timeStamp.className = "message-time";

        if (message.type === "text") {
            messageContent.textContent = message.content;
        } else if (message.type === "image") {
            const img = document.createElement("img");
            img.src = message.content;
            img.style.maxWidth = "100%";
            messageContent.appendChild(img);
        }

        const formattedTime = formatTime(message.timestamp);
        if (formattedTime) {
            timeStamp.textContent = formattedTime;
        }

        messageElement.appendChild(messageContent);
        messageElement.appendChild(timeStamp);
        return messageElement;
    }

    // 显示错误消息
    function showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = message;
        messagesContainer.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // 发送消息的处理
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            sendButton.disabled = true;

            socket.emit("message", {
                type: "text",
                content: message,
                timestamp: new Date()
            }, function (ack) {
                sendButton.disabled = false;

                if (ack?.success) {
                    messageInput.value = "";
                    scrollToBottom();
                } else {
                    showError("消息发送失败，请重试");
                }
            });
        }
    }

    // 定期获取并显示历史消息
    function fetchMessages() {
        fetch("/get_messages")
            .then((response) => response.json())
            .then((data) => {
                if (data.messages) {
                    const wasAtBottom =
                        messages.scrollHeight - messages.scrollTop === messages.clientHeight;
                    messagesContainer.innerHTML = "";

                    data.messages.forEach((message) => {
                        const messageElement = createMessageElement(message);
                        messagesContainer.appendChild(messageElement);
                    });

                    if (wasAtBottom) {
                        scrollToBottom();
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching messages:", error);
                showError("获取消息失败，请检查网络连接");
            });
    }

    // 初始化
    function initialize() {
        fetchMessages();
        setInterval(fetchMessages, 30000);

        sendButton.addEventListener("click", sendMessage);

        messageInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });

        messageInput.addEventListener("focus", function() {
            setTimeout(scrollToBottom, 100);
        });

        socket.on("message", function (data) {
            const messageElement = createMessageElement(data);
            messagesContainer.appendChild(messageElement);
            scrollToBottom();
        });

        socket.on('connect_error', function(error) {
            showError("连接服务器失败，请检查网络连接");
        });

        socket.on('reconnect', function() {
            showError("已重新连接到服务器");
            fetchMessages();
        });
    }

    initialize();
});