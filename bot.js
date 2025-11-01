import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { RSI, MACD, EMA, BollingerBands } from "technicalindicators";

const TOKEN = process.env.TELE_TOKEN; // التوكن بتاع بوت تليجرام
const API_KEY = process.env.TWELVE_KEY; // مفتاح Twelve Data
const bot = new TelegramBot(TOKEN, { polling: true });

// دالة لجلب البيانات
async function fetchData(symbol) {
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=5min&outputsize=200&apikey=${API_KEY}`;
  const res = await axios.get(url);
  return res.data.values.reverse().map(v => parseFloat(v.close));
}

// دالة تحليل المؤشرات
function analyze(closes) {
  const rsi = RSI.calculate({ period: 14, values: closes });
  const ema12 = EMA.calculate({ period: 12, values: closes });
  const ema26 = EMA.calculate({ period: 26, values: closes });
  const macd = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 });
  const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });

  const lastClose = closes.at(-1);
  const lastRsi = rsi.at(-1);
  const lastMacd = macd.at(-1);
  const lastEma12 = ema12.at(-1);
  const lastBb = bb.at(-1);
  const bbWidth = (lastBb.upper - lastBb.lower) / lastClose;

  let signal = "HOLD";
  if (lastRsi < 35 && lastMacd.histogram > 0 && lastClose > lastEma12) signal = "BUY";
  else if (lastRsi > 65 && lastMacd.histogram < 0 && lastClose < lastEma12) signal = "SELL";

  let risk = "Low";
  if (bbWidth > 0.03 || lastRsi < 30 || lastRsi > 70) risk = "High";
  else if (bbWidth > 0.015) risk = "Medium";

  return { signal, lastClose, lastRsi, risk, bbWidth };
// ===== Temporary command to get chat ID =====
bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `📌 Your Chat ID is: ${chatId}`);
  console.log(`User Chat ID: ${chatId}`);
});

}

// أوامر تليجرام
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 أهلاً بيك في AI PRO Bot!\nاكتب /signal CIB.CA علشان تشوف تحليل سهم.");
});

bot.onText(/\/signal (.+)/, async (msg, match) => {
  const symbol = match[1].trim();
  try {
    const closes = await fetchData(symbol);
    const result = analyze(closes);
    const message = `📊 ${symbol}\n💰 السعر: ${result.lastClose}\n🧭 الإشارة: ${result.signal}\n⚠️ المخاطرة: ${result.risk}\n📈 RSI: ${result.lastRsi.toFixed(2)}\nBB Width: ${(result.bbWidth*100).toFixed(2)}%`;
    bot.sendMessage(msg.chat.id, message);
  } catch (e) {
    bot.sendMessage(msg.chat.id, "❌ حصل خطأ أثناء التحليل: " + e.message);
  }
});

console.log("🤖 AI PRO Bot is running...");
