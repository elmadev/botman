import { MusicHistory } from '../musichistory'
import { Meteor } from 'meteor/meteor'

Meteor.publish('musichistory', function () {
  return MusicHistory.find()
})
