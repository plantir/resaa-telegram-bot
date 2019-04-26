const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const bot_token = bot.token;
const _enum = require('../config/enum');
const _ = require('lodash')
const request = require('request-promise')
bot.onText(/ارسال جواب آزمایش/, async msg => {
    let message = ''
    let options = {
        reply_markup: {
            keyboard: [],
            resize_keyboard: true
        }
    }

    let user = new User(msg.chat.id);
    let visit_doctor = await user.visit_doctor
    let phone = await user.phone
    user.state = _enum.state.test_answer;
    let test_answer = await Doctor.request_test_answer(visit_doctor, phone)
    if (test_answer.status === 'needMoney') {
        message = `اعتبار فعلی شما ${test_answer.user_charge} تومان میباشد و در خواست شما نیاز به ${test_answer.request_price} تومان شارژ دارد `
        options.reply_markup.keyboard.push([{
            text: `شارژ اعتبار رسا`,
        }])
        options.reply_markup.keyboard.push([{
            text: `بازگشت`,
        }])
        options.reply_markup.keyboard.push([{
            text: `بازگشت به خانه`,
        }])


        return bot.sendMessage(msg.chat.id, message, options)
    }
    message = `هزینه جواب آزمایش ${test_answer.request_price} تومان می باشد و در صورت ارسال فایل از شارژ رسا شما کم میشود\nدر صورت تایید عکس آزمایش خود را بفرستید`
    options.reply_markup.keyboard.push([{
        text: `بازگشت`,
    }])
    options.reply_markup.keyboard.push([{
        text: `بازگشت به خانه`,
    }])
    bot.sendMessage(msg.chat.id, message, options)
})
bot.onText(/حذف تمامی فایل ها و ارسال مجدد/, async msg => {
    let user = new User(msg.chat.id)
    let state = await user.state;
    if (state != _enum.state.test_answer) {
        return
    }
    await user.remove_files()
    let message = `همه فایل های ارسال شده پاک شده لطفا فایل خود رو مجددا ارسال نمایید`
    let options = {
        reply_markup: {
            keyboard: [],
            resize_keyboard: true
        }
    }
    options.reply_markup.keyboard.push([{
        text: `بازگشت به خانه`,
    }])

    return bot.sendMessage(msg.chat.id, message, options)
})
bot.on('photo', async msg => {
    let user = new User(msg.chat.id)
    let state = await user.state;
    if (state != _enum.state.test_answer) {
        return
    }
    let {
        file_id
    } = msg.photo.reverse()[0]
    let {
        result: {
            file_path
        }
    } = await request.get({
        url: `https://api.telegram.org/bot${bot_token}/getFile?file_id=${file_id}`,
        json: true
    })
    let files = await user.add_file(`https://api.telegram.org/file/bot${bot_token}/${file_path}`)
    let message = `شما تا کنون ${files.length} فایل پیوست کرده اید اگر فایل دیگری هم دارید ارسال کنید در غیر اینصورت بر روی دکمه ارسال جواب آزمایش ضربه بزنید`
    let options = {
        reply_markup: {
            keyboard: [],
            resize_keyboard: true
        }
    }
    options.reply_markup.keyboard.push([{
        text: `اتمام`,
    }])
    options.reply_markup.keyboard.push([{
        text: `حذف تمامی فایل ها و ارسال مجدد`,
    }])
    options.reply_markup.keyboard.push([{
        text: `بازگشت به خانه`,
    }])
    return bot.sendMessage(msg.chat.id, message, options)

})
bot.onText(/اتمام|تلاش مجدد/, async msg => {
    let user = new User(msg.chat.id);
    let {
        subscriberNumber
    } = await user.last_visit_doctor
    let res = await Doctor.find(subscriberNumber)
    let doctor = res.result.doctor;

    let message;
    let options = {
        reply_markup: {
            keyboard: [],
            resize_keyboard: true
        }
    }
    try {
        let tracking_code = await user.send_testAnswer(96852497)
        message = `جواب آزمایش شما با موفقیت برای دکتر ${doctor.firstName} ${doctor.lastName} ارسال شد\n کد پیگیری جواب آزمایش شما ${tracking_code}`
        options.reply_markup.keyboard.push([{
            text: `بازگشت به خانه`,
        }])
    } catch (error) {
        message = error;
        options.reply_markup.keyboard.push([{
            text: `تلاش مجدد`,
        }])
        options.reply_markup.keyboard.push([{
            text: `بازگشت به خانه`,
        }])

    }

    bot.sendMessage(msg.chat.id, message, options)
})