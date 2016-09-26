import { check } from 'meteor/check'
import { Imdb } from '../imdb'
import _ from 'lodash'

export const imdbTop = (args, limit, callback) => {
  check(limit, Number)
  limit = limit || 10
  let filterDesc = ''
  let typeQuery = { titleType: 'movie' }
  let typeDesc = 'movie'
  let sortQuery = { rating: -1, count: -1 }
  let sortDesc = ', sorted by `highest rating`'
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
        sortDesc = ', sorted by `number of votes`'
        sortQuery = { count: -1, rating: -1 }
        break
      case 'bottom':
        sortDesc = ', sorted by `lowest rating`'
        sortQuery = { rating: 1, count: -1 }
        break
      default:
        break
    }
  }

  let matchQuery = [{ 'ratings.1': { $exists: true } }, typeQuery]

  // filter by genre
  let genreFilter = _.find(args, arg => { return arg.startsWith('g:') })
  if (genreFilter) {
    let genres = genreFilter.substring(2).toLowerCase().split(',')
    matchQuery.push({ genres: { $all: genres } })
    filterDesc += `, filtered by \`${genres.join(', ')}\``
  }

  // filter by year
  let yearFilter = _.find(args, arg => { return arg.startsWith('y:') })
  if (yearFilter) {
    let year = yearFilter.substring(2)
    matchQuery.push({ year: year })
    if (filterDesc) filterDesc += ` and year \`${year}\``
    else filterDesc = `, filtered by year \`${year}\``
  }

  let result = Imdb.aggregate([
    { $match: { $and: matchQuery } },
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
    let msg = `**Top${limit} IMDb \`${typeDesc}\` list${filterDesc}${sortDesc}**\n`
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
