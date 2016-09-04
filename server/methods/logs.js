import {Logs} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import moment from 'moment'
import _ from 'lodash'

export default function () {
  Meteor.methods({
    'logs.register' (discordId, item) {
      check(discordId, String)
      check(item, String)

      Logs.insert({
        discordId: discordId,
        item: item,
        loggedAt: new Date()
      })

      let today = moment().startOf('day').toDate()
      let todayCount = Logs.find({
        discordId: discordId,
        item: item,
        loggedAt: {$gte: today}
      }).count()

      let totalCount = Logs.find({
        discordId: discordId,
        item: item
      }).count()

      console.log(`"${discordId}" logged a ${item}`)

      return {
        today: todayCount,
        total: totalCount
      }
    },

    'logs.getStats' (item, when) {
      check(item, String)
      check(when, String) // Should be 'day', 'week', 'month', or 'year'

      let date = moment().startOf(when).toDate()

      let allLogs = Logs.find({
        item: item,
        loggedAt: {$gte: date}
      }).fetch()

      let allStats = _.reduce(allLogs, (result, value) => {
        if (!result[value.discordId]) result[value.discordId] = 1
        else result[value.discordId]++
        return result
      }, {})

      let statsToSort = Object.keys(allStats).map(key => {
        return { discordId: key, logs: allStats[key] }
      })

      let topStats = _.sortBy(statsToSort, 'logs').reverse()

      let top = topStats.slice(0, 10)

      return {
        total: allLogs.length,
        top: top
      }
    }
  })
}
