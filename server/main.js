import { Meteor } from 'meteor/meteor'
import publications from './publications'
import methods from './methods'
import bot from './bot'

Meteor.startup(() => {
  bot()

  Meteor.setTimeout(function () {
    // Test methods and stuff here
  }, 1000)
})

publications()
methods()
