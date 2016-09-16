import { check } from 'meteor/check'
import { Imdb } from '../imdb'

export const imdbTop = (limit, callback) => {
  check(limit, Number)
  limit = limit || 10

  let result = Imdb.aggregate([
    { $match: { 'ratings.1': { $exists: true } } },
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

  if (result.length < 1) {
    callback('Not enough ratings found')
  } else {
    let msg = `**Top${limit} IMDb list as rated by server users**\n`
    for (let i = 1, j = result.length; i <= j; i++) {
      msg = `${msg}${i}. ${result[i - 1].title} (${result[i - 1].year}) :star: ${result[i - 1].rating} by ${result[i - 1].count} users <http://imdb.com/title/${result[i - 1].imdbId}>\n`
    }

    callback(null, msg)
  }
}
