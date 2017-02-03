import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { App } from '../../ui/layouts/app'
import { Index } from '../../ui/pages/index'
import { ChatLog } from '../../ui/pages/chatlog'
import { MusicmanHistory } from '../../ui/pages/musicmanhistory'

Meteor.startup(() => {
  render(
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute name='index' component={Index} />
        <Route name='chatlog' path='/chatlog' component={ChatLog} />
        <Route name='musicman' path='/musicman' component={MusicmanHistory} />
      </Route>
    </Router>,
    document.getElementById('react-root')
  )
})
