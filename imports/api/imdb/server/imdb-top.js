import { check } from 'meteor/check'
import { Imdb } from '../imdb'

export const imdbTop = (args, limit, callback) => {
  check(limit, Number)
  limit = limit || 10
  let typeQuery = { titleType: 'movie' }
  if (args) {
    if (args.toLowerCase() === 'series') typeQuery.titleType = 'series'
    else if (args.toLowerCase() === 'game') typeQuery.titleType = 'game'
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
    { $sort: { rating: -1, count: -1 } },
    { $limit: limit }
  ])

  if (result.length > 0) {
    let msg = `**Top${limit} IMDb list as rated by server users**\n`
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
