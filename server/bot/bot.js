import {Meteor} from 'meteor/meteor'
import Discord from 'discord.js'
import _ from 'lodash'
import LastfmAPI from 'lastfmapi'

const isDevelopment = Meteor.settings.isDevelopment
const isProduction = Meteor.settings.isProduction

export default function () {
  let bot = new Discord.Client()
  let settings = Meteor.settings.discord
  let prefix = settings.prefix

  // Last.fm API instance
  let lfm = new LastfmAPI({
    'api_key': Meteor.settings.lastfm.api_key,
    'secret': Meteor.settings.lastfm.secret
  })

  // Stuff to do when bot is ready
  bot.on('ready', () => {
    console.log(`Ready in ${bot.channels.length} channels on ${bot.servers.length} servers, for a total of ${bot.users.length} users.`)
  })

  // Stuff to do when someone new joins the server
  bot.on('serverNewMember', Meteor.bindEnvironment((server, user) => {
    console.log(`New User "${user.username}" has joined "${server.name}"`)
    if (isProduction) {
      bot.sendMessage(server.defaultChannel, `**${user.username}** has joined! Welcome :heart:`)
      Meteor.call('users.register', user, (error, data) => {
        if (error) {
          console.error(`Error: ${error.reason}`)
        } else {
          console.log(`Registered User "${user.username}" (_id: ${data})`)
        }
      })
    }
  }))

  // Stuff to do when someone leaves the server
  bot.on('serverMemberRemoved', (server, user) => {
    console.log(`User "${user.username}" has left "${server.name}"`)
    if (isProduction) {
      bot.sendMessage(server.defaultChannel, `**${user.username}** has quitted! What a n00b! :laughing:`)
    }
  })

  let loggables = ['bear', 'cofe', 'wine', 'vater', 'tea']

  // Define simple response cases and prefix them
  let simpleResponses = _.mapKeys({
    'draw': 'http://isocyanide.xyz/draw',
    'github': 'https://github.com/nodepowered/botman',
    'loggables': loggables.join(', ')
  }, (value, key) => {
    return prefix + key
  })

  let functionResponses = {
    'draw': function (arg) {
      return 'http://isocyanide.xyz/draw/' + arg
    }
  }

  // Process messages
  bot.on('message', Meteor.bindEnvironment((msg) => {
    // Exit if msg is from a bot
    if (msg.author.bot) return

    // Exit if msg doesn't start with prefix
    if (!msg.content.startsWith(prefix)) return

    // -----------------------------------------------------------------------------------------
    // Local testing functions (not deployed to production)
    if (isDevelopment) {
      // let args = msg.content.split(' ')
      // let command = args[0].substring(1) // Command without prefix

      // New functions go here first for local testing

      return
    }
    // !!! Only tested, production ready functions beyond this point !!!
    // -----------------------------------------------------------------------------------------

    // Check if it's a case of a simple response
    if (simpleResponses[msg.content]) {
      bot.sendMessage(msg, simpleResponses[msg.content])
      return
    }

    // Split arguments
    let args = msg.content.split(' ')
    let command = args[0].substring(1) // Command without prefix

    // Is this a case of a function response?
    if (functionResponses[command]) {
      bot.sendMessage(msg, functionResponses[command](args[1]))
      return
    }

    // Process logging shorthands
    if (command === 'bear' || command === 'beer') {
      Meteor.call('logs.register', msg.author.name, 'bear', (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.sendMessage(msg, `:beer: #${data.today} todey for ${msg.author.mention()} putted (${data.total} :beers: total for him)`)
        }
      })
    } else if (command === 'cofe' || command === 'coffee' || command === 'gofe') {
      Meteor.call('logs.register', msg.author.name, 'cofe', (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.reply(msg, `:coffee: #${data.today} registered (${data.total} total :coffee: for him)`)
        }
      })
    } else if (command === 'water' || command === 'vater') {
      Meteor.call('logs.register', msg.author.name, 'water', (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.reply(msg, `:potable_water: #${data.today} registered (${data.total} total :potable_water: for him)`)
        }
      })
    } else if (command === 'wine') {
      Meteor.call('logs.register', msg.author.name, 'wine', (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.reply(msg, `:wine_glass: #${data.today} registered (${data.total} total :wine_glass: for him)`)
        }
      })
    } else if (command === 'tea') {
      Meteor.call('logs.register', msg.author.name, 'tea', (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.reply(msg, `:tea: #${data.today} registered (${data.total} total :tea: for him)`)
        }
      })
    } else if (command === 'log' && args[1]) { // Are we logging something else?
      let item = args[1]
      if (loggables.indexOf(item) === -1) {
        bot.reply(msg, `Sorry, item not recognized.`)
        return
      }
      Meteor.call('logs.register', msg.author.name, args[1], (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.reply(msg, `${args[1]} #${data.today} registered (${data.total} total ${args[1]} for him)`)
        }
      })
    } else if (command === 'register') { // Register command for those who joined server before bot started registering people
      Meteor.call('users.register', msg.author.name, (error, data) => {
        if (error) {
          console.error(`Error: ${error.reason}`)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          console.log(`Registered User "${msg.author.name}" (_id: ${data})`)
          bot.reply(msg, 'Registered successfully!')
        }
      })
    } else if (command === 'set' && args[1] === 'lastfm' && args[2]) { // Setting lastfm username
      Meteor.call('users.set', msg.author.name, 'lastfm', args[2], (error, data) => {
        if (error) {
          console.error(error)
          bot.reply(msg, `Error: ${error.reason}`)
        } else {
          bot.reply(msg, 'Last.fm username set!')
        }
      })
    } else if (command === 'lastfm' || command === 'lfm') { // Request last played song from Last.fm
      if (args[1]) {
        let params = {
          limit: 1,
          user: args[1]
        }
        lfm.user.getRecentTracks(params, (error, recentTracks) => {
          if (error) {
            console.error(error)
            bot.reply(msg, `Error: ${error.reason}`)
          } else {
            let np = recentTracks.track[0]
            bot.reply(msg, `**${args[1]}** np: *${np.artist['#text']}* - *${np.name}* :notes:`)
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
