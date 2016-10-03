import { Meteor } from 'meteor/meteor'
import { registerChatlog } from '../../../../api/chatlog/server/register-chatlog.js'

const prefix = Meteor.settings.discord.prefix

class Request {
    constructor(msg, bot) {
        this.msg = msg
        this.bot = bot
    }

    getNick() { // TODO: refactor: this is duplicated code in bot.js
        let server = this.msg.server
        let discordId = this.msg.author.id
        let user = this.bot.users.get(discordId)
        return server.detailsOf(user).nick || (user ? user.username : 'Deleted User')
    }

    getMessage() {
        return this.msg
    }

    getBot() {
        return this.bot
    }

    isValid() {
        return !this.senderIsBot() && this.hasValidPrefix()
    }

    senderIsBot() {
        return this.msg.author.bot
    }

    hasValidPrefix() {
        if (!this.msg.content.startsWith(prefix)) {
            if (!msg.content.startsWith('~') && msg.channel.name !== 'talk-to-bots' && msg.channel.name !== 'nsfw') {
                registerChatlog(this.msg.channel.name, this.getNick(), this.msg.content, this.msg.timestamp) // Save in chat log 
            }
            return false
        }
        return true
    }
}

export { Request }