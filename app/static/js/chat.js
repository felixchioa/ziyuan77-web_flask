document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    const messages = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const imageInput = document.getElementById("imageInput");
    const sendButton = document.getElementById("sendButton");

    // 定期获取并显示历史消息
    function fetchMessages() {
        fetch("/get_messages")
            .then((response) => response.json())
            .then((data) => {
                if (data.messages) {
                    messages.innerHTML = ""; // 清空现有消息
                    data.messages.forEach((message) => {
                        const messageElement = document.createElement("div");
                        if (message.type === "text") {
                            messageElement.textContent = message.content;
                        } else if (message.type === "image") {
                            const img = document.createElement("img");
                            img.src = message.content;
                            img.style.maxWidth = "100%";
                            messageElement.appendChild(img);
                        }
                        messages.appendChild(messageElement);
                    });
                }
            })
            .catch((error) => console.error("Error fetching messages:", error));
    }

    // 每5秒获取一次消息
    setInterval(fetchMessages, 5000);

    sendButton.addEventListener("click", function () {
        const message = messageInput.value;
        // const imageFile = imageInput.files[0];

        if (message) {
            socket.emit("message", { type: "text", content: message }, function (ack) {
                if (ack?.success) {
                    alert("消息发送成功！");
                } else {
                    alert("消息发送失败！");
                }
            });
            messageInput.value = "";
        }

        // if (imageFile) {
        //     const reader = new FileReader();
        //     reader.onload = function (event) {
        //         socket.emit("message", { type: "image", content: event.target.result }, function (ack) {
        //             if (ack?.success) {
        //                 alert("图片发送成功！");
        //             } else {
        //                 alert("图片发送失败！");
        //             }
        //         });
        //     };
        //     reader.readAsDataURL(imageFile);
        //     imageInput.value = "";
        // }
    });

    socket.on("message", function (data) {
        const messageElement = document.createElement("div");
        if (data.type === "text") {
            messageElement.textContent = data.content;
        } else if (data.type === "image") {
            const img = document.createElement("img");
            img.src = data.content;
            img.style.maxWidth = "100%";
            messageElement.appendChild(img);
        }
        messages.appendChild(messageElement);
    });
});
