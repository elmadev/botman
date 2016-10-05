import { getUserField } from '../../../../api/users/server/get-user-field.js'
import LastfmAPI from 'lastfmapi'

let req

export const lastPlayedFMSong = (request) => {
    req = request
    let lfm = new LastfmAPI({
        'api_key': Meteor.settings.lastfm.api_key,
        'secret': Meteor.settings.lastfm.secret
    })

    if (req.args[0]) { // Someone other than the user itself
        let params = {
            limit: 1,
            user: req.args[0]
        }

        lfm.user.getRecentTracks(params, (error, recentTracks) => {
            if (error) {
                console.error(error)
                req.bot.reply(req.msg, `Error: ${error.reason || error.message}`)
            } else {
                let np = recentTracks.track[0]
                req.bot.sendMessage(req.msg, `**${req.args[0]}** np: *${np.artist['#text']}* - *${np.name}* :notes:`)
            }
        })
    } else {
        getUserField(req.msg.author.id, 'lastfm', (error, response) => {
            if (error) {
                console.error(error)
                req.bot.reply(req.msg, `Error: ${error}`)
            } else {
                // Proceed to query Last.fm API
                let params = {
                    limit: 1,
                    user: response
                }
                lfm.user.getRecentTracks(params, (error, recentTracks) => {
                    if (error) {
                        console.error(error)
                        req.bot.reply(req.msg, `Error: ${error.reason || error.message}`)
                    } else {
                        let np = recentTracks.track[0]
                        req.bot.reply(req.msg, `np: *${np.artist['#text']}* - *${np.name}* :notes:`)
                    }
                })
            }
        })
    }
}