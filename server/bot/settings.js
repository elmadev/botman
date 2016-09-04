import _ from 'lodash'
import Loggables from './loggables'
import OtherGames from './othergames'

const loggableItemsWithAliases = Loggables.reduce((prev, current) => {
  return _.concat(prev, current.item, current.aliases)
}, []).sort()

const gameNotifiers = OtherGames.reduce((prev, current) => {
  return _.concat(prev, current.command, current.aliases)
}, []).sort()

const allowedProfileFields = [
  'eol', 'lastfm', 'games', 'imdb', 'rocket', 'steam'
]

const loggingStatsCommands = {
  today: 'day',
  todey: 'day',
  week: 'week',
  weak: 'week',
  month: 'month',
  mounth: 'month',
  year: 'year'
}

const userIds = {
}

export {
  allowedProfileFields,
  gameNotifiers,
  loggableItemsWithAliases,
  loggingStatsCommands,
  userIds
}
