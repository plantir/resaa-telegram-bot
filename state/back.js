const User = require('../Model/User');
const DoctorProvider = require('../provider/DoctorProvider');
const bot = require('../bot');
bot.onText(/بازگشت/, async msg => {
  if (msg.text == 'بازگشت به خانه') {
    return;
  }
  let user = new User(msg.chat.id);
  let last_state = await user.pop_history();
  user.state = last_state.state;
  if (last_state) {
    if (last_state.body.caption && last_state.body.caption.includes('کد رسا')) {
      let matches = last_state.body.caption.match(/\d+/gm);
      let doctor_id = matches[0];
      return DoctorProvider.sned_doctor_profile(msg.chat.id, doctor_id);
    }
    bot.sendMessage(msg.chat.id, last_state.text, last_state.body);
  }
});
