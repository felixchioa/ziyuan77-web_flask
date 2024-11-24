document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    const messagesContainer = document.getElementById("messages-container");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const friendsContainer = document.getElementById("friends-container");
    const addFriendInput = document.getElementById("addFriendInput");
    const addFriendButton = document.getElementById("addFriendButton");
    let selectedUser = null;
    const currentUser = sessionStorage.getItem('username');

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

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

    function createMessageElement(message) {
        const messageElement = document.createElement("div");
        const messageContent = document.createElement("div");
        const timeStamp = document.createElement("div");

        messageElement.className = "message";
        messageContent.className = "message-content";
        timeStamp.className = "message-time";

        if (message.sender === currentUser) {
            messageElement.classList.add('message-sent');
        } else {
            messageElement.classList.add('message-received');
        }

        messageContent.textContent = message.content;
        const formattedTime = formatTime(message.timestamp);
        if (formattedTime) {
            timeStamp.textContent = formattedTime;
        }

        messageElement.appendChild(messageContent);
        messageElement.appendChild(timeStamp);
        return messageElement;
    }

    function showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = message;
        messagesContainer.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || !selectedUser) return;

        sendButton.disabled = true;

        const messageData = {
            type: "text",
            content: message,
            timestamp: new Date(),
            sender: currentUser,
            recipient: selectedUser
        };

        socket.emit("private_message", messageData, function(ack) {
            sendButton.disabled = false;
            if (ack?.success) {
                messageInput.value = "";
                const messageElement = createMessageElement(messageData);
                messagesContainer.appendChild(messageElement);
                scrollToBottom();
            } else {
                showError(ack.error || "消息发送失败，请重试");
            }
        });
    }

    socket.on('private_message', function(data) {
        const messageElement = createMessageElement(data);
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    });

    function fetchFriends() {
        fetch("/get_friends")
            .then((response) => response.json())
            .then((data) => {
                if (data.friends) {
                    friendsContainer.innerHTML = "";
                    data.friends.forEach((friend) => {
                        const friendElement = document.createElement('div');
                        friendElement.className = 'friend-item';
                        friendElement.textContent = friend;
                        friendElement.onclick = () => selectUser(friend);
                        friendsContainer.appendChild(friendElement);
                    });
                }
            })
            .catch((error) => {
                console.error("Error fetching friends:", error);
                showError("获取好友列表失败，请检查网络连接");
            });
    }

    function selectUser(username) {
        selectedUser = username;
        messageInput.placeholder = `发送给 ${username}...`;
    }

    addFriendButton.onclick = function() {
        const friendUsername = addFriendInput.value.trim();
        if (!friendUsername) {
            showError("请输入好友用户名");
            return;
        }

        fetch("/add_friend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ friend_username: friendUsername })
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                showError(data.message);
                fetchFriends();
            } else if (data.error) {
                showError(data.error);
            }
        })
        .catch((error) => {
            console.error("Error adding friend:", error);
            showError("添加好友失败，请检查网络连接");
        });
    };

    function initialize() {
        fetchFriends();

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

        socket.on('connect_error', function(error) {
            showError("连接服务器失败，请检查网络连接");
        });

        socket.on('reconnect', function() {
            showError("已重新连接到服务器");
        });
    }

    initialize();
});