var TelegramBot = require('node-telegram-bot-api')
const token = '646189637:AAFLDZMefpHpm8MQobqv468Vw0iBotLlYC8'
const User = require('./Model/User')
class Bot extends TelegramBot {
  async sendMessage(chatId, text, body = {}, whith_history = true) {
    if (whith_history) {
      let user = new User(chatId)
      await user.push_history({
        text,
        body
      })
    }
    super.sendMessage(chatId, text, body)
  }
}
var bot = new Bot(token, {
  polling: process.env.NODE_ENV ? true : false,
})
module.exports = bot