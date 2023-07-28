const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const maxMessages = 15;
const messages = [];

const moment = require('moment-timezone');

let serverActivityTimer;

function getTimeString() {
  const now = moment().tz('Europe/Moscow');
  return `(${now.format('HH:mm')})`;
}

const botToken = process.env.BOTID;
const bot = new TelegramBot(botToken, { polling: true });

const targetChatId = process.env.METG;

function loadChatHistory() {
  try {
    const chatHistoryData = fs.readFileSync('chatHistory.json', 'utf8');
    const parsedChatHistory = JSON.parse(chatHistoryData);
    messages.push(...parsedChatHistory);
    console.log("Chat history loaded from chatHistory.json");
  } catch (err) {
    console.error("Error loading chat history:", err.message);
  }
}

function isChatIdRegistered(chatId) {
  let registeredChatIds = loadRegisteredChatIds();
  return registeredChatIds.includes(chatId);
}

function saveChatHistory() {
  try {
    fs.writeFileSync('chatHistory.json', JSON.stringify(messages), 'utf8');
    console.log("Chat history saved to chatHistory.json");
  } catch (err) {
    console.error("Error saving chat history:", err.message);
  }
}

function removeChatId(chatIdToRemove) {
  let registeredChatIds = loadRegisteredChatIds();
  if (registeredChatIds.includes(chatIdToRemove)) {
    registeredChatIds = registeredChatIds.filter(id => id !== chatIdToRemove);
    saveRegisteredChatIds(registeredChatIds);
    return true;
  }
  return false;
}

function getRegisteredChatIds() {
  try {
    const chatIdsData = fs.readFileSync('chatIds.json', 'utf8');
    const chatIds = JSON.parse(chatIdsData);
    return chatIds;
  } catch (err) {
    console.error("Error reading chatIds.json:", err.message);
    return [];
  }
}

function loadRegisteredChatIds() {
  try {
    const chatIdsData = fs.readFileSync('chatIds.json', 'utf8');
    return JSON.parse(chatIdsData);
  } catch (err) {
    console.error("Error loading registered chatIds:", err.message);
    return [];
  }
}

// Функция для сохранения зарегистрированных chatId в файл
function saveRegisteredChatIds(chatIds) {
  try {
    fs.writeFileSync('chatIds.json', JSON.stringify(chatIds), 'utf8');
    console.log("Registered chatIds saved to chatIds.json");
  } catch (err) {
    console.error("Error saving registered chatIds:", err.message);
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  loadChatHistory();
  
  ws.send(JSON.stringify({ type: 'chat-history', messages: messages.slice(-maxMessages) }));
  
  const registeredChatIds = loadRegisteredChatIds();

  ws.on("message", (message) => {
  console.log(`Received message: ${message}`);
    
     clearTimeout(serverActivityTimer);
    
    // Устанавливаем новый таймер на 10 минут
    serverActivityTimer = setTimeout(() => {
      console.log("Server activity timeout, closing connection.");
      ws.terminate(); // Закрываем соединение при истечении времени неактивности
    }, 600000); // 10 минут в миллисекундах

  const parsedMessage = JSON.parse(message);
  const currentTime = getTimeString();

    
  const newMessage = {
    type: 'chat',
    text: parsedMessage.text,
    time: currentTime,
    chatId: parsedMessage.chatId 
  };

  messages.push(newMessage);

  if (messages.length > maxMessages) {
    messages.splice(0, messages.length - maxMessages);
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'chat-message', message: newMessage }));
    }
  });
    
    // Обработка команды /clear
    if (newMessage.text && newMessage.text.toLowerCase().startsWith('/clear')) {
      // Извлекаем chatId из команды
      const commandParts = newMessage.text.substring('/clear '.length).trim().split(' ');
      const chatIdToRemove = commandParts[0];

      if (chatIdToRemove) {
        if (removeChatId(chatIdToRemove)) {
          const successMessage = `ChatId ${chatIdToRemove} успешно удален!`;
          const currentTime = getTimeString();
          const botMessage = {
            type: 'chat',
            text: successMessage,
            time: currentTime,
            chatId: newMessage.chatId 
          };

          messages.push(botMessage);

          if (messages.length > maxMessages) {
            messages.splice(0, messages.length - maxMessages);
          }

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
            }
          });
        } else {
          const errorMessage = `ChatId ${chatIdToRemove} не найден.`;
          const currentTime = getTimeString();
          const botMessage = {
            type: 'chat',
            text: errorMessage,
            time: currentTime,
            chatId: newMessage.chatId 
          };

          messages.push(botMessage);

          if (messages.length > maxMessages) {
            messages.splice(0, messages.length - maxMessages);
          }

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
            }
          });
        }
      } else {
        const errorMessage = "Пожалуйста, укажите ChatId для удаления.";
        const currentTime = getTimeString();
        const botMessage = {
          type: 'chat',
          text: errorMessage,
          time: currentTime,
          chatId: newMessage.chatId 
        };

        messages.push(botMessage);

        if (messages.length > maxMessages) {
          messages.splice(0, messages.length - maxMessages);
        }

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
          }
        });
      }
    }
    
        // Обработка команды /id
    if (newMessage.text && newMessage.text.toLowerCase().startsWith('/id')) {
      if (registeredChatIds.length > 0) {
        const idsMessage = `Зарегистрированные chatId:\n${registeredChatIds.join('\n')}`;
        const currentTime = getTimeString();
        const botMessage = {
          type: 'chat',
          text: idsMessage,
          time: currentTime,
          chatId: newMessage.chatId 
        };

        messages.push(botMessage);

        if (messages.length > maxMessages) {
          messages.splice(0, messages.length - maxMessages);
        }

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
          }
        });
      } else {
        const errorMessage = "Нет зарегистрированных chatId.";
        const currentTime = getTimeString();
        const botMessage = {
          type: 'chat',
          text: errorMessage,
          time: currentTime,
          chatId: newMessage.chatId 
        };

        messages.push(botMessage);

        if (messages.length > maxMessages) {
          messages.splice(0, messages.length - maxMessages);
        }

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
          }
        });
      }
    }
    
        // Обработка команды /bot
    if (newMessage.text && newMessage.text.toLowerCase().startsWith('/bot ')) {
      const commandParts = newMessage.text.substring('/bot '.length).trim().split(' ');
      const chatIdToSend = commandParts[0];
      const messageToSend = commandParts.slice(1).join(' ');

      if (chatIdToSend && messageToSend) {
        bot.sendMessage(chatIdToSend, messageToSend)
          .then(() => {
            console.log(`Sent message "${messageToSend}" to chat ${chatIdToSend}`);
            const successMessage = `Сообщение отправлено на ${chatIdToSend}`;
            const currentTime = getTimeString();
            const botMessage = {
              type: 'chat',
              text: successMessage,
              time: currentTime,
              chatId: newMessage.chatId 
            };

            messages.push(botMessage);

            if (messages.length > maxMessages) {
              messages.splice(0, messages.length - maxMessages);
            }

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
              }
            });
          })
          .catch(error => {
            console.error("Error:", error.message);
            const errorMessage = `@decloudpay_bot добавь меня в ТГ и жми "НАЧАТЬ"`;
            const currentTime = getTimeString();
            const botMessage = {
              type: 'chat',
              text: errorMessage,
              time: currentTime,
              chatId: newMessage.chatId 
            };

            messages.push(botMessage);

            if (messages.length > maxMessages) {
              messages.splice(0, messages.length - maxMessages);
            }

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
              }
            });
          });
      } else {
        bot.sendMessage(newMessage.chatId, "Пожалуйста, укажите chat_id и текст сообщения для отправки.");
      }
    }

    // Обработка команды /regtg
