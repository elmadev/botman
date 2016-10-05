import { Meteor } from 'meteor/meteor'
import { registerChatlog } from '../../../../api/chatlog/server/register-chatlog.js'
import Responses from '../responses'
import { allowedProfileFields, loggableItemsWithAliases, loggingStatsCommands, gameNotifiers } from '../settings'
import _ from 'lodash'

const prefix = Meteor.settings.discord.prefix

export class Request {
    constructor(message, _bot) {
        this.msg = message
        this.bot = _bot
        splitContent = this.msg.content.split(' ')
        this.command = splitContent[0].substring(1).toLowerCase() // Command without prefix
        this.args = _.drop(splitContent)
    }

    getNick() { // TODO: refactor: this is duplicated code in bot.js
        let server = this.msg.server
        let discordId = this.msg.author.id
        let user = this.bot.users.get(discordId)
        return server.detailsOf(user).nick || (user ? user.username : 'Deleted User')
    }

    senderIsBot() {
        return this.msg.author.bot
    }

    hasValidPrefix() {
        if (!this.msg.content.startsWith(prefix)) {
            if (this.isSpecialCaseRequest()) {
                registerChatlog(this.msg.channel.name, this.getNick(), this.msg.content, this.msg.timestamp) // Save in chat log 
            }
            return false
        }
        return true
    }

    isSpecialCaseRequest() {
        return !this.msg.content.startsWith('~')
            && this.msg.channel.name !== 'talk-to-bots'
            && this.msg.channel.name !== 'nsfw'
    }

    isSimpleReponse() {
        return Responses[this.command]
    }

    isLogging() {
        return loggableItemsWithAliases.indexOf(this.command) > -1
            || (this.command === 'log' && this.args[0])
    }

    // Profile registration command for those who joined server before bot started autoregistering people
    isRegister() {
        return this.command === 'register'
            || this.command === 'reg'
    }

    isSetUserProfileSettings() {
        return this.command === 'set'
            && allowedProfileFields.indexOf(this.args[0]) > -1
            && this.args[1]
    }

    isGetUserProfileSettings() {
        return this.command === 'get'
            && allowedProfileFields.indexOf(this.args[0]) > -1
    }

    lastPlayedFMSong() {
        return this.command === 'lastfm'
            || this.command === 'lfm'
    }

    isDisplayLoggingTotalStats() {
        return !_.isEmpty(_.pick(loggingStatsCommands, this.command))
            && this.args[0]
    }

    isDisplayGamingNotifications() {
        return gameNotifiers.indexOf(this.command) > -1
    }

    isImdbSearch() {
        return this.command === 'imdb'
    }

    isImdbRatingsUpdate() {
        return this.command === 'imdbupdate'
    }

    isImdbTopList() {
        return this.command === 'imdbtop'
    }
}