const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
const _ = require('lodash')
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
    options.reply_markup.keyboard.push([
      {
        text: 'بازگشت به خانه'
      }
    ])
  }

  if (!visit_doctor) {
    return
  }
  let res = await Doctor.find(visit_doctor)
  let doctor = res.result.doctor
  let minute_array = doctor.specialty.id == 41 ? [5, 10, 15, 30] : [3, 5, 10]
  let price = await Doctor.get_time_price(visit_doctor)
  let costPerMinute = price.result.quote.costPerMinute
  let amount_list = calc_amount(costPerMinute, minute_array)
  message = `هزینه تماس با دکتر ${doctor.firstName} ${doctor.lastName}`
  message += `\n\nدر صورتی که مدت زمان مکالمه کمتر از این مقدار باشد پول در حساب شما میماند و میتوانید در تماس های بعدی از آن استفاده نمایید`
  message += `\n\nدر صورت عدم برقراری ارتباط میتوانید با پشتیبانی تماس گرفته و درخواست استرداد وجه نمایید `
  for (let item of amount_list) {
    options.reply_markup.keyboard.push([
      {
        text: `${item.perioud} دقیقه ${item.amount} تومان`
      }
    ])
  }
  options.reply_markup.keyboard.push([
    {
      text: 'بازگشت به خانه'
    }
  ])

  bot.sendMessage(msg.chat.id, message, options)
})
function calc_amount (costPerMinute, minutes) {
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
