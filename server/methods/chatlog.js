import {ChatLog} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import moment from 'moment'

export default function () {
  Meteor.methods({
    'chatlog.register' (channel, nick, message, timestamp) {
      check(channel, String)
      check(nick, String)
      check(message, String)
      check(timestamp, Number)

      if (!message) return

      let log = {
        channel: channel,
        nick: nick,
        message: message,
        timestamp: moment(timestamp).toDate()
      }

      ChatLog.insert(log)
    }
  })
}
