import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const Logs = new Mongo.Collection('logs')

Logs.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
})

Logs.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

Logs.schema = new SimpleSchema({
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

Logs.attachSchema(Logs.schema)
