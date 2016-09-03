import { Meteor } from 'meteor/meteor'
import publications from './publications'
import methods from './methods'
import bot from './bot'

Meteor.startup(() => {
  bot()

  // Test methods and stuff here
  Meteor.setTimeout(function () {
    console.log(Meteor.call('logs.getStats', 'cofe', 'year'))
    console.log(Meteor.call('users.getStats', 'artuurs', 'cofe', 'year'))
  }, 1000)
})

publications()
methods()
