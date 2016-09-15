import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const MusicHistory = new Mongo.Collection('musichistory')

MusicHistory.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
})

MusicHistory.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

MusicHistory.schema = new SimpleSchema({
  title: {
    type: String
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  playedAt: {
    type: Date
  },
  requestedBy: {
    type: String,
    optional: true
  }
})

MusicHistory.attachSchema(MusicHistory.schema)
