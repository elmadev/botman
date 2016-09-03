import _ from 'lodash'
import loggables from './loggables'

let Responses = {
  'github': 'https://github.com/nodepowered/botman',
  'trello': 'https://trello.com/b/WyGGKT38/elma-discord',
  'playlist': 'http://tinyurl.com/musicmanautoplaylist',
  'autoplaylist': 'http://tinyurl.com/musicmanautoplaylist',
  'rand': (min, max) => {
    return max ? _.random(min) : _.random(min, max)
  },
  'draw': (name) => {
    return 'http://isocyanide.xyz/draw/' + name ? name : ''
  }
}

let foods = _.reduce(loggables, (list, object) => {
  if (object.category === 'food') list.push(object.item)
  return list
}, [])

let beverages = _.reduce(loggables, (list, object) => {
  if (object.category === 'beverage') list.push(object.item)
  return list
}, [])

let activities = _.reduce(loggables, (list, object) => {
  if (object.category === 'activity') list.push(object.item)
  return list
}, [])

Responses.loggables = '**Loggables**:' +
  '\nBeverages: `' + beverages.join(', ') +
  '`\nFoods: `' + foods.join(', ') +
  '`\nActivities: `' + activities.join(', ') + '`'

export default Responses
