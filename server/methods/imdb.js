import {Imdb} from '/lib/collections'
import moment from 'moment'
import needle from 'needle'
import _ from 'lodash'

export default function () {
  Meteor.methods({
    // !imdb search
    'imdb.search' (searchTitle) {
      check(searchTitle, String)
      let url = `http://www.omdbapi.com/?t=${searchTitle}&y=&plot=short&r=json`
      let fut = new Future()

      needle.get(url, (error, response, result) => {
        if (error) {
          fut.throw(new Meteor.Error(500, error))
        } else if (response.statusCode !== 200) {
          fut.throw(new Meteor.Error(500, 'Statuscode ' + response.statusCode))
        } else if (result.Response === 'False') {
          fut.throw(new Meteor.Error(500, 'No search results'))
        } else {
          let title = result.Title
          let year = result.Year
          let rating = result.imdbRating
          let url = `http://www.imdb.com/title/${result.imdbID}/`
          let type = result.Type === 'series' ? ':tv:' : ':movie_camera:'
          // TODO: fetch server users avg rating
          let message = { message: `${type} ${title} :date: ${year} :star: ${rating}\n<${url}>`, file: result.Poster }

          fut['return'](message)
        }
      })

      return fut.wait()
    },

    // imdb rating import
    'imdb.import' (user) {
      check(user, String)

      let fut = new Future()

      // get users url
      Meteor.call('users.get', user, 'imdb', (error, response) => {
        if (error) {
          fut.throw(new Meteor.Error(500, error))
        } else {
          // temporary regex thing TODO: remove when user.set has validation
          let regex = /.*http:\/\/www\.imdb\.com\/user\/(ur\d{1,10})\/ratings.*/i
          let result = response.match(regex)
          if (!result) {
            fut.throw(new Meteor.Error(500, `<${response}> is not a valid IMDb rating URL`))
          } else {
            let url = `http://akas.imdb.com/list/export?list_id=ratings&author_id=${result[1]}`
            let settings = {
              open_timeout: 60000, // need higher timeout while waiting for imdb export generation
              headers: {
                Cookie: Meteor.settings.imdb.cookie
              }
            }

            // fetch rating list
            needle.get(url, settings, Meteor.bindEnvironment((error, response, result) => {
              if (error) {
                fut.throw(new Meteor.Error(500, error))
              } else if (response.statusCode !== 200) {
                console.log(response)
                fut.throw(new Meteor.Error(500, 'Statuscode ' + response.statusCode))
              } else {
                // trim excess whitespace creating an extra line in export file,
                // then split and remove first element (csv field descriptions)
                let tmp = result.trim().split(/\r|\n/)
                tmp.splice(0, 1)

                // parse through titles to update
                _.forEach(tmp, line => {
                  line = line.split('","') // don't need edge fields, split this way to remove substring() steps
                  let date = moment(line[2] + '+0000', 'ddd MMM D HH:mm:ss YYYY Z').toDate()
                  let rating = { discordId: user, date: date, rating: Number(line[8]) }

                  let titleDoc = Imdb.findOne({ imdbId: line[1] }, { _id: 1, ratings: 1 })
                  // does title exist?
                  if (titleDoc) {
                    let index = _.findIndex(titleDoc.ratings, { discordId: user })
                    // has the user rated it already?
                    if (index > -1) {
                      // update rating if differs
                      if (rating.rating !== titleDoc.ratings[index].rating) {
                        titleDoc.ratings[index] = rating
                        Imdb.update({ _id: titleDoc._id }, { $set: { ratings: titleDoc.ratings } })
                      }
                    } else {
                      // not rated by user, add rating
                      Imdb.update({ _id: titleDoc._id }, { $addToSet: { ratings: rating } })
                    }
                  } else {
                    // title does not exist, add it along with rating
                    Imdb.insert({
                      imdbId: line[1],
                      title: line[5],
                      year: line[11],
                      genres: line[12].split(', '),
                      ratings: [rating]
                    })
                  }
                })

                fut['return']({ updated: 0, total: 0 })
              }
            }))
          }
        }
      })

      return fut.wait()
    },

    // rating lists, optionally by year or genre
    'imdb.toplist' (optionssomething) {
      // TODO: parse input for year or genre argument(s)
      // TODO: list top x movies by rating
      // TODO: limit list to movies with x amount of votes
    }
  })
}