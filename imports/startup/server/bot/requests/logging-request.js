import { getLogsStats } from '../../../../api/logs/server/get-logs-stats.js'
import { registerLogs } from '../../../../api/logs/server/register-logs.js'
import { loggableItemsWithAliases, loggingStatsCommands } from '../settings'
import Loggables from '../loggables'
import _ from 'lodash'

let req

export const handleLogging = (request) => {
    req = request
    let itemName = req.command === 'log' ? req.args[0] : req.command
    let loggableIndex = _.findIndex(Loggables, (o) => {
        return o.item === itemName || o.aliases.indexOf(itemName) > -1
    })
    let item = loggableIndex > -1 ? Loggables[loggableIndex] : {
        item: itemName, singular: itemName, plural: itemName
    }

    let nick = req.getNick()
    registerLogs(req.msg.author.id, item.item, (error, response) => {
        if (error) {
            console.error(error)
            req.bot.reply(req.msg, `Error: ${error.reason}`)
        } else {
            req.bot.sendMessage(req.msg, `${item.singular} #${response.today} todey for ${nick} loged (${response.total} ${item.plural} total for him)`)
        }
    })
}

export const displayLoggingTotalStats = (request) => {
    req = request
    let when = _.pick(loggingStatsCommands, req.command)[req.command]
    let itemName = args[0]

    if (loggableItemsWithAliases.indexOf(req.args[0]) > -1 || (req.command === 'log' && req.args[0])) {
        let loggableIndex = _.findIndex(Loggables, (o) => {
            return o.item === itemName || o.aliases.indexOf(itemName) > -1
        })
        if (loggableIndex > -1) itemName = Loggables[loggableIndex].item
    }

    let getNick = (server, discordId) => {
        let user = req.bot.users.get(discordId)
        return server.detailsOf(user).nick || (user ? user.username : 'Deleted User')
    }

    getLogsStats(itemName, when, (error, response) => {
        if (error) {
            console.error(error)
            req.bot.reply(req.msg, `Error: ${error.reason}`)
        } else {
            let topMsg = response.top.reduce((prev, current, index) => {
                console.log('current', current.discordId)
                return `${prev}**${index + 1}.** ${getNick(req.msg.server, current.discordId)}[${current.logs}] `
            }, '')
            req.bot.sendMessage(req.msg, `**Top loggers of ${req.args[0]} ${when === 'day' ? req.command : 'this ' + req.command}:**\n${topMsg} **Total:** ${response.total}`)
        }
    })
}