if (newMessage.text && newMessage.text.toLowerCase().startsWith('/regtg')) {
  // Формируем ссылку с протоколом tg:// для открытия чата с ботом
  const botUsername = "decloudpay_bot";
  const tgLink = `tg://resolve?domain=${botUsername}`;

  // Отправляем ссылку пользователю
  bot.sendMessage(newMessage.chatId, `Нажмите на ссылку, чтобы начать диалог с ботом: ${tgLink}`);
}
    
  // Обработка команды /reg
    if (newMessage.text && newMessage.text.toLowerCase().startsWith('/reg')) {
      // Извлекаем chatId из команды
      const commandParts = newMessage.text.substring('/reg '.length).trim().split(' ');
      const chatIdToRegister = commandParts[0];

      if (chatIdToRegister) {
        // Если chatId уже зарегистрирован
        if (isChatIdRegistered(chatIdToRegister)) {
          const errorMessage = `Такой ID уже зарегистрирован. @decloudpay_bot добавь меня в ТГ и жми "НАЧАТЬ"`;
          const currentTime = getTimeString();
          const botMessage = {
            type: 'chat',
            text: errorMessage,
            time: currentTime,
            chatId: newMessage.chatId 
          };

          messages.push(botMessage);

          if (messages.length > maxMessages) {
            messages.splice(0, messages.length - maxMessages);
          }

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
            }
          });
        } else {
          // Регистрируем новый chatId
          let registeredChatIds = loadRegisteredChatIds();
          registeredChatIds.push(chatIdToRegister);
          saveRegisteredChatIds(registeredChatIds);

          const successMessage = `ChatId ${chatIdToRegister} успешно зарегистрирован! @decloudpay_bot добавь меня в ТГ и жми "НАЧАТЬ"`;
          const currentTime = getTimeString();
          const botMessage = {
            type: 'chat',
            text: successMessage,
            time: currentTime,
            chatId: newMessage.chatId 
          };

          messages.push(botMessage);

          if (messages.length > maxMessages) {
            messages.splice(0, messages.length - maxMessages);
          }

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
            }
          });
        }
      } else {
        const errorMessage = "Пожалуйста, укажите ChatId для регистрации.";
        const currentTime = getTimeString();
        const botMessage = {
          type: 'chat',
          text: errorMessage,
          time: currentTime,
          chatId: newMessage.chatId 
        };

        messages.push(botMessage);

        if (messages.length > maxMessages) {
          messages.splice(0, messages.length - maxMessages);
        }

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'chat-message', message: botMessage }));
          }
        });
      }
    }
});

  ws.on("close", () => {
    console.log("Client disconnected");
    saveChatHistory(); // Сохраняем историю чата при закрытии соединения
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.get("/check-request", (req, res) => {
  const origin = req.get("origin");
  console.log("Request from:", origin);

  if (origin === "https://deizeshot.github.io") {
    res.json({ message: "Request from your website is received." });
  } else {
    res.status(403).json({ error: "Access denied." });
  }
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});