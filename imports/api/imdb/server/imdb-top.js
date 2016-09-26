import { check } from 'meteor/check'
import { Imdb } from '../imdb'
import _ from 'lodash'

export const imdbTop = (args, limit, callback) => {
  check(limit, Number)
  limit = limit || 10
  let typeQuery = { titleType: 'movie' }
  let typeDesc = 'movie'
  let sortQuery = { rating: -1, count: -1 }
  let sortDesc = 'sorted by rating'
  // type
  if (args[0]) {
    if (args[0].toLowerCase() === 'series') typeQuery.titleType = typeDesc = 'series'
    else if (args[0].toLowerCase() === 'game') typeQuery.titleType = typeDesc = 'game'
  }
  // sort by
  let sortOption = _.find(args, arg => { return arg.startsWith('s:') })
  if (sortOption) {
    switch (sortOption.substring(2).toLowerCase()) {
      case 'votes':
        sortDesc = 'sorted by number of votes'
        sortQuery = { count: -1, rating: -1 }
        break
      case 'bottom':
        sortDesc = 'sorted by lowest rating'
        sortQuery = { rating: 1, count: -1 }
        break
      default:
        break
    }
  }

  let result = Imdb.aggregate([
    { $match: { $and: [{ 'ratings.1': { $exists: true } }, typeQuery] } },
    { $unwind: '$ratings' },
    { $group: {
      _id: '$_id',
      imdbId: { $first: '$imdbId' },
      title: { $first: '$title' },
      year: { $first: '$year' },
      rating: { $avg: '$ratings.rating' },
      count: { $sum: 1 }
    }},
    { $sort: sortQuery },
    { $limit: limit }
  ])

  if (result.length > 0) {
    let msg = `**Top${limit} IMDb ${typeDesc} list, ${sortDesc}**\n`
    for (let i = 1, j = result.length; i <= j; i++) {
      let title = result[i - 1].title
      let year = result[i - 1].year
      let userRating = Math.round(result[i - 1].rating * 10) / 10
      let userCount = result[i - 1].count
      let imdbId = result[i - 1].imdbId
      msg = `${msg}${i}. ${title} (${year}) :star: ${userRating} by ${userCount} users <http://imdb.com/title/${imdbId}>\n`
    }
    return callback(null, msg)
  }
  return callback('Not enough ratings found')
}
