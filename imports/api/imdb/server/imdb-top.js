import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Imdb } from '../imdb'
import _ from 'lodash'

export const imdbTop = (options, callback) => {
  let limit = options.limit || 10
  let minVotes = options.minVotes || 2
  
  let result = Imdb.aggregate([
    { $match: { 'ratings.1': { $exists: true } } },
    { $unwind: '$ratings' },
    { $group: {
      _id: '$_id',
      title: { $first: '$title' },
      rating: { $avg: '$ratings.rating' },
      count: { $sum: 1 }
    }},
    { $sort: { rating: -1 } },
    { $limit: limit }
  ])
  console.log(result)
  // callback('Command make no sense idiot...')
  callback(null)
}
