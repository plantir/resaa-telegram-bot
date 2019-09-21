const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const bot_token = bot.token;
const _enum = require('../config/enum');
const _ = require('lodash');
const request = require('request-promise');
const Logger = require('../Logger');
bot.onText(/ارسال جواب آزمایش/, async msg => {
  let message = '';
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  };

  let user = new User(msg.chat.id);
  let visit_doctor = await user.visit_doctor;
  let phone = await user.phone;
  let doctor = await user.last_visit_doctor;
  user.state = _enum.state.test_answer;
  let test_answer = await Doctor.request_test_answer(visit_doctor, phone);
  if (test_answer.status === 'needMoney') {
    message = `در خواست شما نیاز به ${test_answer.request_price} تومان شارژ دارد و اعتبار شما کافی نمی‌باشد لطفا حساب خود را شارژ نمایید`;
    options.reply_markup.keyboard.push([
      {
        text: `شارژ اعتبار رسا`
      }
    ]);
    options.reply_markup.keyboard.push([
      {
        text: `بازگشت`
      }
    ]);
    options.reply_markup.keyboard.push([
      {
        text: `بازگشت به خانه`
      }
    ]);

    return bot.sendMessage(msg.chat.id, message, options);
  } else if (test_answer.status === 'needTalk') {
    user.state = _enum.state.doctor_detail;
    message = `برای ارسال جواب آزمایش نیاز به هماهنگی قبلی با پزشک هست.\nشما در ۲۴ ساعت اخیر با این پزشک مکالمه ای نداشته اید لطفا ابتدا با پزشک خود مکالمه کنید سپس جواب آزمایش را ارسال نمایید`;
    options.reply_markup.keyboard.push([
      {
        text: `تماس با دکتر ${doctor.firstName} ${doctor.lastName}`
      }
    ]);
    options.reply_markup.keyboard.push([
      {
        text: `بازگشت`
      }
    ]);
    options.reply_markup.keyboard.push([
      {
        text: `بازگشت به خانه`
      }
    ]);

    return bot.sendMessage(msg.chat.id, message, options);
  }
  await user.remove_files();
  message = `هزینه جواب آزمایش ${test_answer.request_price} تومان می باشد و در صورت ارسال فایل از شارژ رسا شما کم میشود\nدر صورت تایید عکس آزمایش خود را بفرستید`;
  options.reply_markup.keyboard.push([
    {
      text: `بازگشت`
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: `بازگشت به خانه`
    }
  ]);
  bot.sendMessage(msg.chat.id, message, options);
});
bot.onText(/حذف تمامی فایل ها و ارسال مجدد/, async msg => {
  let user = new User(msg.chat.id);
  let state = await user.state;
  if (state != _enum.state.test_answer) {
    return;
  }
  await user.remove_files();
  let message = `همه فایل های ارسال شده پاک شده لطفا فایل خود رو مجددا ارسال نمایید`;
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  };
  options.reply_markup.keyboard.push([
    {
      text: `بازگشت به خانه`
    }
  ]);

  return bot.sendMessage(msg.chat.id, message, options);
});
bot.on('photo', async msg => {
  let user = new User(msg.chat.id);
  let state = await user.state;
  if (state != _enum.state.test_answer) {
    return;
  }
  let files = await user.get_files();
  if (files.length > 7) {
    return bot.sendMessage(
      msg.chat.id,
      `شما تا کنون ${files.length} فایل پیوست کرده اید تعداد حداکثر فایل های قابل پیوست ۸ عدد میباشد`
    );
  }
  let { file_id } = msg.photo.reverse()[0];
  let {
    result: { file_path }
  } = await request.get({
    url: `https://api.telegram.org/bot${bot_token}/getFile?file_id=${file_id}`,
    json: true
  });
  files = await user.add_file(
    `https://api.telegram.org/file/bot${bot_token}/${file_path}`
  );
  let message = `شما تا کنون ${files.length} فایل پیوست کرده اید اگر فایل دیگری هم دارید ارسال کنید در غیر اینصورت بر روی دکمه اتمام کلیک کنید`;
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  };
  options.reply_markup.keyboard.push([
    {
      text: `اتمام`
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: `حذف تمامی فایل ها و ارسال مجدد`
    }
  ]);
  options.reply_markup.keyboard.push([
    {
      text: `بازگشت به خانه`
    }
  ]);
  return bot.sendMessage(msg.chat.id, message, options);
});
bot.onText(/اتمام|تلاش مجدد/, async msg => {
  let user = new User(msg.chat.id);
  let phone = await user.phone;
  let doctor_id = await user.visit_doctor;
  // phone = '09356659943';
  // doctor_id = 6843;
  let res = await Doctor.find(doctor_id);
  let doctor = res.result.doctor;
  let message;
  let options = {
    reply_markup: {
      keyboard: [],
      resize_keyboard: true
    }
  };
  try {
    let test_answer = await Doctor.request_test_answer(doctor_id, phone);
    let { tracking_code, count } = await user.send_testAnswer(
      test_answer.chat_id
    );
    message = `جواب آزمایش شما با موفقیت برای دکتر ${doctor.firstName} ${doctor.lastName} ارسال شد\n کد پیگیری جواب آزمایش شما ${tracking_code}`;
    options.reply_markup.keyboard.push([
      {
        text: `بازگشت به خانه`
      }
    ]);
    user.confirm_testAnswer(doctor_id, tracking_code, count);
  } catch (error) {
    message = error;
    options.reply_markup.keyboard.push([
      {
        text: `تلاش مجدد`
      }
    ]);
    options.reply_markup.keyboard.push([
      {
        text: `بازگشت به خانه`
      }
    ]);
  }

  bot.sendMessage(msg.chat.id, message, options);
  //   let user = new User(msg.chat.id);
  //   let { subscriberNumber } = await user.last_visit_doctor;
  //   let res = await Doctor.find(subscriberNumber);
  //   let doctor = res.result.doctor;

  //   let message;
  //   let options = {
  //     reply_markup: {
  //       keyboard: [],
  //       resize_keyboard: true
  //     }
  //   };
  //   try {
  //     let test_answer = await Doctor.request_test_answer(doctor_id, phone);
  //     let { tracking_code, count } = await user.send_testAnswer(
  //       test_answer.chat_id
  //     );
  //     let tracking_code = await user.send_testAnswer(38320614);
  //     message = `جواب آزمایش شما با موفقیت برای دکتر ${doctor.firstName} ${doctor.lastName} ارسال شد\n کد پیگیری جواب آزمایش شما ${tracking_code}`;
  //     options.reply_markup.keyboard.push([
  //       {
  //         text: `بازگشت به خانه`
  //       }
  //     ]);
  //   } catch (error) {
  //     message = error;
  //     options.reply_markup.keyboard.push([
  //       {
  //         text: `تلاش مجدد`
  //       }
  //     ]);
  //     options.reply_markup.keyboard.push([
  //       {
  //         text: `بازگشت به خانه`
  //       }
  //     ]);
  //   }

  //   bot.sendMessage(msg.chat.id, message, options);
});
