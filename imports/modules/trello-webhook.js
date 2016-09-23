import { Meteor } from 'meteor/meteor'
import needle from 'needle'

let url = 'https://api.trello.com/1/'
let key = Meteor.settings.trello.api_key
let token = Meteor.settings.trello.token
let boardId = Meteor.settings.trello.boardId

// verify trello signing to avoid fake data
function verifySign (data) {
  return true
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
export const trelloHandler = (data, callback) => {
  if (verifySign(data)) {
    let msg = cardHandler()
    return callback(null, msg)
  }

  return callback('Received unauthorized trello webhook')
}

// startup initializer, check if webhook is still active, otherwise register a new one
export const trelloStartup = (callback) => {
  isWebHookActive((error, response) => {
    if (error) return callback(error)
    return callback(null, response)
  })
}
