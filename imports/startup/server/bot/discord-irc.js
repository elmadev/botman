import discordIRC from 'elmadev-discord-irc'
import { Meteor } from 'meteor/meteor'

export default function () {
  if (Meteor.settings.isProduction) {
    discordIRC(Meteor.settings.discordIrc)
  }
}
