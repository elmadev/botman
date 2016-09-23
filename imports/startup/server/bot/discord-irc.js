import discordIRC from 'discord-irc'
import { Meteor } from 'meteor/meteor'

export default function () {
  discordIRC(Meteor.settings.discordIrc)
}
