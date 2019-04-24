require('dotenv').config()
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
if (process.env.MODE !== 'polling') {
    const bot = require('./bot')
    const port = 80;
    const token = bot.token;
    const url = 'https://telegram.resaa.net';
    const express = require('express');
    const bodyParser = require('body-parser');
    // bot.setWebHook(url);
    const app = express();
    app.use(bodyParser.json());
    app.post(`/`, (req, res) => {
        console.log(req.body);
        bot.processUpdate(req.body);
        res.sendStatus(200);
    });
    app.get(`/`, (req, res) => {
        res.sendStatus(200);
    });

    // Start Express Server
    app.listen(port, () => {
        console.log(`Express server is listening on ${port}`);
    });
}