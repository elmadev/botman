import { Meteor } from 'meteor/meteor'
import crypto from 'crypto'
import needle from 'needle'

let url = 'https://api.trello.com/1/'
let key = Meteor.settings.trello.api_key
let token = Meteor.settings.trello.token
let secret = Meteor.settings.trello.secret
let boardId = Meteor.settings.trello.boardId
let callbackUrl = `${Meteor.absoluteUrl()}webhook-trello/`

// verify request
function verifyRequest (request, secret, callbackUrl) {
  if (request.body && request.headers['x-trello-webhook']) {
    let base64Digest = function (s) { return crypto.createHmac('sha1', secret).update(s).digest('base64') }
    let content = request.body + callbackUrl
    let doubleHash = base64Digest(base64Digest(content))
    let headerHash = base64Digest(request.headers['x-trello-webhook'])
    return doubleHash === headerHash
  }
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
  if (data && data.action) {
    let userName = data.action.memberCreator.fullName
    let cardName = data.action.data.card ? data.action.data.card.name : undefined
    let listName = data.action.data.list ? data.action.data.list.name : undefined
    let shortUrl = data.model.shortUrl
    switch (data.action.type) {
      case 'createCard':
        msg = `**${userName}** created a new card \`${cardName}\` on the list \`${listName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'updateCard':
        if (typeof data.action.data.old.name !== 'undefined') { // rename
          msg = `**${userName}** renamed card \`${data.action.data.old.name}\` → \`${cardName}\` on the list \`${listName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        } else if (typeof data.action.data.old.desc !== 'undefined') { // edit/add description
          msg = `**${userName}** updated description for card \`${cardName}\` on the list \`${listName}\`: :notepad_spiral: *"${data.action.data.card.desc}"* <https://trello.com/c/${data.action.data.card.shortLink}>`
        } else if (data.action.data.old.idList) {
          msg = `**${userName}** moved card \`${cardName}\` from list \`${data.action.data.listBefore.name}\` → \`${data.action.data.listAfter.name}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        }
        break
      case 'addAttachmentToCard':
        msg = `**${userName}** added attachment to card \`${cardName}\` :link: ${data.action.data.attachment.url}\n<https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'commentCard':
        msg = `**${userName}** commented on card \`${cardName}\`: :speech_left: *"${data.action.data.text}"* <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'createList':
        msg = `**${userName}** created new list \`${listName}\` <${shortUrl}>`
        break
      case 'addMemberToCard':
        msg = `**${userName}** added *${data.action.member.fullName}* to card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'removeMemberFromCard':
        msg = `**${userName}** removed *${data.action.member.fullName}* from card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'addChecklistToCard':
        msg = `**${userName}** :ballot_box_with_check: added checklist \`${data.action.data.checklist.name}\` to card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'removeChecklistFromCard':
        msg = `**${userName}** :red_circle: removed checklist \`${data.action.data.checklist.name}\` from card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'createCheckItem':
        msg = `**${userName}** :white_large_square: added checklist item \`${data.action.data.checkItem.name}\` to card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'deleteCheckItem':
        msg = `**${userName}** :black_large_square: removed checklist item \`${data.action.data.checkItem.name}\` from card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        break
      case 'updateCheckItemStateOnCard':
        if (data.action.data.checkItem.state === 'complete') {
          msg = `**${userName}** :white_check_mark: completed task \`${data.action.data.checkItem.name}\` on card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        } else if (data.action.data.checkItem.state === 'incomplete') {
          msg = `**${userName}** :x: marked task \`${data.action.data.checkItem.name}\` as incomplete on card \`${cardName}\` <https://trello.com/c/${data.action.data.card.shortLink}>`
        }
        break
      case 'updateList': // can be renamed or deleted (archived) (?)
        if (data.action.data.old.name) { // renamed
          msg = `**${userName}** renamed list \`${data.action.data.old.name}\` → \`${data.action.data.list.name}\` <${shortUrl}>`
        }
        break
      case 'addLabelToCard':
      case 'removeLabelFromCard':
      case 'deleteAttachmentFromCard':
      case 'copyCard':
        break
      default:
        console.log('Trello: unhandled event ' + data.action.type)
        break
    }
  }

  return msg
}

// handler for webhook post requests
export const trelloHandler = (req, callback) => {
  if (req.method === 'HEAD') return callback(null, 'hook')
  else if (req.method === 'POST') {
    if (verifyRequest(req, secret, callbackUrl)) {
      let data = JSON.parse(req.body)
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
