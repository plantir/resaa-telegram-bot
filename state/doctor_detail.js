const User = require('../Model/User')
const Doctor = require('../Model/Doctor')
const bot = require('../bot')
const _enum = require('../config/enum')
const _ = require('lodash')
bot.onText(/\d+/, async msg => {
  let user = new User(msg.chat.id)
  let state = await user.state
  if (state != _enum.state.select_doctor) {
    return
  }
  let id = +msg.text.replace(/[^\d+]/g, '')
  user.state = _enum.state.doctor_detail
  user.visit_doctor = id
  let res = await Doctor.find(id)
  let doctor = res.result.doctor
  let doctor_image_id = await Doctor.image_id(id)

  user.last_visit_doctor = doctor
  let message = `\nدکتر ${doctor.firstName} ${doctor.lastName}`
  message += `\nکد رسا ${doctor.subscriberNumber}`
  message += `\n${doctor.expertise}`
  message += `\nوضعیت ${
    doctor.currentlyAvailable ? 'در دسترس' : 'خارج از دسترس'
  }`
  let photo = await bot.sendPhoto(msg.chat.id, doctor_image_id, {
    caption: message
  })
  Doctor.saveImage(doctor.subscriberNumber, photo)
  let time_message = `زمان های پاسخگویی\n`
  doctor.timetable.segments = _.sortBy(doctor.timetable.segments, o => o.from)
  for (const item of doctor.timetable.segments) {
    let date = Math.floor(item.from / 60 / 24)
    let date_name
    switch (date) {
      case 0:
        date_name = 'شنبه           '
        break
      case 1:
        date_name = 'یکشنبه       '
        break
      case 2:
        date_name = 'دوشنبه    '
        break
      case 3:
        date_name = 'سه‌شنبه    '
        break
      case 4:
        date_name = 'چهارشنبه  '
        break
      case 5:
        date_name = 'پنجشنبه    '
        break
      case 6:
        date_name = 'جمعه          '
        break
    }
    let start_time_hour = Math.floor((item.from / 60) % 24)
    let end_time_hour = Math.floor((item.to / 60) % 24)
    let start_time_minute = Math.round(((item.from / 60) % 1) * 60)
    let end_time_minute = Math.round(((item.to / 60) % 1) * 60)
    if (start_time_minute < 10) {
      start_time_minute = `0${start_time_minute}`
    }
    if (end_time_minute < 10) {
      end_time_minute = `0${end_time_minute}`
    }
    if (start_time_hour < 10) {
      start_time_hour = `0${start_time_hour}`
    }
    if (end_time_hour < 10) {
      end_time_hour = `0${end_time_hour}`
    }
    time_message += `\n${date_name} ${end_time_hour}:${end_time_minute} - ${start_time_hour}:${start_time_minute}`
  }
  time_message += `\n تماس از طریق رسا`
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  }
  if (doctor.currentlyAvailable) {
    options.reply_markup.keyboard.push([
      {
        text: `تماس با دکتر ${doctor.firstName} ${doctor.lastName}`
      }
    ])
  }
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

  bot.sendMessage(msg.chat.id, time_message, options)
})
