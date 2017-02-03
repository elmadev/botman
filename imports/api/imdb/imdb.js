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
  date: {
    type: Date
  },
  rating: {
    type: Number
  }
})

Imdb.schema = new SimpleSchema({
  imdbId: {
    type: String
  },
  title: {
    type: String
  },
  director: {
    type: String
  },
  year: {
    type: Number
  },
  titleType: {
    type: String
  },
  genres: {
    type: [String]
  },
  runtime: {
    type: Number
  },
  ratings: {
    type: [RatingsSchema],
    optional: true
  }
})
