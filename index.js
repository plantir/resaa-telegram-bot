require('dotenv').config({
    path: process.env.NODE_ENV == 'development' ? './.env.development' : './.env'
})
require('./state/start')
require('./state/contactus')
require('./state/my_doctor')
require('./state/medical_question')
require('./state/search_doctor_with_name')
require('./state/search_doctor_with_code')
require('./state/doctor_list_with_speciality')
require('./state/doctor_detail')
require('./state/call_doctor')
require('./state/register')
require('./state/charge')
require('./state/back')
require('./state/payment_return')
require('./state/test_answer')
const bot = require('./bot')
const port = process.env.port || 3333;
const token = bot.token;
const url = 'https://telegram.resaa.net';
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const User = require('./Model/User')
const Doctor = require('./Model/Doctor')
const _enum = require('./config/enum')
// bot.setWebHook(url);
const app = express();
app.use(cors)
app.use(bodyParser.json());
app.post(`/`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});
app.post('/chargeNotify', async (req, res) => {
    let {
        chat_id,
        charge_amount,
        user_credit
    } = req.body;
    let user = new User(chat_id)
    let phone = await user.phone
    let state = await user.state;
    let visit_doctor = await user.visit_doctor
    let doctor = await user.last_visit_doctor;
    await bot.sendMessage(chat_id, `✅ پرداخت با موفقیت انجام شد ✅\nحساب شما به مبلغ ${charge_amount} تومان شارژ شد\nشارژ کنونی حساب شما ${user_credit} تومان می باشد`)
    if (state == _enum.state.test_answer) {
        let message = ''
        let options = {
            reply_markup: {
                keyboard: [],
                resize_keyboard: true
            }
        }
        let test_answer = await Doctor.request_test_answer(visit_doctor, phone)
        message = `هزینه جواب آزمایش ${test_answer.request_price} تومان می باشد و در صورت ارسال فایل از شارژ رسا شما کم میشود\nدر صورت تایید عکس آزمایش خود را بفرستید`
        options.reply_markup.keyboard.push([{
            text: `بازگشت به خانه`,
        }])
        bot.sendMessage(chat_id, message, options)
    } else if (state = _enum.state.call_doctor) {
        let price = await Doctor.get_time_price(visit_doctor, phone)
        let {
            duration,
        } = price.result.quote
        await bot.sendMessage(chat_id, `شما میتوانید به مدت ${duration} دقیقه با دکتر ${doctor.firstName} ${doctor.lastName} صحبت کنید\nبرای برقراری تماس ابتدا با شماره 02174471111 تماس گرفته و سپس کد ${doctor.subscriberNumber} را شماره گیری نمایید`)
    }
    res.send(true)
})
app.get(`/`, (req, res) => {
    res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
});
// if (process.env.MODE !== 'polling') {
// }