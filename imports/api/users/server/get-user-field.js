import { check } from 'meteor/check'
import { Users } from '../users'

export const getUserField = (discordId, field, callback) => {
  check(discordId, String)
  check(field, String)

  let user = Users.findOne({ discordId: discordId })

  if (!user) {
    callback(`User isn't registered!`)
  } else if (user['settings'][field]) {
    callback(null, user['settings'][field])
  } else {
    callback(`User hasn't set this profile field!`)
  }
}
