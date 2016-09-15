import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Users } from '../users'
import { allowedProfileFields } from '../../../startup/server/bot/settings'
import registerUser from './register-user'

export const setUserField = (discordId, field, args, callback) => {
  check(discordId, String)
  check(field, String)
  check(args, [String])

  let value = args.join(' ')

  if (!Users.findOne({ discordId: discordId })) {
    Meteor.wrapAsync(registerUser(discordId))
  }

  if (allowedProfileFields.indexOf(field) > -1) {
    let update = { '$set': {} }
    update['$set']['settings.' + field] = value

    Users.update({
      discordId: discordId
    }, update)

    callback(null)
  }
}
