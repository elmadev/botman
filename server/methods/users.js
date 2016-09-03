import {Users} from '/lib/collections'
import {Logs} from '/lib/collections'
import {Meteor} from 'meteor/meteor'
import {check} from 'meteor/check'
import moment from 'moment'

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
    },

    'users.set'(username, field, value) {
      check(username, String)
      check(field, String)
      check(value, String)

      if (!Users.findOne({ username: username })) {
        Meteor.wrapAsync(Meteor.call('users.register', username))
      }

      let allowedFields = ['lastfm']

      if (allowedFields.indexOf(field) !== -1) {
        let update = { '$set': {} }
        update['$set']['settings.' + field] = value

        Users.update({
          username: username
        }, update)
      }
    },

    'users.get'(username, field) {
      check(username, String)
      check(field, String)

      let user = Users.findOne({ username: username })
      console.log(user.settings)
      if (!user) {
        throw new Meteor.Error(500, `User "${username}" isn't registered!`)
      } else if (user['settings'][field]) {
        return user['settings'][field]
      } else {
        throw new Meteor.Error(500, `User "${username}" hasn't set their last.fm username!`)
      }
    },

    'users.getStats'(username, item, when) {
      check(username, String)
      check(item, String)
      check(when, String) // Should be 'day', 'week', 'month', or 'year'

      let date = moment().startOf(when).toDate()

      let count = Logs.find({
        username: username,
        item: item,
        createdAt: {$gte: date}
      }).count()

      return count
    }
  })
}
