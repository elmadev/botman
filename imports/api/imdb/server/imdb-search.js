import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import needle from 'needle'

export const imdbSearch = (searchTitle, callback) => {
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

  callback(null, fut.wait())
}
