import {ChatLog} from '/lib/collections'
import {Meteor} from 'meteor/meteor'

export default function () {
  Meteor.publish('chatlog', function () {
    return ChatLog.find()
  })
}
