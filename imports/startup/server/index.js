import { Meteor } from 'meteor/meteor'
import './api'
import bot from './bot'

Meteor.startup(() => {
  bot()
})
