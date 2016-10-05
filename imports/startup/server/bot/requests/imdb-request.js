import { imdbSearch } from '../../../../api/imdb/server/imdb-search.js'
import { imdbUpdate } from '../../../../api/imdb/server/imdb-update.js'
import { imdbTop } from '../../../../api/imdb/server/imdb-top.js'

let req

export const handleImdbSearch = (request) => {
    req = request
    if (req.args[0]) {
        let searchTitle = req.args.join(' ')
        imdbSearch(searchTitle, (error, response) => {
            if (error) {
                console.error(error)
                req.bot.reply(req.msg, `Error: ${error}`)
            } else {
                req.bot.sendMessage(req.msg, response.message, response.file ? { file: response.file } : {})
            }
        })
    } else {
        req.bot.reply(req.msg, 'Usage: !imdb <title to search>')
    }
}

export const handleImdbRatingsUpdate = (request) => {
    req = request
    // tell mans to calm down, delete message after 10s
    req.bot.sendMessage(req.msg, 'Updating, hold your :horse:, may take up to a minute', (error, updateMsg) => {
        if (error) { }
        setTimeout(() => {
            req.bot.deleteMessage(updateMsg)
        }, 10000)
    })

    imdbUpdate(req.msg.author.id, (error, response) => {
        if (error) {
            console.error(error)
            req.bot.reply(req.msg, `Error: ${error}`)
        } else {
            req.bot.reply(req.msg, `Updated ${response.updated} ratings, ${response.total} total ratings`)
        }
    })
}

export const handleImdbTopList = (request) => {
    req = request
    imdbTop(req.args, 15, (error, response) => {
        if (error) {
            console.error(error)
            req.bot.reply(req.msg, `Error: ${error}`)
        } else {
            req.bot.sendMessage(req.msg, response)
        }
    })
}