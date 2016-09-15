import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const ChatLog = new Mongo.Collection('chatlog')

ChatLog.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
})

ChatLog.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

ChatLog.schema = new SimpleSchema({
  channel: {
    type: String
  },
  nick: {
    type: String
  },
  message: {
    type: String
  },
  timestamp: {
    type: Date
  }
})

ChatLog.attachSchema(ChatLog.schema)
