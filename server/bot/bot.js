import {Meteor} from 'meteor/meteor'
import Discord from 'discord.js'
import _ from 'lodash'
import LastfmAPI from 'lastfmapi'
import Loggables from './loggables'
import Responses from './responses'

export default function () {
  let bot = new Discord.Client()
  let settings = Meteor.settings.discord
  let prefix = settings.prefix

  let lfm = new LastfmAPI({
    'api_key': Meteor.settings.lastfm.api_key,
    'secret': Meteor.settings.lastfm.secret
  })

  let loggableItemsWithAliases = Loggables.reduce((prev, current) => {
    return _.concat(prev, current.item, current.aliases)
  }, []).sort()

  bot.on('ready', () => {
    console.log(`Ready in ${bot.channels.length} channels on ${bot.servers.length} servers, for a total of ${bot.users.length} users.`)
  })

  bot.on('serverNewMember', Meteor.bindEnvironment((server, user) => {
    console.log(`New User "${user.username}" has joined "${server.name}"`)
    bot.sendMessage(server.defaultChannel, `**${user.username}** has joined! Welcome :heart:`)
    Meteor.call('users.register', user.username, (error, data) => {
      if (error) {
        console.error(`Error: ${error.reason}`)
      } else {
        console.log(`Registered User "${user.username}" (_id: ${data})`)
      }
    })
  }))

  bot.on('serverMemberRemoved', (server, user) => {
    console.log(`User "${user.username}" has left "${server.name}"`)
    bot.sendMessage(server.defaultChannel, `**${user.username}** has quitted! What a n00b! :laughing:`)
  })

  // Process messages
  bot.on('message', Meteor.bindEnvironment((msg) => {
    // Exit if msg is from a bot
    if (msg.author.bot) return

    // Exit if msg doesn't start with prefix
    if (!msg.content.startsWith(prefix)) return

    // Split arguments
    let args = msg.content.split(' ')
    let command = args[0].substring(1) // Command without prefix
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

    // Logging
    if (loggableItemsWithAliases.indexOf(command) > -1 || (command === 'log' && args[0])) {
      let itemName = command === 'log' ? args[0] : command
      let loggableIndex = _.findIndex(Loggables, (o) => {
        return o.item === itemName || o.aliases.indexOf(itemName) > -1
      })
      let item = loggableIndex > -1 ? Loggables[loggableIndex] : {
        item: itemName, singular: itemName, plural: itemName
      }

      Meteor.call('logs.register', msg.author.name, item.item, (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.sendMessage(msg, `${item.singular} #${data.today} todey for ${msg.author.mention()} loged (${data.total} ${item.plural} total for him)`)
        }
      })

    // Profile registration command for those who joined server before bot started registering people
    } else if (command === 'register' || command === 'reg') {
      Meteor.call('users.register', msg.author.name, (error, data) => {
        if (error) {
          console.error(`Error: ${error.reason}`)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          console.log(`Registered User "${msg.author.name}" (_id: ${data})`)
          bot.reply(msg, 'Registered successfully!')
        }
      })

    // Setting lastfm username
    } else if (command === 'set' && args[0] === 'lastfm' && args[1]) {
      Meteor.call('users.set', msg.author.name, 'lastfm', args[1], (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.reply(msg, 'Last.fm username set!')
        }
      })

    // Request last played song from Last.fm
    } else if (command === 'lastfm' || command === 'lfm') {
      if (args[0]) {
        let params = {
          limit: 1,
          user: args[0]
        }
        lfm.user.getRecentTracks(params, (error, recentTracks) => {
          if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error.reason}`)
          } else {
            let np = recentTracks.track[0]
            bot.reply(msg, `**${args[0]}** np: *${np.artist['#text']}* - *${np.name}* :notes:`)
          }
        })
      } else {
        Meteor.call('users.get', msg.author.name, 'lastfm', (error, response) => {
          if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error.reason}`)
          } else {
            // Proceed to query Last.fm API
            let params = {
              limit: 1,
              user: response
            }
            lfm.user.getRecentTracks(params, (error, recentTracks) => {
              if (error) {
                console.error(error)
                bot.reply(msg, `Error: ${error.reason}`)
              } else {
                let np = recentTracks.track[0]
                bot.reply(msg, `np: *${np.artist['#text']}* - *${np.name}* :notes:`)
              }
            })
          }
        })
      }

    // Display logging totals stats
    } else if (command === 'today' || command === 'week' || command === 'month' || command === 'year' && args[0]) {
      Meteor.call('logs.getStats', args[0], command, (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.sendMessage(msg, `**Top loggers of ${args[0]} ${command !== 'today' ? 'this' : ''} ${command}:**\n${data.top}\n*Total:* ${data.total}`)
        }
      })
    }
  }))

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
  bot.loginWithToken(settings.token)
}
