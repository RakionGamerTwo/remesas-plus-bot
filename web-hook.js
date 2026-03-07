import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);
const webhookUrl = process.env.WEB_HOOK_URL;
bot.setWebHook(webhookUrl)
  .then(() => console.log('✅ Webhook configurado en:', webhookUrl))
  .catch(console.error);

bot.getWebHookInfo()
  .then(info => console.log('Info del webhook:', info))
  .catch(console.error);