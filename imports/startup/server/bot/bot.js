import { Meteor } from 'meteor/meteor'
import Discord from 'discord.js'
import _ from 'lodash'
import { Picker } from 'meteor/meteorhacks:picker'
import createHandler from 'github-webhook-handler'
import Battle from './battle'
import { Request } from './requests/request.js'
import { RequestLogic } from './requests/request-logic.js'

// Functions
import { registerUser } from '../../../api/users/server/register-user.js'
import { trelloStartup, trelloHandler } from '../../../modules/trello-webhook.js'

export default function () {
  let bot = new Discord.Client()
  let settings = Meteor.settings.discord // TODO: refactor: maybe use this everywhere or kill it

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
      if (err) { }
      res.statusCode = 404
      res.end('no such location')
    })
  })

  // Trello webhook
  let trelloChannel = Meteor.settings.trello.channelId

  Picker.route('/webhook-trello/', (params, req, res, next) => {
    let data = ''
    req.on('error', error => {
      console.error(error)
    }).on('data', chunk => {
      data += chunk
    }).on('end', () => {
      req.body = data
      trelloHandler(req, (error, result) => {
        if (error) {
          console.error('Trello: ' + error)
          res.statusCode = 403
          res.end('unauthorized\n')
        } else if (result === 'hook') {
          // new hook registered, do nothing for now
        } else if (result) bot.sendMessage(trelloChannel, result)
        res.end('ok')
      })
    })
  })

  trelloStartup((error, response) => {
    if (error) console.error('Trello: ' + error)
    else console.log('Trello: ' + response)
  })

  // Internal utility functions
  let getNick = (server, discordId) => {
    let user = bot.users.get(discordId)
    return server.detailsOf(user).nick || (user ? user.username : 'Deleted User')
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
    let request = new Request(msg, bot)
    new RequestLogic(request).handleRequest()
  }))

  // EOL Battle integration
  let battleChannel = Meteor.settings.eol.channelId
  let lastmsg = ''
  setInterval(() => {
    Battle.checkQueue(ret => {
      if (ret.type === 2) {
        bot.sendMessage(battleChannel, ret.message, (err, msg) => {
          if (err) {
            console.log(err)
          } else {
            lastmsg = msg
          }
        })
      } else if (ret.type === 1) {
        bot.updateMessage(lastmsg, ret.edit)
        Battle.getResults(ret.message, (ret) => {
          if (ret !== -1) {
            bot.sendMessage(battleChannel, ret)
          }
        })
      } else if (ret.type === 3) {
        bot.updateMessage(lastmsg, ret.message)
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