import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const Users = new Mongo.Collection('users')

Users.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
})

Users.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

Users.schema = new SimpleSchema({
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

Users.attachSchema(Users.schema)
