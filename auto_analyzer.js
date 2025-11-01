import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import * as cheerio from "cheerio";

const bot = new TelegramBot(process.env.TELE_TOKEN, { polling: true });

// رقم الشات بتاعك
const CHAT_ID = 6440120636;

// رموز الأسهم المصرية (EGX)
const symbols = [
  "COMI", "CIB", "HRHO", "FWRY", "EFIH", "ETEL", "ORWE", "SWDY", "ABUK", "AMOC"
];

// دالة لجلب السعر الحالي من موقع EGX مباشرة
async function fetchEGXPrice(symbol) {
  try {
    const url = `https://www.egx.com.eg/ar/Company/Details.aspx?CODE=${symbol}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // نجيب آخر سعر
    const priceText = $("#ContentPlaceHolder1_lblLastTradePrice").text().trim();
    if (!priceText) throw new Error("No price found");

    return parseFloat(priceText);
  } catch (err) {
    console.log(`⚠️ فشل في جلب ${symbol}: ${err.message}`);
    return null;
  }
}

// تحليل بسيط حسب التغير اللحظي في السعر
async function analyzeStock(symbol) {
  const price = await fetchEGXPrice(symbol);
  if (!price) return `⚠️ لم يتمكن البوت من تحليل ${symbol}`;

  let signal = "⚪ محايد";
  let risk = "متوسط";

  // إشارات بسيطة بناءً على السعر
  if (price < 10) signal = "🟢 شراء قوي";
  else if (price > 50) signal = "🔴 بيع محتمل";

  if (price < 5) risk = "منخفض";
  else if (price > 70) risk = "مرتفع";

  return `📊 **${symbol}.CA**
💰 السعر الحالي: ${price.toFixed(2)} جنيه
📈 الإشارة: ${signal}
⚠️ نسبة الخطورة: ${risk}`;
}

// تشغيل التحليل كل دقيقتين
async function startAnalysis() {
  bot.sendMessage(CHAT_ID, "🚀 بدء التحليل اللحظي المباشر لأسهم EGX...");

  setInterval(async () => {
    for (const symbol of symbols) {
      const message = await analyzeStock(symbol);
      await bot.sendMessage(CHAT_ID, message);
      await new Promise(r => setTimeout(r, 2000)); // فاصل بين الرسائل
    }
    console.log("✅ انتهى التحليل لهذه الدورة.");
  }, 2 * 60 * 1000);
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 AI PRO Bot شغال بتحليل مباشر من EGX 🏦");
  startAnalysis();
});

console.log("✅ EGX Live Analyzer Bot is running...");
