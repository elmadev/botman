import moment from 'moment'
import { check } from 'meteor/check'
import { Logs } from '../logs'

export const getUserLogs = (discordId, item, when) => {
  check(discordId, String)
  check(item, String)
  check(when, String) // Should be 'day', 'week', 'month', or 'year'

  let date = moment().startOf(when).toDate()

  let count = Logs.find({
    discordId: discordId,
    item: item,
    loggedAt: {$gte: date}
  }).count()

  return count
}
