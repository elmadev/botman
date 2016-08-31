import { Mongo } from 'meteor/mongo'

const Users = new Mongo.Collection('users')
const Logs = new Mongo.Collection('logs')

export {
  Users,
  Logs
}
