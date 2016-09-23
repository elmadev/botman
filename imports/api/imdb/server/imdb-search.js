import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Imdb } from '../imdb'
import needle from 'needle'

const searchTitle = (title, callback) => {
  check(title, String)
  let searchUrl = `http://www.omdbapi.com/?s=${title}&y=&r=json&v=1`
  needle.get(searchUrl, Meteor.bindEnvironment((error, response, result) => {
    if (error) {
      return callback(error)
    } else if (response.statusCode !== 200) {
      return callback('Statuscode ' + response.statusCode)
    } else if (result.Response === 'False') {
      return callback('No search results')
    } else {
      return callback(null, result.Search[0].imdbID)
    }
  }))
}

const lookupTitle = (imdbId, callback) => {
  check(imdbId, String)
  let lookupUrl = `http://www.omdbapi.com/?i=${imdbId}&y=&plot=short&r=json&v=1`
  needle.get(lookupUrl, (error, response, result) => {
    if (error) {
      return callback(error)
    } else if (response.statusCode !== 200) {
      return callback('Statuscode ' + response.statusCode)
    } else if (result.Response === 'False') {
      return callback('No search results')
    } else {
      return callback(null, result)
    }
  })
}

export const imdbSearch = (title, callback) => {
  check(title, String)

  searchTitle(title, (error, imdbId) => {
    if (error) return callback(error)
    else {
      lookupTitle(imdbId, Meteor.bindEnvironment((error, result) => {
        if (error) return callback(error)
        else {
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
            userRating += ` :star2: ${Math.round(lookup[0].rating * 10) / 10} by ${lookup[0].count} user${lookup[0].count > 1 ? 's' : ''}`
          }

          let message = { message: `${type} ${title} :date: ${year} :star: ${rating}${userRating}\n<${url}>` }
          if (result.Poster !== 'N/A') {
            message.file = result.Poster
          }
          return callback(null, message)
        }
      }))
    }
  })
}
