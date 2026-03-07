import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("Falta TELEGRAM_BOT_TOKEN en .env.local");
}

export const bot = new TelegramBot(token);
