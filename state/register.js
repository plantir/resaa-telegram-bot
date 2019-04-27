const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
const _ = require('lodash')
const DoctorProvider = require('../provider/DoctorProvider')
bot.on('video', msg => {
  console.log(msg)
})
bot.on('message', async msg => {
  if (!msg.contact) {
    return
  }
  let user = new User(msg.chat.id)
  let state = await user.state
  let message = ''
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  }
  let phone = msg.contact.phone_number.replace(/(\+98|98)/, '0')

  try {
    await user.register(phone)
    message = `ثبت نام با موفقیت انجام شد`
    await bot.sendMessage(msg.chat.id, message)
  } catch (error) {
    await bot.sendMessage(msg.chat.id, error)
  }
  let doctor = await user.last_visit_doctor
  if (!doctor) {
    options.reply_markup.keyboard.push([{
      text: 'بازگشت به خانه'
    }])
    return bot.sendMessage(msg.chat.id, 'لطفا انتخاب کنید', options)
  }
  DoctorProvider.sned_doctor_profile(msg.chat.id, doctor.subscriberNumber)

})