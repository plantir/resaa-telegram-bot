const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
bot.onText(/جستجو بر اساس نام پزشک|جستجوی نام پزشک دیگر/, async msg => {
  let user = new User(msg.chat.id);
  user.state = _enum.state.search_doctor_with_name;
  let message = `نام پزشک مورد نظر را نوشته و ارسال کنید.`;
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  };
  options.reply_markup.keyboard.push([
    {
      text: 'جستجو بر اساس کد پزشک'
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: 'بازگشت به خانه'
    }
  ]);

  bot.sendMessage(msg.chat.id, message, options);
});
bot.on('message', async msg => {
  let user = new User(msg.chat.id);
  let state = await user.state;
  if (state != _enum.state.search_doctor_with_name) {
    return;
  }
  user.state = _enum.state.select_doctor;
  let name = msg.text;
  let doctors = await Doctor.get_doctors({
    name
  });
  let message = `نتایج جستجو برای پزشک ${name}`;
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
    message = `نتیجه ای برای پزشک "${name}" یافت نشد\nشما میتوانید از طریق تماس با پشتیبانی پزشک خود را به رسا اضافه کنید`;
    options.reply_markup.keyboard.push([
      {
        text: 'تماس با پشتیبانی برای اضافه شدن پزشک'
      }
    ]);
  }
  options.reply_markup.keyboard.push([
    {
      text: 'جستجوی نام پزشک دیگر'
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: 'بازگشت به خانه'
    }
  ]);

  bot.sendMessage(msg.chat.id, message, options);
});
