const chatLog = document.getElementById("chat-log");
const message = document.getElementById("message");
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageText = message.value;
  message.value = "";
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.classList.add("message--sent");
  messageElement.innerHTML = `<div class = message__text'>${messageText}</div>`;
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
  fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      Content_type: "application/json",
    },
    body: JSON.stringify({
      message: messageText,
    }),
  })
    .then((res = res.json()))
    .then((data) => {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.classList.add("message--received");
      messageElement.innerHTML = `<div class = message__text'>${data.completeion.content}</div>`;
      chatLog.appendChild(messageElement);
      chatLog.scrollTop = chatLog.scrollHeight;
    });
});
