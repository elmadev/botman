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
    'imdb.import' (user) {
      check(user, String)

      let fut = new Future()

      // get users url
      Meteor.call('users.get', user, 'imdb', (error, response) => {
        if (error) {
          fut.throw(new Meteor.Error(500, error))
        } else {
          // temporary regex thing TODO: remove when user.set has validation
          let regex = /.*http:\/\/www\.imdb\.com\/user\/(ur\d{7})\/ratings.*/i
          let result = response.match(regex);
          if (!result) {
            fut.throw(new Meteor.Error(500, `${response} is not a valid IMDb rating URL`))
          } else {
            let url = `http://www.imdb.com/list/export?list_id=ratings&author_id=${result[1]}`

            // fetch rating list
            needle.get(url, (error, response, result) => {
              if (error) {
                fut.throw(new Meteor.Error(500, error))
              } else if (response.statusCode !== 200) {
                console.log(response)
                fut.throw(new Meteor.Error(500, 'Statuscode ' + response.statusCode))
              } else {
                fut['return'](result)
              }
            })

            // TODO: parse list into array (?)

            // TODO: check if rating date newer if title already exist in rating db

            // TODO: put into db or update old title ratings

            // TODO: msg total ratings imported, and updated ratings added
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
