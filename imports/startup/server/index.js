import { Meteor } from 'meteor/meteor'
import './api'
import bot from './bot'

Meteor.startup(() => {
  Future = Npm.require('fibers/future')

  bot()
})
