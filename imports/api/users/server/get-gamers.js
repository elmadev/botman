import { check } from 'meteor/check'
import { Users } from '../users'

export const getGamers = (game, callback) => {
  check(game, String)

  let gamers = []
  Users.find({'settings.games': {'$regex': '.*' + game + '.*'}}).forEach((o) => {
    gamers.push(o.discordId)
  })

  callback(null, gamers)
}
