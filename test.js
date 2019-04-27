const Telegraf = require('telegraf')
const token = '646189637:AAFLDZMefpHpm8MQobqv468Vw0iBotLlYC8'

const bot = new Telegraf(token)
const fastifyApp = require('fastify')()


bot.on('text', ({
    reply
}) => reply('Hello'))
fastifyApp.use(bot.webhookCallback('/secret-path'))
// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook('https://telegram.resaa.net/secret-path')

fastifyApp.listen(80, () => {
    console.log('Example app listening on port 3000!')
})