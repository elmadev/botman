import {Logs} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'

export default function () {
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
}
