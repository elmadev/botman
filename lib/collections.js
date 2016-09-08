import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const Users = new Mongo.Collection('users')
const Logs = new Mongo.Collection('logs')
const Imdb = new Mongo.Collection('imdb')

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

const RatingsSchema = new SimpleSchema({
  discordId: {
    type: String
  },
  rating: {
    type: Number
  }
})

const ImdbSchema = new SimpleSchema({
  imdbId: {
    type: String
  },
  year: {
    type: Number
  },
  genres: {
    type: [String]
  },
  ratings: {
    type: [RatingsSchema],
    optional: true
  }
})

Imdb.attachSchema(ImdbSchema)

export {
  Imdb,
  Users,
  Logs
}
