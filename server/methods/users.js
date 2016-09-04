import {Users, Logs} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import moment from 'moment'
import {allowedProfileFields} from '../bot/settings'

export default function () {
  Meteor.methods({
    'users.register' (discordId) {
      check(discordId, String)

      if (Users.findOne({ discordId: discordId })) {
        throw new Meteor.Error(500, `You're already registered!`)
      }

      return Users.insert({
        discordId: discordId,
        registeredAt: new Date()
      })
    },

    'users.set' (discordId, field, args) {
      check(discordId, String)
      check(field, String)
      check(args, [String])

      let value = args.join(' ')

      if (!Users.findOne({ discordId: discordId })) {
        Meteor.wrapAsync(Meteor.call('users.register', discordId))
      }

      if (allowedProfileFields.indexOf(field) > -1) {
        let update = { '$set': {} }
        update['$set']['settings.' + field] = value

        Users.update({
          discordId: discordId
        }, update)
      }
    },

    'users.get' (discordId, field) {
      check(discordId, String)
      check(field, String)

      let user = Users.findOne({ discordId: discordId })

      if (!user) {
        throw new Meteor.Error(500, `User isn't registered!`)
      } else if (user['settings'][field]) {
        return user['settings'][field]
      } else {
        throw new Meteor.Error(500, `User hasn't set this profile field!`)
      }
    },

    'users.getStats' (discordId, item, when) {
      check(discordId, String)
      check(item, String)
      check(when, String) // Should be 'day', 'week', 'month', or 'year'

      let date = moment().startOf(when).toDate()

      let count = Logs.find({
        discordId: discordId,
        item: item,
        loggedAt: {$gte: date}
      }).count()

      return count
    },

    'users.getGamers' (game) {
      check(game, String)

      let gamers = []
      Users.find({'settings.games': {'$regex': '.*' + game + '.*'}}).forEach((o) => {
        gamers.push(o.discordId)
      })

      return gamers
    }
  })
}
