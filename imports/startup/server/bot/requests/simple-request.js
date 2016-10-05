import Responses from '../responses'

export const handleSimpleResponse = (req) => {
    if (typeof Responses[req.command] === 'string') {
        req.bot.sendMessage(req.msg, Responses[req.command])
    } else if (typeof Responses[req.command] === 'function') {
        req.bot.sendMessage(req.msg, `${Responses[req.command](req.args)}`)
    }
    return
}