const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const _ = require('lodash');
bot.on('message', async msg => {
  if (!msg.reply_to_message) {
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    `شما امکان پاسخ دادن به جواب آزمایش را ندارید برای ارتباط با پزشک از طریق سامانه رسا اقدام نمایید`
  );
});
