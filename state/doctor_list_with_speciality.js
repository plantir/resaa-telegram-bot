const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
bot.onText(/\d+/, async msg => {
  let user = new User(msg.chat.id)
  let state = await user.state
  if (state != _enum.state.medical_question) {
    return
  }
  user.state = _enum.state.select_doctor
  let specialtyId = +msg.text.replace(/[^\d+]/g, '')
  let doctors = await Doctor.get_doctors({
    specialtyId
  })
  let message = `لیست پزشکان متخصص${msg.text.replace(/\d/g, '')}`
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  }
  doctors.result.doctors.forEach((doctor, index) => {
    let text = `${doctor.subscriberNumber} ${doctor.firstName} ${
      doctor.lastName
    }`
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
      text: 'بازگشت'
    }
  ])
  options.reply_markup.keyboard.push([
    {
      text: 'بازگشت به خانه'
    }
  ])
  bot.sendMessage(msg.chat.id, message, options)
})
