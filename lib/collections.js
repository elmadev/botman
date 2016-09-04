import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const Users = new Mongo.Collection('users')
const Logs = new Mongo.Collection('logs')

const UsersSchema = new SimpleSchema({
  discordId: {
    type: String
  },
  settings: {
    type: Object,
    optional: true
  },
  'settings.eol': {
    type: String,
    optional: true
  },
  'settings.lastfm': {
    type: String,
    optional: true
  },
  'settings.games': {
    type: String,
    optional: true
  },
  'settings.imdb': {
    type: String,
    optional: true
  },
  'settings.steam': {
    type: String,
    optional: true
  },
  'settings.rocket': {
    type: String,
    optional: true
  },
  registeredAt: {
    type: Date
  }
})

Users.attachSchema(UsersSchema)

const LogsSchema = new SimpleSchema({
  discordId: {
    type: String
  },
  item: {
    type: String
  },
  loggedAt: {
    type: Date
  }
})

Logs.attachSchema(LogsSchema)

export {
  Users,
  Logs
}
