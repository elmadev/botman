import { check } from 'meteor/check'
import { Users } from '../users'

export const registerUser = (discordId, callback) => {
  check(discordId, String)
  if (Users.findOne({ discordId: discordId })) {
    callback(`You're already registered!`)
  } else {
    Users.insert({
      discordId: discordId,
      registeredAt: new Date()
    })
    callback(null)
  }
}
