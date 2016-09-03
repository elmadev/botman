import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Chance from 'chance'

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

// Seed the local database if needed
if (Meteor.settings.isDevelopment && Logs.find().count() < 1000) {
  let chance = new Chance()
  for (let i = 0; i < 1000; i++) {
    Logs.insert({
      username: chance.pickone(['artuurs', 'lommas', 'Ruben', 'jonsykkel', 'Redline', 'bene', 'Istwan', 'ville_j', 'zamppe', 'Markku', 'pab']),
      item: chance.pickone(['cofe', 'water', 'bear']),
      createdAt: chance.date({year: 2016})
    })
  }
}

export {
  Users,
  Logs
}
