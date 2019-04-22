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
  let phone = msg.contact.phone_number.replace('+98', '0')

  try {
    await user.register(phone)
    message = `ثبت نام با موفقیت انجام شد`
    await bot.sendMessage(msg.chat.id, message)
  } catch (error) {
    await bot.sendMessage(msg.chat.id, error)
  }
  let visit_doctor = await user.visit_doctor
  if (!visit_doctor) {
    options.reply_markup.keyboard.push([{
      text: 'بازگشت به خانه'
    }])
  }

  if (!visit_doctor) {
    return
  }
  DoctorProvider.sned_doctor_profile(msg.chat.id, visit_doctor)

})

function calc_amount(costPerMinute, minutes) {
  let amount_list = []
  for (let min of minutes) {
    let amount = costPerMinute * min
    if (amount < 10000) {
      amount = 10000
    } else {
      amount = Math.ceil(amount / 5000) * 5000
    }
    amount_list.push({
      perioud: min,
      amount
    })
  }
  return amount_list
}