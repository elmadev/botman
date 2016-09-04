import _ from 'lodash'
import Loggables from './loggables'

let Responses = {
  'github': 'https://github.com/nodepowered/botman',
  'trello': 'https://trello.com/b/WyGGKT38/elma-discord',
  'trello-invite': 'https://trello.com/invite/b/WyGGKT38/c9897d93b477490ebfd2edff242cc49f/elma-discord',
  'playlist': 'http://tinyurl.com/musicmanautoplaylist',
  'autoplaylist': 'http://tinyurl.com/musicmanautoplaylist'
}

Responses.rand = (args) => {
  let numbers = args.splice(0, 2).map((string) => { return parseInt(string) })
  console.log(numbers)
  if (numbers[1]) {
    return _.random(numbers[0], numbers[1])
  } else if (numbers[0]) {
    return _.random(numbers[0])
  } else {
    return _.random(0, 100)
  }
}

Responses.draw = (name) => {
  let link = 'http://isocyanide.xyz/draw/'
  return name ? link + name : link
}

let foods = _.reduce(Loggables, (list, object) => {
  if (object.category === 'food') list.push(object.item)
  return list
}, [])

let beverages = _.reduce(Loggables, (list, object) => {
  if (object.category === 'beverage') list.push(object.item)
  return list
}, [])

let activities = _.reduce(Loggables, (list, object) => {
  if (object.category === 'activity') list.push(object.item)
  return list
}, [])

Responses.loggables = '**Beverages:** `' + beverages.join(', ') +
  '`\n**Foods:** `' + foods.join(', ') +
  '`\n**Activities:** `' + activities.join(', ') + '`'

export default Responses
