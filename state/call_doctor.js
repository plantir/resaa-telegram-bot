const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
const _ = require('lodash')
const resaa_url = 'https://resaa.net'
bot.onText(/تماس با دکتر *.*/, async msg => {
  let user = new User(msg.chat.id)
  let state = await user.state
  let message = ''
  let options = {
    reply_markup: {
      inline_keyboard: []
    }
  }
  if (state != _enum.state.doctor_detail) {
    return
  }
  let phone = await user.phone
  if (!phone) {
    message = `شما هنوز در رسا ثبت نام نکرده اید حهت ثبت نام روی دکمه ثبت نام کلیک کنید`
    options.reply_markup.keyboard = [
      [{
        text: `ثبت نام`,
        request_contact: true
      }],
      [{
        text: 'بازگشت به خانه'
      }]
    ]

    return bot.sendMessage(msg.chat.id, message, options)
  }

  let visit_doctor = await user.visit_doctor
  let res = await Doctor.find(visit_doctor)
  let doctor = res.result.doctor
  let minute_array = doctor.specialty.id == 41 ? [5, 10, 15, 30] : [3, 5, 10]
  let price = await Doctor.get_time_price(visit_doctor, phone)
  // let duration = price.result.quote.duration;
  // let costPerMinute = price.result.quote.costPerMinute
  let {
    costPerMinute,
    duration,
    isFreeFirstCall
  } = price.result.quote
  if (isFreeFirstCall) {
    return bot.sendMessage(msg.chat.id, `شما تماس اول را مهمان رسا هستید\nشما میتوانید به مدت ${duration} دقیقه با دکتر ${doctor.firstName} ${doctor.lastName} صحبت کنید\nبرای برقراری تماس ابتدا با شماره 02174471111 تماس گرفته و سپس کد ${doctor.subscriberNumber} را شماره گیری نمایید`, )

  }
  let amount_list = calc_amount(costPerMinute, minute_array)
  message = `هزینه تماس با دکتر ${doctor.firstName} ${doctor.lastName}`
  message += `\n\nدر صورتی که مدت زمان مکالمه کمتر از این مقدار باشد پول در حساب شما میماند و میتوانید در تماس های بعدی از آن استفاده نمایید`
  message += `\n\nدر صورت عدم برقراری ارتباط میتوانید با پشتیبانی تماس گرفته و درخواست استرداد وجه نمایید `
  for (let item of amount_list) {
    options.reply_markup.inline_keyboard.push([{
      text: `${item.perioud} دقیقه ${item.amount} تومان`,
      url: `${resaa_url}/charge?mobile=${phone}&chat_id=${msg.chat.id}`
    }])
  }
  await bot.sendMessage(msg.chat.id, message, options)
  bot.sendMessage(msg.chat.id, `شما میتوانید به مدت ${duration} دقیقه با دکتر ${doctor.firstName} ${doctor.lastName} صحبت کنید\nبرای برقراری تماس ابتدا با شماره 02174471111 تماس گرفته و سپس کد ${doctor.subscriberNumber} را شماره گیری نمایید`)
  // bot.sendMessage(msg.chat.id, `شما میتوانید ${duration} دقیقه صحبت کنید`, {
  //   reply_markup: {
  //     keyboard: [
  //       [{
  //         text: 'تماس با پزشک'
  //       }],
  //       [{
  //         text: 'بازگشت'
  //       }],
  //       [{
  //         text: 'بازگشت به خانه'
  //       }]
  //     ],
  //     resize_keyboard: true
  //   }
  // })
})
bot.onText(/تماس با پزشک/, async msg => {
  let user = new User(msg.chat.id)
  let doctor_id = await user.last_visit_doctor
  bot.sendMessage(msg.chat.id, `برای صحبت با پزشک ابتدا شماره `)
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