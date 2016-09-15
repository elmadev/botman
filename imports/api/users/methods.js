/* Example validated methods
import { Meteor } from 'meteor/meteor'
import { Users } from './users'
import { Logs } from '../logs/logs'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { rateLimit } from '../../modules/rate-limit.js'
import moment from 'moment'
import { allowedProfileFields } from '../../startup/server/bot/settings'

export const registerUser = new ValidatedMethod({
  name: 'users.register',
  validate: new SimpleSchema({
    discordId: { type: String }
  }).validator(),

  run (discordId) {
    if (Users.findOne({ discordId: discordId })) {
      throw new Meteor.Error(500, `You're already registered!`)
    }
    Users.insert({
      discordId: discordId,
      registeredAt: new Date()
    })
  }
})

export const setUserField = new ValidatedMethod({
  name: 'users.set',
  validate: new SimpleSchema({
    discordId: { type: String },
    field: { type: String },
    args: { type: [String] }
  }).validator(),
  run (discordId, field, args) {
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
  }
})

export const getUserField = new ValidatedMethod({
  name: 'users.get',
  validate: new SimpleSchema({
    discordId: { type: String },
    field: { type: String }
  }).validator(),
  run (discordId, field) {
    let user = Users.findOne({ discordId: discordId })
    if (!user) {
      throw new Meteor.Error(500, `User isn't registered!`)
    } else if (user['settings'][field]) {
      return user['settings'][field]
    } else {
      throw new Meteor.Error(500, `User hasn't set this profile field!`)
    }
  }
})

export const getUserLogStats = new ValidatedMethod({
  name: 'users.getStats',
  validate: new SimpleSchema({
    discordId: { type: String },
    item: { type: String },
    when: { type: String } // Should be 'day', 'week', 'month', or 'year'
  }).validator(),
  run (discordId, item, when) {
    let date = moment().startOf(when).toDate()
    let count = Logs.find({
      discordId: discordId,
      item: item,
      loggedAt: {$gte: date}
    }).count()
    return count
  }
})

export const getGamers = new ValidatedMethod({
  name: 'users.getGamers',
  validate: new SimpleSchema({
    game: { type: String }
  }).validator(),
  run (game) {
    let gamers = []
    Users.find({'settings.games': {'$regex': '.*' + game + '.*'}}).forEach((o) => {
      gamers.push(o.discordId)
    })
    return gamers
  }
})

rateLimit({
  methods: [
    registerUser,
    setUserField,
    getUserField,
    getUserLogStats,
    getGamers
  ],
  limit: 5,
  timeRange: 1000
})
*/
