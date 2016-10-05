import { Meteor } from 'meteor/meteor'
import { recSourceHandler } from '../../../../modules/recsource.js'

import { lastPlayedFMSong } from './lastfm-request.js'
import { handleSimpleResponse } from './simple-request.js'
import { displayGamingNotifications } from './gaming-request.js'
import { handleLogging, displayLoggingTotalStats } from './logging-request.js'
import { setUserProfileSettings, getUserProfileSettings } from './user-profile-request.js'
import { handleImdbSearch, handleImdbRatingsUpdate, handleImdbTopList } from './imdb-request.js'

let request

class RequestLogic {
    constructor(req) {
        request = req
    }

    handleRequest() {
        if (request.senderIsBot()) return

        // Msg parsing for recsource upload
        recSourceHandler(request.msg, request.getNick(), (error, result) => {
            if (error) {
                console.error(error)
                request.bot.reply(request.msg, error)
            } else {
                request.bot.sendMessage(request.msg, result)
            }
        })

        if (!request.hasValidPrefix()) return

        if (request.isSimpleReponse()) {
            handleSimpleResponse(request)
        } else if (request.isLogging()) {
            handleLogging(request)
        } else if (request.isRegister()) {
            handleRegister(request)
        } else if (request.isSetUserProfileSettings()) {
            setUserProfileSettings(request)
        } else if (request.isGetUserProfileSettings()) {
            getUserProfileSettings(request)
        } else if (request.lastPlayedFMSong()) {
            lastPlayedFMSong(request)
        } else if (request.isDisplayLoggingTotalStats()) {
            displayLoggingTotalStats(request)
        } else if (request.isDisplayGamingNotifications()) {
            displayGamingNotifications(request)
        } else if (request.isImdbSearch()) {
            handleImdbSearch(request)
        } else if (request.isImdbRatingsUpdate()) {
            handleImdbRatingsUpdate(request)
        } else if (request.isImdbTopList) {
            handleImdbTopList(request)
        } else if (request.command.startsWith('s/')) { // Search and replace
            // wip
        }
    }
}
export { RequestLogic }