var TelegramBot = require('node-telegram-bot-api')
const token = '465416748:AAFUNdi2vaC-TyUksGoWg-LdRahQphGXo-4'
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
  polling: true
})
module.exports = bot
