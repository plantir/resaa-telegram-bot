const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
const _ = require('lodash')
bot.onText(/تماس با دکتر *.*/, async msg => {
  let user = new User(msg.chat.id)
  let state = await user.state
  let message = ''
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  }
  if (state != _enum.state.doctor_detail) {
    return
  }
  let phone = await user.phone
  if (!phone) {
    message = `شما هنوز در رسا ثبت نام نکرده اید حهت ثبت نام روی دکمه ثبت نام کلیک کنید`
    options.reply_markup.keyboard.push([
      {
        text: `ثبت نام`,
        request_contact: true
      }
    ])
    options.reply_markup.keyboard.push([
      {
        text: 'بازگشت به خانه'
      }
    ])

    return bot.sendMessage(msg.chat.id, message, options)
  }

  let visit_doctor = await user.visit_doctor
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
