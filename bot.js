// ======================
// 🤖 AI PRO EGX Telegram Bot
// ======================

import TelegramBot from "node-telegram-bot-api";
import express from "express";

// 🔐 التوكن من متغير البيئة في Render
const TOKEN = process.env.BOT_TOKEN;

// 🧩 إنشاء البوت
const bot = new TelegramBot(TOKEN, { polling: true });

// ===============
// 🧠 الكود الأساسي للبوت
// ===============
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase() || "";

  if (text.includes("/start")) {
    bot.sendMessage(chatId, "🤖 أهلاً بيك في AI PRO EGX Bot! جاهز أساعدك 😉");
  } else if (text.includes("hello") || text.includes("hi")) {
    bot.sendMessage(chatId, "👋 Hello! AI PRO EGX Bot is online and ready!");
  } else if (text.includes("help")) {
    bot.sendMessage(chatId, "🧾 اكتب أي حاجة وأنا هرد عليك!");
  } else {
    bot.sendMessage(chatId, `You said: ${msg.text}`);
  }
});

// ===============
// 🌐 Keep-Alive Server (for Render)
// ===============
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("🤖 AI PRO EGX Bot is running and alive!");
});

app.listen(PORT, () => {
  console.log(`✅ Server is alive on port ${PORT}`);
});
