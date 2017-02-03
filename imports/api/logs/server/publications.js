import { Logs } from '../logs'
import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

Meteor.publish('logs.all', function () {
  return Logs.find()
})

Meteor.publish('logs.user', function (username) {
  check(username, String)
  return Logs.find({'username': username})
})

Meteor.publish('logs.item', function (item) {
  check(item, String)
  return Logs.find({'item': item})
})
