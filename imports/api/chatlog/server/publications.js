import { ChatLog } from '../chatlog'
import { Meteor } from 'meteor/meteor'

Meteor.publish('chatlog', function () {
  return ChatLog.find()
})
