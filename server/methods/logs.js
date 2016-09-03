import {Logs} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import moment from 'moment'
import _ from 'lodash'

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
    },

    'logs.getStats'(item, when) {
      check(item, String)
      check(when, String) // Should be 'day', 'week', 'month', or 'year'

      let date = moment().startOf(when).toDate()

      let allLogs = Logs.find({
        item: item,
        createdAt: {$gte: date}
      }).fetch()

      let allStats = _.reduce(allLogs, (result, value) => {
        if (!result[value.username]) result[value.username] = 1
        else result[value.username]++
        return result
      }, {})

      let statsToSort = Object.keys(allStats).map(key => {
        return { username: key, logs: allStats[key] }
      })

      let topStats = _.sortBy(statsToSort, 'logs').reverse()

      let top = topStats.slice(0, 10)

      let topMsg = top.reduce((prev, current, index) => {
        return prev + '**' + (index + 1) + '.** ' + current.username + '[' + current.logs + '] '
      }, '')

      return {
        total: allLogs.length,
        top: topMsg
      }
    }
  })
}
