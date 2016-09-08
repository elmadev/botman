import needle from 'needle'

export default function () {
  Meteor.methods({
    'imdb.search' (searchTitle) {
      check(searchTitle, String)
      let url = 'http://www.omdbapi.com/?t=' + searchTitle + '&y=&plot=short&r=json'

      // return new Promise((resolve, reject) => {
      //   needle.request('get', url, (error, res, movies) => {
      //     if (error) {
      //       reject(error)
      //     }
      //
      //     if (res.statusCode !== 200) {
      //       reject('Statuscode ' + res.statusCode)
      //     }
      //
      //     if (movies.Response === 'False') {
      //       reject('No search results')
      //     }
      //     resolve(movies)
      //   })
      // })


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
          // return first title in result list
          fut['return'](result)
        }
      })

      return fut.wait()
    }
  })
}
