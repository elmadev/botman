import { Meteor } from 'meteor/meteor'
import publications from './publications'
import methods from './methods'
import bot from './bot'

Meteor.startup(() => {
  bot()

  Meteor.setTimeout(function () {
    // Meteor.call('users.fix')
    // Meteor.call('logs.fix')
  }, 1000)
})

publications()
methods()
