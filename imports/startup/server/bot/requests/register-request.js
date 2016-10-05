import { registerUser } from '../../../../api/users/server/register-user.js'

export const handleRegister = (request) => {
    req = request
    registerUser(req.msg.author.id, (error, response) => {
        if (error) {
            console.error(`Error: ${error}`)
            req.bot.reply(req.msg, `Error: ${error}`)
        } else {
            req.bot.reply(req.msg, 'Registered successfully!')
        }
    })
}