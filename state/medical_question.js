const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
bot.onText(/سوال پزشکی دارم|بازگشت به صفحه تخصص ها/, async msg => {
  try {
    let user = new User(msg.chat.id)
    user.state = _enum.state.medical_question
    let message = `به چه تخصصی نیاز دارید؟`
    let options = {
      reply_markup: {
        keyboard: [],
        resize_keyboard: true
      }
    }
        let specialities = await Doctor.get_speciality_list();
        specialities.forEach((item, index) => {
            let text = `${item.title}`
      //   if (index > 11) {
      //     return
      //   }
      if (index % 2 === 0) {
        options.reply_markup.keyboard.push([
          {
            text
          }
        ])
      } else {
        let i = Math.ceil(index / 2) - 1

        options.reply_markup.keyboard[i].push({
          text
        })
      }
    })
    options.reply_markup.keyboard.push([
      {
        text: 'بازگشت به خانه'
      }
    ])

    bot.sendMessage(msg.chat.id, message, options)
  } catch (error) {
        console.error(error);
  }
})
