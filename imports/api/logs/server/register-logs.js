import { check } from 'meteor/check'
import { Logs } from '../logs'
import moment from 'moment'

export const registerLogs = (discordId, item, callback) => {
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

  callback(null, {
    today: todayCount,
    total: totalCount
  })
}
