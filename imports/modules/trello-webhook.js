import { Meteor } from 'meteor/meteor'
import _ from 'lodash'
import needle from 'needle'

let url = 'https://api.trello.com/1/'
let key = Meteor.settings.trello.api_key
let token = Meteor.settings.trello.token
let boardId = Meteor.settings.trello.boardId

// verify request
function verifyRequest (req) {
  let trelloIps = ['107.23.104.115', '107.23.149.70', '54.152.166.250', '54.164.77.56']
  let reqIp = req.connection.remoteAddress
  if ((req.method === 'POST') && (_.includes(trelloIps, reqIp))) {
    return true
  }
  return false
}

// register new webhook
function registerWebHook () {
  return true
}

// check if webHookId is still active
const isWebHookActive = (callback) => {
  needle.request('get', `${url}tokens/${token}/webhooks`, { key: key, token: token }, (error, response, body) => {
    if (error) return callback(response)
    else if (response.statusCode !== 200) return callback(response.statusCode)
    return callback(null, body)
  })
}

// handle card actions
function cardHandler (data) {
  let msg
  switch (data.action) {
    default:
      msg = ''
  }

  return msg
}

// handler for webhook post requests
export const trelloHandler = (req, callback) => {
  if (verifyRequest(req)) {
    let msg = cardHandler(req.body)
    return callback(null, msg)
  }
  return callback('unauthorized request')
}

// startup initializer, check if webhook is still active, otherwise register a new one
export const trelloStartup = (callback) => {
  isWebHookActive((error, response) => {
    if (error) return callback(error)
    return callback(null, response)
  })
}
