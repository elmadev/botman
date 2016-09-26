import { Meteor } from 'meteor/meteor'
import moment from 'moment'
import needle from 'needle'

const postRec = (data, callback) => {
  let url = 'http://www.recsource.tv/api/replay/'
  needle.post(url, data, (error, response, body) => {
    if (error) return callback(error)
    else if (response.statusCode !== 201) {
      return callback(`${response.statusCode}: ${body}`)
    } else {
      body = JSON.parse(body)
      let result = `<http://www.recsource.tv/r/${body.id}> ${body.filename}.rec (${moment.utc(body.length * 10).format('mm:ss,SS')}) in ${body.levelname}.lev`
      return callback(null, result)
    }
  })
}

export const recSourceHandler = (msg, nick, callback) => {
  let data = {
    apikey: Meteor.settings.recsource.api_key,
    url: null,
    filename: null,
    kuski: nick,
    description: `<${nick}> ${msg.content}`,
    tags: 'autoupload, discord',
    public: 1
  }

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
