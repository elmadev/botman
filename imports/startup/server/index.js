import { Meteor } from 'meteor/meteor'
import './api'
import bot from './bot'
import discordIrc from './bot/discord-irc'

Meteor.startup(() => {
  bot()
  discordIrc()
})
