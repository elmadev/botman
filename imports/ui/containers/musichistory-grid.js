import { composeWithTracker } from 'react-komposer'
import { MusicHistory } from '../../api/musichistory/musichistory.js'
import { MusicHistoryGrid } from '../components/musichistory-grid.js'
import { Loading } from '../components/loading.js'
import { Meteor } from 'meteor/meteor'

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('musichistory')
  if (subscription.ready()) {
    const musichistory = MusicHistory.find().fetch()
    onData(null, { musichistory })
  }
}

export default composeWithTracker(composer, Loading)(MusicHistoryGrid)
