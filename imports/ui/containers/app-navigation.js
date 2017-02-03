import { composeWithTracker } from 'react-komposer'
import { AppNavigation } from '../components/app-navigation'

const composer = (props, onData) => {
  onData(null, {})
}

export default composeWithTracker(composer, {}, {}, { pure: false })(AppNavigation)
