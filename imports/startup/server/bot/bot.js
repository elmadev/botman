import { Meteor } from 'meteor/meteor'
import Discord from 'discord.js'
import _ from 'lodash'
import LastfmAPI from 'lastfmapi'
import Responses from './responses'
import Loggables from './loggables'
import OtherGames from './othergames'
import { allowedProfileFields, loggableItemsWithAliases, loggingStatsCommands, gameNotifiers } from './settings'
import { Picker } from 'meteor/meteorhacks:picker'
import createHandler from 'github-webhook-handler'
import Battle from './battle'

// Functions
import { getGamers } from '../../../api/users/server/get-gamers.js'
import { getUserField } from '../../../api/users/server/get-user-field.js'
import { registerUser } from '../../../api/users/server/register-user.js'
import { setUserField } from '../../../api/users/server/set-user-field.js'
import { getLogsStats } from '../../../api/logs/server/get-logs-stats.js'
import { registerLogs } from '../../../api/logs/server/register-logs.js'
import { registerChatlog } from '../../../api/chatlog/server/register-chatlog.js'
import { imdbSearch } from '../../../api/imdb/server/imdb-search.js'
import { imdbUpdate } from '../../../api/imdb/server/imdb-update.js'
import { imdbTop } from '../../../api/imdb/server/imdb-top.js'
import { recSourceHandler } from '../../../modules/recsource.js'


