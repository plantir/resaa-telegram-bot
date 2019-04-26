const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const resaa_url = 'https://resaa.net'
bot.onText(/شارژ اعتبار رسا/, async msg => {
  let message = 'جهت شارژ اعتبار خود یکی از مبالغ زیر را انتخاب نمایید'
  let options = {
    reply_markup: {
      // keyboard: [],
      inline_keyboard: [],
    }
  }
  let user = new User(msg.chat.id)
  let phone = await user.phone
  let amounts = [10000, 20000, 30000, 40000, 50000]
  for (let key in amounts) {
    options.reply_markup.inline_keyboard.push([{
      text: `${amounts[key]} تومان`,
      url: `${resaa_url}/charge?chargeId=${+key+1}&mobile=${phone}&chat_id=${msg.chat.id}`
    }])
  }

  // options.reply_markup.keyboard.push([{
  //   text: 'بازگشت به خانه'
  // }])

  bot.sendMessage(msg.chat.id, message, options)
})
bot.onText(/[0-9]+ تومان/, async msg => {
  let message = ''
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  }
  let charge_amount
  let user = new User(msg.chat.id)
  let phone = await user.phone
  if (!phone) {
    message = `شما هنوز در رسا ثبت نام نکرده اید حهت ثبت نام روی دکمه ثبت نام کلیک کنید`
    options.reply_markup.keyboard.push([{
      text: `ثبت نام`,
      request_contact: true
    }])
    return bot.sendMessage(msg.chat.id, message, options)
  }
  try {
    charge_amount = new RegExp(/([0-9]+) تومان/, 'g').exec(msg.text)[1]
  } catch (error) {}
  try {
    // let button_payment_token = await user.payment_token(
    //   phone,
    //   msg.chat.id,
    //   charge_amount
    // )
    message = ` شما درخواست شارژ به مبلغ ${charge_amount} تومان برای شماره موبایل ${phone} داده اید`
    message += `\n در صورت تایید موارد فوق بر روی پرداخت فشار دهید `

    options.reply_markup.keyboard.push([{
      text: 'پرداخت'
    }])
    options.reply_markup.keyboard.push([{
      text: 'بازگشت به خانه'
    }])

    await bot.sendMessage(msg.chat.id, message, options)
  } catch (error) {
    options.reply_markup.keyboard.push([{
      text: 'بازگشت به خانه'
    }])
    return bot.sendMessage(msg.chat.id, 'خطایی رخ داده است', options)
  }

  // message = `شارژ با موفقیت انجام شد`
  // message += `\nمبلغ ${charge_amount} تومان`
  // message += `\nاعتبار کنونی ${+charge_amount+4000} تومان`
  // let visit_doctor = await user.visit_doctor;
  // if (visit_doctor) {
  //     rows.push({
  //         buttons: [{
  //             type: "Call",
  //             button_view: {
  //                 text: "تماس با پزشک",
  //                 type: "TextOnly"
  //             },
  //             button_call: {
  //                 "phone_number": "02174471111"
  //             },
  //         }]
  //     })
  // }
  // rows.push({
  //     buttons: [{
  //         type: "Simple",
  //         button_view: {
  //             text: "بازگشت به خانه",
  //             type: "TextOnly"
  //         }
  //     }]
  // })
  // let data = {
  //     bot_keypad: {
  //         rows
  //     }
  // }
  // await bot.sendMessage(msg.chat.id, message, {
  //     data
  // })
  // if (!visit_doctor) {
  //     return
  // }
  // let res = await Doctor.find(visit_doctor)
  // let doctor = res.result.doctor;
  // message = `هزینه تماس با دکتر ${doctor.firstName} ${doctor.lastName}`

  // data.bot_keypad.rows.push({
  //     buttons: [{
  //         type: "Simple",
  //         button_view: {
  //             text: "5 دقیقه 10000 تومان",
  //             type: "TextOnly"
  //         }
  //     }]
  // })
  // data.bot_keypad.rows.push({
  //     buttons: [{
  //         type: "Simple",
  //         button_view: {
  //             text: "10 دقیقه 20000 تومان",
  //             type: "TextOnly"
  //         }
  //     }]
  // })
  // data.bot_keypad.rows.push({
  //     buttons: [{
  //         type: "Simple",
  //         button_view: {
  //             text: "15 دقیقه 30000 تومان",
  //             type: "TextOnly"
  //         }
  //     }]
  // })
  // data.bot_keypad.rows.push({
  //     buttons: [{
  //         type: "Simple",
  //         button_view: {
  //             text: "بازگشت به خانه",
  //             type: "TextOnly"
  //         }
  //     }]
  // })

  // bot.sendMessage(msg.chat.id, message, {
  //     data
  // })
})