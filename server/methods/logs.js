import {Logs} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import moment from 'moment'

export default function () {
  Meteor.methods({
    'logs.register'(username, item) {
      check(username, String)
      check(item, String)

      Logs.insert({
        username: username,
        item: item,
        createdAt: new Date()
      })

      let today = moment().startOf('day').toDate()
      let todayCount = Logs.find({
        username: username,
        item: item,
        createdAt: {$gte: today}
      }).count()

      let totalCount = Logs.find({
        username: username,
        item: item
      }).count()

      console.log(`${username} logged a ${item}`)

      return {
        today: todayCount,
        total: totalCount
      }
    }
  })
}
