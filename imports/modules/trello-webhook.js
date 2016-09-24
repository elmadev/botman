import { Meteor } from 'meteor/meteor'
import _ from 'lodash'
import needle from 'needle'

let url = 'https://api.trello.com/1/'
let key = Meteor.settings.trello.api_key
let token = Meteor.settings.trello.token
let boardId = Meteor.settings.trello.boardId
let callbackUrl = `${Meteor.absoluteUrl()}webhook-trello/${Meteor.settings.trello.routeId}/`

// verify request
function verifyRequest (req) {
  let trelloIps = ['107.23.104.115', '107.23.149.70', '54.152.166.250', '54.164.77.56']
  let reqIp = req.headers['x-forwarded-for'].split(',')[0]
  if (_.includes(trelloIps, reqIp)) return true
  return false
}

// register new webhook
const registerWebHook = callback => {
  let params = { key: key, token: token, callbackURL: callbackUrl, idModel: boardId }
  needle.request('put', `${url}/webhooks`, params, (error, response, body) => {
    if (error) return callback(error)
    else if (response.statusCode !== 200) return callback(`${response.statusCode}: ${body}`)
    return callback(null, callbackUrl)
  })
}

// handle card actions
function actionHandler (data) {
  let msg
  data = JSON.parse(data)
  if (data && data.action) {
    let name = data.action.memberCreator.fullName
    switch (data.action.type) {
      case 'createCard':
        msg = `${name} created a new card \`${data.action.data.card.name}\` on the list \`${data.action.data.list.name}\`\n<https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'updateCard':
        if (data.action.data.old.name) { // rename
          msg = `${name} renamed card \`${data.action.data.old.name}\` → \`${data.action.data.card.name}\` on the list \`${data.action.data.list.name}\`\n<https://trello.com/c/${data.action.data.card.shortLink}>`
        } else if (data.action.data.old.desc) { // edit/add description
          msg = `${name} updated description for card \`${data.action.data.card.name}\` on the list \`${data.action.data.list.name}\`\n\`\`\`${data.action.data.card.desc}\`\`\`\n<https://trello.com/c/${data.action.data.card.shortLink}>`
        }
        break
      case 'addLabelToCard':
        break
      default:
        msg = data.action.type
        break
    }
  }

  return msg
}

// handler for webhook post requests
export const trelloHandler = (req, data, callback) => {
  if (verifyRequest(req)) {
    if (req.method === 'HEAD') return callback(null, 'hook')
    else if (req.method === 'POST') {
      let msg = actionHandler(data)
      return callback(null, msg)
    }
  }
  return callback('unauthorized request from ' + req.headers['x-forwarded-for'].split(',')[0])
}

// startup initializer
export const trelloStartup = (callback) => {
  // Instead of checking for active webhooks, just always register one at startup.
  // Less effort and complexity. If callbackurl already exists, a new one is not added and no damage done.
  registerWebHook((error, result) => {
    if (error) return callback(error)
    return callback(null, `webhook active at ${result}`)
  })
}