export default function () {
  let bot = new Discord.Client()
  let settings = Meteor.settings.discord
  let prefix = settings.prefix

  let lfm = new LastfmAPI({
    'api_key': Meteor.settings.lastfm.api_key,
    'secret': Meteor.settings.lastfm.secret
  })

  // Github webhook
  let handler = createHandler({ path: '/webhook-github', secret: Meteor.settings.github.secret })
  let githubChannel = Meteor.settings.github.channelId

  handler.on('error', function (err) {
    console.error('Error:', err.message)
  })

  handler.on('push', function (event) {
    console.log('GitHub Push event payload:', event.payload)
    let name = event.payload.pusher.name
    let branch = event.payload.ref.substring(11)
    let repo = event.payload.repository.full_name
    let msg = event.payload.head_commit.message
    let compare = event.payload.compare
    bot.sendMessage(githubChannel, `**${name}** pushed a commit to \`${branch}\` in **${repo}**: *"${msg}"*. <${compare}>`)
  })

  Picker.route('/webhook-github', function (params, req, res, next) {
    handler(req, res, function (err) {
      if (err) {}
      res.statusCode = 404
      res.end('no such location')
    })
  })

  // Internal utility functions
  let getId = (server, nickname) => {
    let id
    _.forEach(server.members, (value) => {
      let nick = server.detailsOf(value.id).nick
      if (nick === nickname) {
        id = value.id
      }
    })
    return id || '404'
  }

  let getNick = (server, discordId) => {
    let user = bot.users.get(discordId)
    return server.detailsOf(user).nick || (user ? user.username : 'Deleted User')
  }

  let getMention = (discordId) => {
    return bot.users.get(discordId).mention()
  }

  bot.on('ready', () => {
    console.log(`Ready in ${bot.channels.length} channels on ${bot.servers.length} servers, for a total of ${bot.users.length} users.`)
  })

  bot.on('serverNewMember', Meteor.bindEnvironment((server, user) => {
    console.log(`New User "${user.username}" (id: ${user.id}) has joined "${server.name}"`)
    bot.sendMessage(server.defaultChannel, `**${getNick(server, user.id)}** has joined! Welcome :heart:`)
    registerUser(user.id, (error, response) => {
      if (error) {
        console.error(`Error: ${error.reason}`)
      } else {
        console.log(`Registered User "${user.username}" (_id: ${response})`)
      }
    })
  }))

  bot.on('serverMemberRemoved', (server, user) => {
    console.log(`User "${user.username}" (id: ${user.id}) has left "${server.name}"`)
    bot.sendMessage(server.defaultChannel, `**${getNick(server, user.id)}** has quitted! What a n00b! :laughing:`)
  })

  // Process messages
  bot.on('message', Meteor.bindEnvironment(msg => {
    // Exit if msg is from a bot
    if (msg.author.bot) return

    // Msg parsing for recsource upload
    recSourceHandler(msg, getNick(msg.server, msg.author.id), (error, result) => {
      if (error) {
        console.error(error)
        bot.reply(msg, error)
      } else {
        bot.sendMessage(msg, result)
      }
    })

    // Exit if msg doesn't start with prefix
    if (!msg.content.startsWith(prefix)) {
      registerChatlog(msg.channel.name, getNick(msg.server, msg.author.id), msg.content, msg.timestamp) // Save in chat log
      return
    }

    // Split arguments
    let args = msg.content.split(' ')
    let command = args[0].substring(1).toLowerCase() // Command without prefix
    args = _.drop(args)

    // Simple response cases
    if (Responses[command]) {
      if (typeof Responses[command] === 'string') {
        bot.sendMessage(msg, Responses[command])
      } else if (typeof Responses[command] === 'function') {
        bot.sendMessage(msg, `${Responses[command](args)}`)
      }
      return
    }

    let nick = getNick(msg.server, msg.author.id)

    // Logging
    if (loggableItemsWithAliases.indexOf(command) > -1 || (command === 'log' && args[0])) {
      let itemName = command === 'log' ? args[0] : command
      let loggableIndex = _.findIndex(Loggables, (o) => {
        return o.item === itemName || o.aliases.indexOf(itemName) > -1
      })
      let item = loggableIndex > -1 ? Loggables[loggableIndex] : {
        item: itemName, singular: itemName, plural: itemName
      }

      registerLogs(msg.author.id, item.item, (error, response) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.sendMessage(msg, `${item.singular} #${response.today} todey for ${nick} loged (${response.total} ${item.plural} total for him)`)
        }
      })

    // Profile registration command for those who joined server before bot started autoregistering people
    } else if (command === 'register' || command === 'reg') {
      registerUser(msg.author.id, (error, response) => {
        if (error) {
          console.error(`Error: ${error}`)
          bot.reply(msg, `Error: ${error}`)
        } else {
          bot.reply(msg, 'Registered successfully!')
        }
      })

    // Set a user profile setting
    } else if (command === 'set' && allowedProfileFields.indexOf(args[0]) > -1 && args[1]) {
      setUserField(msg.author.id, args[0], _.drop(args), (error, response) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error}`)
        } else {
          bot.reply(msg, 'Setting set!')
        }
      })

    // Get a user profile setting
    } else if (command === 'get' && allowedProfileFields.indexOf(args[0]) > -1) {
      getUserField(args[1] ? getId(msg.server, args[1]) : msg.author.id, args[0], (error, response) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error}`)
        } else {
          bot.reply(msg, `${response}`)
        }
      })

    // Request last played song from Last.fm
    } else if (command === 'lastfm' || command === 'lfm') {
      if (args[0]) { // Someone other than the user itself
        let params = {
          limit: 1,
          user: args[0]
        }
        lfm.user.getRecentTracks(params, (error, recentTracks) => {
          if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error.reason || error.message}`)
          } else {
            let np = recentTracks.track[0]
            bot.sendMessage(msg, `**${args[0]}** np: *${np.artist['#text']}* - *${np.name}* :notes:`)
          }
        })
      } else {
        getUserField(msg.author.id, 'lastfm', (error, response) => {
          if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error}`)
          } else {
            // Proceed to query Last.fm API
            let params = {
              limit: 1,
              user: response
            }
            lfm.user.getRecentTracks(params, (error, recentTracks) => {
              if (error) {
                console.error(error)
                bot.reply(msg, `Error: ${error.reason || error.message}`)
              } else {
                let np = recentTracks.track[0]
                bot.reply(msg, `np: *${np.artist['#text']}* - *${np.name}* :notes:`)
              }
            })
          }
        })
      }

    // Display logging totals stats
    } else if (!_.isEmpty(_.pick(loggingStatsCommands, command)) && args[0]) {
      let when = _.pick(loggingStatsCommands, command)[command]
      let itemName = args[0]

      if (loggableItemsWithAliases.indexOf(args[0]) > -1 || (command === 'log' && args[0])) {
        let loggableIndex = _.findIndex(Loggables, (o) => {
          return o.item === itemName || o.aliases.indexOf(itemName) > -1
        })
        if (loggableIndex > -1) itemName = Loggables[loggableIndex].item
      }

      getLogsStats(itemName, when, (error, response) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          let topMsg = response.top.reduce((prev, current, index) => {
            console.log('current', current.discordId)
            return `${prev}**${index + 1}.** ${getNick(msg.server, current.discordId)}[${current.logs}] `
          }, '')
          bot.sendMessage(msg, `**Top loggers of ${args[0]} ${when === 'day' ? command : 'this ' + command}:**\n${topMsg} **Total:** ${response.total}`)
        }
      })

    // Display gaming notifications
    } else if (gameNotifiers.indexOf(command) > -1) {
      let gameName = command
      let gameIndex = _.findIndex(OtherGames, (o) => {
        return o.item === gameName || o.aliases.indexOf(gameName) > -1
      })
      if (gameIndex > -1) gameName = OtherGames[gameIndex].command

      getGamers(gameName, (error, response) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          let mentions = response.reduce((prev, current, index) => {
            return `${prev}${getMention(current)} `
          }, '')
          bot.sendMessage(msg, `Someone said ${command} ${mentions}`)
        }
      })

    // IMDb search
    } else if (command === 'imdb') {
      if (args[0]) {
        let searchTitle = args.join(' ')
        imdbSearch(searchTitle, (error, response) => {
          if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error}`)
          } else {
            bot.sendMessage(msg, response.message, response.file ? { file: response.file } : {})
          }
        })
      } else {
        bot.reply(msg, 'Usage: !imdb <title to search>')
      }

    // IMDb ratings import
    } else if (command === 'imdbupdate') {
      // tell mans to calm down, delete message after 10s
      bot.sendMessage(msg, 'Updating, hold your :horse:, may take up to a minute', (error, updateMsg) => {
        if (error) {}
        setTimeout(() => {
          bot.deleteMessage(updateMsg)
        }, 10000)
      })

      imdbUpdate(msg.author.id, (error, response) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error}`)
        } else {
          bot.reply(msg, `Updated ${response.updated} ratings, ${response.total} total ratings`)
        }
      })

    // IMDb top lists
    } else if (command === 'imdbtop') {
      imdbTop(args[0] ? args[0] : null, 10, (error, response) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error}`)
        } else {
          bot.sendMessage(msg, response)
        }
      })

    // Search and replace
    } else if (command.startsWith('s/')) {
      // wip
    }
  }))

  // EOL Battle integration
  let battleChannel = Meteor.settings.eol.channelId
  setInterval(() => {
    Battle.checkQueue(ret => {
      if (ret.type === 2) {
        bot.sendMessage(battleChannel, ret.message)
      } else if (ret.type === 1) {
        Battle.getResults(ret.message, (ret) => {
          if (ret !== -1) {
            bot.sendMessage(battleChannel, ret)
          }
        })
      }
    })
  }, 20 * 1000)

  // Handle errors and stuff
  bot.on('error', e => {
    console.error(e)
  })

  bot.on('warn', e => {
    console.warn(e)
  })

  bot.on('debug', e => {
    console.info(e)
  })

  // Login with bot token
  bot.loginWithToken('Bot ' + settings.token)
}
