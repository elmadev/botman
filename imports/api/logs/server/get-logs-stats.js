import moment from 'moment'
import { check } from 'meteor/check'
import { Logs } from '../logs'
import _ from 'lodash'

export const getLogsStats = (item, when, callback) => {
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

  callback(null, {
    total: allLogs.length,
    top: top
  })
}
