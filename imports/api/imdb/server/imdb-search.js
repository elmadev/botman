import { check } from 'meteor/check'
import needle from 'needle'

export const imdbSearch = (searchTitle, callback) => {
  check(searchTitle, String)
  let url = `http://www.omdbapi.com/?t=${searchTitle}&y=&plot=short&r=json`

  needle.get(url, (error, response, result) => {
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
      let type = result.Type === 'series' ? ':tv:' : ':movie_camera:'
      // TODO: fetch server users avg rating
      let message = { message: `${type} ${title} :date: ${year} :star: ${rating}\n<${url}>`, file: result.Poster }

      callback(null, message)
    }
  })
}
