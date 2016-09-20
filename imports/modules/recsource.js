import { Meteor } from 'meteor/meteor'
import needle from 'needle'

const postRec = (data, callback) => {
  let url = 'http://www.recsource.tv/api/replay/'
  needle.post(url, data, (error, response) => {
    if (error) return callback(error)
    else if (response.statusCode !== 201) {
      return callback(response.statusCode)
    } else {
      return callback(null, response.headers.location)
    }
  })
}

export const recSourceHandler = (msg, nick, callback) => {
  let data = { apikey: Meteor.settings.recsource.api_key, url: null, filename: null,
              kuski: nick, description: `<${nick}> ${msg.content}`, tags: 'autoupload, discord', public: 0 }

  // first check if attachment is a rec
  if ((msg.attachments.length > 0) && (msg.attachments[0].filename.endsWith('.rec'))) {
    data.url = msg.attachments[0].url
    data.filename = msg.attachments[0].filename
  } else { // else check if msg contains url to a rec
    let regex = /(https?:\/\/.+\..+\/(.+\.rec))/i
    let result = regex.exec(msg.content)
    if (result) {
      data.url = result[1]
      data.filename = result[2]
    }
  }

  if (data.url) {
    postRec(data, (error, result) => {
      if (error) return callback(error)
      else return callback(null, result)
    })
  }
}
