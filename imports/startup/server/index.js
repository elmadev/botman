import { Meteor } from 'meteor/meteor'
import './api'
import bot from './bot'
import discordIRC from 'elmadev-discord-irc'

Meteor.startup(() => {
  bot()
  discordIRC(Meteor.settings.discordIrc)
})
