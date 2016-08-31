import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const Users = new Mongo.Collection('users')
const Logs = new Mongo.Collection('logs')

const UsersSchema = new SimpleSchema({
  username: {
    type: String
  },
  settings: {
    type: Object,
    optional: true
  },
  'settings.lastfm': {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  }
})

Users.attachSchema(UsersSchema)

const LogsSchema = new SimpleSchema({
  username: {
    type: String
  },
  item: {
    type: String
  },
  createdAt: {
    type: Date
  }
})

Logs.attachSchema(LogsSchema)

export {
  Users,
  Logs
}
