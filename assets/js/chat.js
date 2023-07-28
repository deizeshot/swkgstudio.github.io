function checkPassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
  
    // Здесь вы можете проверить введенный пароль и принять решение, показывать чат или нет
    if (password === '1441') {
      document.getElementById('passwordWrapper').style.display = 'none';
      document.getElementById('chatWrapper').style.display = 'block';
    } else {
      alert('Неверный пароль');
    }
  }
  

const ws = new WebSocket('wss://intermediate-easy-ship.glitch.me');
ws.onopen = () => {
  console.log('Connected to the WebSocket server.');  
};
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'chat-history') {
    const history = data.messages;
    document.getElementById('chatMessages').innerHTML = '';
    history.forEach(message => displayMessage(message));
  } else if (data.type === 'chat-message') {
    const message = data.message;
    displayMessage(message);
  }
};
function displayMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');
      const messageTextWithTime = document.createElement('div');
      if (message.username) {
      messageTextWithTime.textContent = `@${message.username}: ${message.text} ${message.time}`;
    } else {
      messageTextWithTime.textContent = `${message.text} ${message.time}`;
    }
    messageDiv.appendChild(messageTextWithTime);
      if (message.type === 'chat') {
      messageDiv.classList.add('sent');
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
function getTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
  }
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  let messageText = messageInput.value.trim();
  if (messageText !== '') {
    if (messageText.toLowerCase() === '/regtg') {
      window.open('tg://resolve?domain=decloudpay_bot', '_blank');
    } else {
      const usernameMatch = messageText.match(/@(\w+)/);
      if (usernameMatch) {
        const username = usernameMatch[1];
        messageText = messageText.replace(/@(\w+)/, '');
        sendMessageToServer({ type: 'chat', text: messageText, username: username });
      } else {
        sendMessageToServer({ type: 'chat', text: messageText });
      }
    }
    messageInput.value = '';
  }
}
async function sendMessageToServer(message) {
  const currentTime = getTimeString();
  message.time = currentTime;

  ws.send(JSON.stringify(message));
}
document.getElementById('messageInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});
document.getElementById('sendButton').addEventListener('click', sendMessage);
function handleMessage(message) {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'chat-message') {
      const { text, time } = parsedMessage.message;
        if (text.includes("tg://")) {
        const linkText = "Нажмите здесь, чтобы начать диалог с ботом";
        const linkUrl = text.split(" ")[1];
        const link = `<a href="${linkUrl}">${linkText}</a>`;
        const messageElement = createChatMessageElement(`${time} ${link}`);
        chatMessages.appendChild(messageElement);
      } else {
        const messageElement = createChatMessageElement(`${time} ${text}`);
        chatMessages.appendChild(messageElement);
      }
    }
  }