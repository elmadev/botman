import { Meteor } from 'meteor/meteor'
import Responses from '../responses'
import Loggables from '../loggables'
import OtherGames from '../othergames'
import { allowedProfileFields, loggableItemsWithAliases, loggingStatsCommands, gameNotifiers } from '../settings'
import _ from 'lodash'
import LastfmAPI from 'lastfmapi'

// Functions
import { getGamers } from '../../../../api/users/server/get-gamers.js'
import { getUserField } from '../../../../api/users/server/get-user-field.js'
import { registerUser } from '../../../../api/users/server/register-user.js'
import { setUserField } from '../../../../api/users/server/set-user-field.js'
import { getLogsStats } from '../../../../api/logs/server/get-logs-stats.js'
import { registerLogs } from '../../../../api/logs/server/register-logs.js'
import { registerChatlog } from '../../../../api/chatlog/server/register-chatlog.js'
import { imdbSearch } from '../../../../api/imdb/server/imdb-search.js'
import { imdbUpdate } from '../../../../api/imdb/server/imdb-update.js'
import { imdbTop } from '../../../../api/imdb/server/imdb-top.js'

let req
let msg
let bot
let command
let args

class RequestLogic {
    constructor(request) {
        req = request
        msg = req.getMessage()
        bot = req.getBot()
        this.splitArguments()
    }

    splitArguments() {
        args = msg.content.split(' ')
        command = args[0].substring(1).toLowerCase() // Command without prefix
        args = _.drop(args)        
    }

    handleRequest() {
        if (isSimpleReponse()) {
            handleSimpleResponse()
        } else if (isLogging()) {
            handleLogging()
        } else if (isRegister()) {
            handleRegister()
        } else if (isSetUserProfileSettings()) {
            setUserProfileSettings()
        } else if (isGetUserProfileSettings()) {
            getUserProfileSettings()
        } else if (lastPlayedFMSong()) {
            lastPlayedFMSong()
        } else if (isDisplayLoggingTotalStats()) {
            displayLoggingTotalStats()
        } else if (isDisplayGamingNotifications()) {
            displayGamingNotifications()
        } else if (isImdbSearch()) {
            handleImdbSearch()
        } else if (isImdbRatingsUpdate()) {
            handleImdbRatingsUpdate()
        } else if (isImdbTopList) {
            handleImdbTopList()
        } else if (command.startsWith('s/')) { // Search and replace
            // wip
        }
    }
}
export { RequestLogic }

function isSimpleReponse() { return Responses[command] }

function handleSimpleResponse() {
    if (typeof Responses[command] === 'string') {
        bot.sendMessage(msg, Responses[command])
    } else if (typeof Responses[command] === 'function') {
        bot.sendMessage(msg, `${Responses[command](args)}`)
    }
    return
}

function isLogging() { return loggableItemsWithAliases.indexOf(command) > -1 || (command === 'log' && args[0]) }

function handleLogging() {
    let itemName = command === 'log' ? args[0] : command
    let loggableIndex = _.findIndex(Loggables, (o) => {
        return o.item === itemName || o.aliases.indexOf(itemName) > -1
    })
    let item = loggableIndex > -1 ? Loggables[loggableIndex] : {
        item: itemName, singular: itemName, plural: itemName
    }

    let nick = req.getNick()
    registerLogs(msg.author.id, item.item, (error, response) => {
        if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error.reason}`)
        } else {
            bot.sendMessage(msg, `${item.singular} #${response.today} todey for ${nick} loged (${response.total} ${item.plural} total for him)`)
        }
    })
}

// Profile registration command for those who joined server before bot started autoregistering people
function isRegister() { return command === 'register' || command === 'reg' }

function handleRegister() {
    registerUser(msg.author.id, (error, response) => {
        if (error) {
            console.error(`Error: ${error}`)
            bot.reply(msg, `Error: ${error}`)
        } else {
            bot.reply(msg, 'Registered successfully!')
        }
    })
}

function isSetUserProfileSettings() { return command === 'set' && allowedProfileFields.indexOf(args[0]) > -1 && args[1] }

function setUserProfileSettings() {
    setUserField(msg.author.id, args[0], _.drop(args), (error, response) => {
        if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error}`)
        } else {
            bot.reply(msg, 'Setting set!')
        }
    })
}

function isGetUserProfileSettings() { return command === 'get' && allowedProfileFields.indexOf(args[0]) > -1 }

function getUserProfileSettings() {
    let getId = (server, nickname) => { //TODO: refactor: can maybe put inside request.js ? wtf is nickname, get id? id of what?
        let id
        _.forEach(server.members, (value) => {
            let nick = server.detailsOf(value.id).nick
            if (nick === nickname) {
                id = value.id
            }
        })
        return id || '404'
    }

    getUserField(args[1] ? getId(msg.server, args[1]) : msg.author.id, args[0], (error, response) => {
        if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error}`)
        } else {
            bot.reply(msg, `${response}`)
        }
    })
}

