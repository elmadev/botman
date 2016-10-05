import { getGamers } from '../../../../api/users/server/get-gamers.js'
import OtherGames from '../othergames'
import _ from 'lodash'

let req

export const displayGamingNotifications = (request) => {
    req = request
    let gameName = req.command
    let gameIndex = _.findIndex(OtherGames, (o) => {
        return o.item === gameName || o.aliases.indexOf(gameName) > -1
    })
    if (gameIndex > -1) gameName = OtherGames[gameIndex].command

    let getMention = (discordId) => {
        return req.bot.users.get(discordId).mention()
    }

    getGamers(gameName, (error, response) => {
        if (error) {
            console.error(error)
            req.bot.reply(req.msg, `Error: ${error.reason}`)
        } else {
            let mentions = response.reduce((prev, current, index) => {
                return `${prev}${getMention(current)} `
            }, '')
            req.bot.sendMessage(req.msg, `Someone said ${req.command} ${mentions}`)
        }
    })
}