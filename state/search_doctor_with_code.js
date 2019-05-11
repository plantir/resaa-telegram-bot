const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
bot.onText(/جستجو بر اساس کد پزشک|جستجوی کد پزشک دیگر/, async msg => {
  let user = new User(msg.chat.id);
  user.state = _enum.state.search_doctor_with_code;
  let message = `کد رسای پزشک مورد نظر را نوشته و ارسال کنید.`;
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  };
  options.reply_markup.keyboard.push([
    {
      text: 'جستجو بر اساس نام پزشک'
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: 'بازگشت به خانه'
    }
  ]);

  bot.sendMessage(msg.chat.id, message, options);
});
bot.onText(/\d+/, async msg => {
  let user = new User(msg.chat.id);
  let state = await user.state;
  if (state != _enum.state.search_doctor_with_code) {
    return;
  }
  user.state = _enum.state.select_doctor;
  let code = +msg.text.replace(/[^\d+]/g, '');
  let doctors = await Doctor.get_doctors({
    code
  });
  let message = `نتایج جستجو برای کد پزشک ${code}`;
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  };
  doctors.forEach((doctor, index) => {
    let text = `${doctor.subscriberNumber} ${doctor.firstName} ${
      doctor.lastName
    }`;
    if (index % 2 === 0) {
      options.reply_markup.keyboard.push([
        {
          text
        }
      ]);
    } else {
      let i = Math.ceil(index / 2) - 1;

      options.reply_markup.keyboard[i].push({
        text
      });
    }
  });
  if (doctors.length === 0) {
    message = `نتیجه ای برای کد پزشک "${code}" یافت نشد`;
  }
  options.reply_markup.keyboard.push([
    {
      text: 'جستجوی کد پزشک دیگر'
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: 'جستجو بر اساس نام پزشک'
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: 'بازگشت به خانه'
    }
  ]);

  bot.sendMessage(msg.chat.id, message, options);
});
