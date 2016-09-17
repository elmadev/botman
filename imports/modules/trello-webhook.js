import needle from 'needle'

// verify trello signing to avoid fake data
function verifySign (data) {
  return true
}

// register new webhook
function registerWebHook (apiKey, userToken) {
  return true
}

// check if webHookId is still active
function isWebHookActive (webHookId) {
  return true
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

// startup initializer, check if webHookId is still active, otherwise register a new one
export const trelloStartup = (webHookId, callback) => {
  if (!isWebHookActive(webHookId)) {
    if (registerWebHook) {
      return callback(null)
    } else {
      return callback('Couldn\'t register trello webhook')
    }
  }
  return callback(null)
}
