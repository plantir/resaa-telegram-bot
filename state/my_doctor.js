const bot = require('../bot')
const User = require('../Model/User')
bot.onText(/پرسش از پزشک خودم/, async msg => {
  let user = new User(msg.chat.id)
  let doctor = await user.last_visit_doctor
  let message = `نام یا کد رسا پزشک خود را وارد کنید`
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  }
  if (doctor) {
    let text = `${doctor.subscriberNumber} ${doctor.firstName} ${
      doctor.lastName
    }`
    options.reply_markup.keyboard.push([
      {
        text
      }
    ])
  }
  options.reply_markup.keyboard.push([
    {
      text: 'جستجو بر اساس کد پزشک'
    }
  ])
  options.reply_markup.keyboard.push([
    {
      text: 'جستجو بر اساس نام پزشک'
    }
  ])
  options.reply_markup.keyboard.push([
    {
      text: 'بازگشت به خانه'
    }
  ])

  bot.sendMessage(msg.chat.id, message, options)
})
