var TelegramBot = require('node-telegram-bot-api');
const token =
  process.env.NODE_ENV === 'development'
    ? '465416748:AAFUNdi2vaC-TyUksGoWg-LdRahQphGXo-4'
    : '646189637:AAFLDZMefpHpm8MQobqv468Vw0iBotLlYC8';
const User = require('./Model/User');
class Bot extends TelegramBot {
  async sendMessage(chatId, text, body = {}, whith_history = true) {
    if (whith_history) {
      let user = new User(chatId);
      await user.push_history({
        text,
        body
      });
    }
    return super.sendMessage(chatId, text, body);
  }
  async sendPhoto(chatId, doctor_image_id, body = {}, whith_history = true) {
    if (whith_history) {
      let user = new User(chatId);
      await user.push_history({
        text: doctor_image_id,
        body
      });
    }
    return super.sendPhoto(chatId, doctor_image_id, body);
  }
}
var bot = new Bot(token, {
  polling: process.env.MODE == 'polling' ? true : false
});
module.exports = bot;
