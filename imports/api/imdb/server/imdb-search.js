import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Imdb } from '../imdb'
import needle from 'needle'

export const imdbSearch = (searchTitle, callback) => {
  check(searchTitle, String)
  let url = `http://www.omdbapi.com/?t=${searchTitle}&y=&plot=short&r=json`

  needle.get(url, Meteor.bindEnvironment((error, response, result) => {
    if (error) {
      callback(error)
    } else if (response.statusCode !== 200) {
      callback('Statuscode ' + response.statusCode)
    } else if (result.Response === 'False') {
      callback('No search results')
    } else {
      let title = result.Title
      let year = result.Year
      let rating = result.imdbRating
      let url = `http://www.imdb.com/title/${result.imdbID}/`
      let type
      switch (result.Type) {
        case 'series':
          type = ':tv:'
          break
        case 'game':
          type = ':video_game:'
          break
        default:
          type = ':film_frames:'
      }

      // server users avg rating
      let lookup = Imdb.aggregate([
        { $match: { 'imdbId': result.imdbID } },
        { $unwind: '$ratings' },
        { $group: {
          _id: '$_id',
          rating: { $avg: '$ratings.rating' },
          count: { $sum: 1 }
        }},
        { $limit: 1 }
      ])

      let userRating = ''
      if (lookup.length > 0) {
        userRating += ` :star2: ${lookup[0].rating} by ${lookup[0].count} user${lookup[0].count > 1 ? 's' : ''}`
      }

      let message = { message: `${type} ${title} :date: ${year} :star: ${rating}${userRating}\n<${url}>` }
      if (result.Poster !== 'N/A') {
        message.file = result.Poster
      }
      callback(null, message)
    }
  }))
}
