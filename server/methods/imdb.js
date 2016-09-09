import needle from 'needle'

export default function () {
  Meteor.methods({
    // !imdb search
    'imdb.search' (searchTitle) {
      check(searchTitle, String)
      let url = `http://www.omdbapi.com/?t=${searchTitle}&y=&plot=short&r=json`
      let fut = new Future();

      needle.get(url, (error, response, result) => {
        if (error) {
          fut.throw(new Meteor.Error(500, error))
        }
        else if (response.statusCode !== 200) {
          fut.throw(new Meteor.Error(500, 'Statuscode ' + response.statusCode))
        }
        else if (result.Response === 'False') {
          fut.throw(new Meteor.Error(500, 'No search results'))
        }
        else {
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
    'imdb.import' (things) {
    // TODO: get users url
    // TODO: fetch rating list if set and valid imdb export url, msg if missing field
    // TODO: send msg to wait ur horsie
    // TODO: parse list into array (?)
    // TODO: check if rating date newer if title already exist in rating db
    // TODO: put into db or update old title ratings
    // TODO: edit prev msg to output total ratings, and updated ratings added
    },

    // rating lists, optionally by year or genre
    'imdb.toplist' (optionssomething) {
      // TODO: parse input for year or genre argument(s)
      // TODO: list top x movies by rating
      // TODO: limit list to movies with x amount of votes
    }
  })
}
