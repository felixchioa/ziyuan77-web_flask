document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    const messagesContainer = document.getElementById("messages-container");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const friendsContainer = document.getElementById("friends-container");
    const addFriendInput = document.getElementById("addFriendInput");
    const addFriendButton = document.getElementById("addFriendButton");
    const currentUser = sessionStorage.getItem('username');

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function createMessageElement(message) {
        const messageElement = document.createElement("div");
        const messageContent = document.createElement("div");
        const timeStamp = document.createElement("div");

        messageElement.className = "message";
        messageContent.className = "message-content";
        timeStamp.className = "message-time";

        if (message.sender === currentUser) {
            messageElement.classList.add("sent");
        } else {
            messageElement.classList.add("received");
        }

        messageContent.textContent = message.content;
        timeStamp.textContent = new Date(message.timestamp).toLocaleTimeString();

        messageElement.appendChild(messageContent);
        messageElement.appendChild(timeStamp);

        return messageElement;
    }

    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content) {
            return;
        }

        const messageData = {
            sender: currentUser,
            recipient: selectedUser, // 需要在选择好友时设置
            content: content,
            timestamp: new Date()
        };

        socket.emit("private_message", messageData, function(ack) {
            sendButton.disabled = false;
            if (ack && ack.success) {
                messageInput.value = "";
                const messageElement = createMessageElement(messageData);
                messagesContainer.appendChild(messageElement);
                scrollToBottom();
            } else {
                showError((ack && ack.error) || "消息发送失败，请重试");
            }
        });
    }

    socket.on('private_message', function(messageData) {
        const messageElement = createMessageElement(messageData);
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

    function selectUser(friend) {
        selectedUser = friend;
        // 更新UI以显示选中的好友
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
                fetchFriends(); // 更新好友列表
            } else if (data.error) {
                showError(data.error);
            }
        })
        .catch((error) => {
            console.error("Error adding friend:", error);
            showError("添加好友失败，请检查网络连接");
        });
    };

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

    fetchFriends();
});