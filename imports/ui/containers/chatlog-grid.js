import { composeWithTracker } from 'react-komposer'
import { ChatLog } from '../../../lib/collections.js'
import { ChatLogGrid } from '../components/chatlog-grid.js'
import { Loading } from '../components/loading.js'
import { Meteor } from 'meteor/meteor'

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('chatlog')
  if (subscription.ready()) {
    const chatlog = ChatLog.find().fetch()
    onData(null, { chatlog })
  }
}

export default composeWithTracker(composer, Loading)(ChatLogGrid)
