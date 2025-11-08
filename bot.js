// ======================
// 🤖 AI PRO EGX Telegram Bot (by Mostafa)
// ======================

import TelegramBot from "node-telegram-bot-api";
import express from "express";
import cron from "node-cron";
import { DateTime } from "luxon";

// ======================
// 🔐 التوكن من متغير البيئة في Render
// ======================
const TOKEN = process.env.BOT_TOKEN;

// 🧩 إنشاء البوت
const bot = new TelegramBot(TOKEN, { polling: true });

// ======================
// 🧠 الكود الأساسي للبوت
// ======================
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase() || "";

  if (text.includes("/start")) {
    bot.sendMessage(chatId, "🤖 أهلاً بيك في AI PRO EGX Bot! جاهز أساعدك 😉");
  } else if (text.includes("hello") || text.includes("hi")) {
    bot.sendMessage(chatId, "👋 Hello! AI PRO EGX Bot is online and ready!");
  } else if (text.includes("help")) {
    bot.sendMessage(
      chatId,
      "🧾 الأوامر المتاحة:\n/start - لبدء المحادثة\n/help - للمساعدة\n/status - لمعرفة حالة السوق الآن"
    );
  } else if (text.includes("/status")) {
    const status = isMarketOpenNow()
      ? "📈 السوق مفتوح الآن!"
      : "🕓 السوق مغلق حاليًا.";
    bot.sendMessage(chatId, status);
  } else {
    bot.sendMessage(chatId, `You said: ${msg.text}`);
  }
});

// ======================
// 🌐 Keep-Alive Server (for Render)
// ======================
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("🤖 AI PRO EGX Bot is running and alive!");
});

app.listen(PORT, () => {
  console.log(`✅ Server is alive on port ${PORT}`);
});

// ======================
// 📊 تشغيل التحليل في مواعيد البورصة فقط
// ======================

// ⏰ إعداد الوقت
const TZ = "Africa/Cairo"; // توقيت القاهرة
const MARKET_OPEN = { hour: 9, minute: 30 };
const MARKET_CLOSE = { hour: 14, minute: 30 };
// أيام التداول في مصر (الأحد إلى الخميس)
const MARKET_DAYS = [0, 1, 2, 3, 4]; // Sunday=0 ... Thursday=4

// 🧠 دالة التحقق من حالة السوق
function isMarketOpenNow() {
  const now = DateTime.now().setZone(TZ);
  const day = now.weekday % 7; // Sunday = 0
  const open = now.set({
    hour: MARKET_OPEN.hour,
    minute: MARKET_OPEN.minute,
    second: 0,
  });
  const close = now.set({
    hour: MARKET_CLOSE.hour,
    minute: MARKET_CLOSE.minute,
    second: 0,
  });

  return MARKET_DAYS.includes(day) && now >= open && now <= close;
}

// 🧮 تحليل الأسهم وإرسال النتائج
async function analyzeStocks() {
  console.log("📊 جاري تحليل أسهم البورصة المصرية...");

  const message =
    "📈 السوق مفتوح الآن!\nجاري تحليل الأسهم وإصدار التوصيات...";

  // 💬 إرسال الرسالة ليك على تليجرام
  await bot.sendMessage(6440120636, message);
}

// 🕒 تشغيل التحليل كل 10 دقايق أثناء مواعيد السوق فقط
cron.schedule("*/10 * * * *", async () => {
  if (isMarketOpenNow()) {
    console.log("📈 السوق مفتوح - تشغيل التحليل...");
    await analyzeStocks();
  } else {
    console.log("🕓 السوق مغلق - انتظار الجلسة القادمة...");
  }
});
