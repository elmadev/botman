import { getUserField } from '../../../../api/users/server/get-user-field.js'
import { setUserField } from '../../../../api/users/server/set-user-field.js'
import _ from 'lodash'

let req

export const setUserProfileSettings = (request) => {
    req = request
    setUserField(req.msg.author.id, req.args[0], _.drop(req.args), (error, response) => {
        if (error) {
            console.error(error)
            req.bot.reply(req.msg, `Error: ${error}`)
        } else {
            req.bot.reply(req.msg, 'Setting set!')
        }
    })
}

export const getUserProfileSettings = (request) => {
    req = request
    let getId = (server, nickname) => { //TODO: refactor: can maybe put inside request.js ? wtf is nickname, get id? id of what?
        let id
        _.forEach(server.members, (value) => {
            let nick = server.detailsOf(value.id).nick
            if (nick === nickname) {
                id = value.id
            }
        })
        return id || '404'
    }

    getUserField(req.args[1] ? getId(req.msg.server, args[1]) : req.msg.author.id, req.args[0], (error, response) => {
        if (error) {
            console.error(error)
            req.bot.reply(req.msg, `Error: ${error}`)
        } else {
            req.bot.reply(req.msg, `${response}`)
        }
    })
}