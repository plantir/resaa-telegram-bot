const User = require('../Model/User')
const bot = require('../bot')
const _enum = require('../config/enum')
const start_video = 'BAADBAAD0wUAAtRquVDOyHp6nv1negI'

bot.onText(/شروع|بازگشت به خانه|start/, async msg => {
  let user = new User(msg.chat.id)
  user.reset_state_history()
  user.state = _enum.state.start
  let phone = await user.phone
  let message = `به رسا خوش آمدید\nجهت آشنایی بیشتر با رسا این ویدیو رو تماشا نمایید`
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  }
  if (phone) {
    options.reply_markup.keyboard.push([
      {
        text: 'شارژ اعتبار رسا'
      }
    ])
  }
  options.reply_markup.keyboard.push(
    ...[
      [
        {
          text: 'سوال پزشکی دارم'
        },
        {
          text: 'پرسش از پزشک خودم'
        }
      ]
    ]
  )
  options.reply_markup.keyboard.push([
    {
      text: 'تماس با پشتیبانی'
    }
  ])
  options.caption = message
  await bot.sendVideo(msg.chat.id, start_video, options)
})
