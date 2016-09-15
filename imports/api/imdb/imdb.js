import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const Imdb = new Mongo.Collection('imdb')

Imdb.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
})

Imdb.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

const RatingsSchema = new SimpleSchema({
  discordId: {
    type: String
  },
  rating: {
    type: Number
  }
})

Imdb.schema = new SimpleSchema({
  imdbId: {
    type: String
  },
  year: {
    type: Number
  },
  genres: {
    type: [String]
  },
  ratings: {
    type: [RatingsSchema],
    optional: true
  }
})
