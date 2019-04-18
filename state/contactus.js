const bot = require('../bot')

bot.onText(/تماس با پشتیبانی|تماس با پشتیبانی برای اضافه شدن پزشک/, msg => {
  bot.sendMessage(msg.chat.id, '02174471300')
})
