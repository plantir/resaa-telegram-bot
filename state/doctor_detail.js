const User = require('../Model/User');
const Doctor = require('../Model/Doctor');
const bot = require('../bot');
const _enum = require('../config/enum');
const DoctorProvider = require('../provider/DoctorProvider');
const _ = require('lodash');
bot.onText(/\d+/, async msg => {
  let id = +msg.text.replace(/[^\d+]/g, '');
  let user = new User(msg.chat.id);
  let state = await user.state;
  let is_doctor = /[0-9]{4,4} ./g.test(msg.text);
  if (!is_doctor) {
    return;
  }
  return DoctorProvider.sned_doctor_profile(msg.chat.id, id);
});
