import {Users} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'

export default function () {
  Meteor.methods({
    'users.register'(username) {
      check(username, String)

      if (Users.findOne({ username: username })) {
        throw new Meteor.Error(500, `Username "${username}" is already registered!`)
      }

      return Users.insert({
        username: username,
        createdAt: new Date()
      })
    }
  })
}