function lastPlayedFMSong() { return command === 'lastfm' || command === 'lfm' }

function lastPlayedFMSong() {
    if (args[0]) { // Someone other than the user itself
        let params = {
            limit: 1,
            user: args[0]
        }

        let lfm = new LastfmAPI({
            'api_key': Meteor.settings.lastfm.api_key,
            'secret': Meteor.settings.lastfm.secret
        })

        lfm.user.getRecentTracks(params, (error, recentTracks) => {
            if (error) {
                console.error(error)
                bot.reply(msg, `Error: ${error.reason || error.message}`)
            } else {
                let np = recentTracks.track[0]
                bot.sendMessage(msg, `**${args[0]}** np: *${np.artist['#text']}* - *${np.name}* :notes:`)
            }
        })
    } else {
        getUserField(msg.author.id, 'lastfm', (error, response) => {
            if (error) {
                console.error(error)
                bot.reply(msg, `Error: ${error}`)
            } else {
                // Proceed to query Last.fm API
                let params = {
                    limit: 1,
                    user: response
                }
                lfm.user.getRecentTracks(params, (error, recentTracks) => {
                    if (error) {
                        console.error(error)
                        bot.reply(msg, `Error: ${error.reason || error.message}`)
                    } else {
                        let np = recentTracks.track[0]
                        bot.reply(msg, `np: *${np.artist['#text']}* - *${np.name}* :notes:`)
                    }
                })
            }
        })
    }
}

function isDisplayLoggingTotalStats() { return !_.isEmpty(_.pick(loggingStatsCommands, command)) && args[0] }

function displayLoggingTotalStats() {
    let when = _.pick(loggingStatsCommands, command)[command]
    let itemName = args[0]

    if (loggableItemsWithAliases.indexOf(args[0]) > -1 || (command === 'log' && args[0])) {
        let loggableIndex = _.findIndex(Loggables, (o) => {
            return o.item === itemName || o.aliases.indexOf(itemName) > -1
        })
        if (loggableIndex > -1) itemName = Loggables[loggableIndex].item
    }

    let getNick = (server, discordId) => {
        let user = bot.users.get(discordId)
        return server.detailsOf(user).nick || (user ? user.username : 'Deleted User')
    }

    getLogsStats(itemName, when, (error, response) => {
        if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error.reason}`)
        } else {
            let topMsg = response.top.reduce((prev, current, index) => {
                console.log('current', current.discordId)
                return `${prev}**${index + 1}.** ${getNick(msg.server, current.discordId)}[${current.logs}] `
            }, '')
            bot.sendMessage(msg, `**Top loggers of ${args[0]} ${when === 'day' ? command : 'this ' + command}:**\n${topMsg} **Total:** ${response.total}`)
        }
    })
}

function isDisplayGamingNotifications() { return gameNotifiers.indexOf(command) > -1 }

function displayGamingNotifications() {
    let gameName = command
    let gameIndex = _.findIndex(OtherGames, (o) => {
        return o.item === gameName || o.aliases.indexOf(gameName) > -1
    })
    if (gameIndex > -1) gameName = OtherGames[gameIndex].command

    let getMention = (discordId) => {
        return bot.users.get(discordId).mention()
    }

    getGamers(gameName, (error, response) => {
        if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error.reason}`)
        } else {
            let mentions = response.reduce((prev, current, index) => {
                return `${prev}${getMention(current)} `
            }, '')
            bot.sendMessage(msg, `Someone said ${command} ${mentions}`)
        }
    })
}

function isImdbSearch() { return command === 'imdb' }

function handleImdbSearch() {
    if (args[0]) {
        let searchTitle = args.join(' ')
        imdbSearch(searchTitle, (error, response) => {
            if (error) {
                console.error(error)
                bot.reply(msg, `Error: ${error}`)
            } else {
                bot.sendMessage(msg, response.message, response.file ? { file: response.file } : {})
            }
        })
    } else {
        bot.reply(msg, 'Usage: !imdb <title to search>')
    }
}

function isImdbRatingsUpdate() { return command === 'imdbupdate' }

function handleImdbRatingsUpdate() {
    // tell mans to calm down, delete message after 10s
    bot.sendMessage(msg, 'Updating, hold your :horse:, may take up to a minute', (error, updateMsg) => {
        if (error) { }
        setTimeout(() => {
            bot.deleteMessage(updateMsg)
        }, 10000)
    })

    imdbUpdate(msg.author.id, (error, response) => {
        if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error}`)
        } else {
            bot.reply(msg, `Updated ${response.updated} ratings, ${response.total} total ratings`)
        }
    })
}

function isImdbTopList() { return command === 'imdbtop' }

function handleImdbTopList() {
    imdbTop(args, 15, (error, response) => {
        if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error}`)
        } else {
            bot.sendMessage(msg, response)
        }
    })
}