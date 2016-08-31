import { Meteor } from 'meteor/meteor'
import publications from './publications'
import methods from './methods'
import bot from './bot'

Meteor.startup(() => {
  bot()
})

publications()
methods()
