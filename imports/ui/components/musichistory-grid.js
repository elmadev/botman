import React from 'react'
import { BootstrapPager, GriddleBootstrap } from 'griddle-react-bootstrap'
// import { getNick } from '../../startup/server/bot/bot.js'

class DateDisplay extends React.Component {
  render () {
    let date = this.props.data.toLocaleString()
    return (<span>{date}</span>)
  }
}

/* TO DO: export getNick from bot.js

class RequesterDisplay extends React.Component {
  render () {
    let nick = getNick(this.props.data)
    return (<span>{nick}</span>)
  }
}

*/

export class MusicHistoryGrid extends React.Component {
  render () {
    let columnMetadata = [
      {
        columnName: 'title',
        displayName: 'Title',
        order: 1
      },
      {
        columnName: 'url',
        displayName: 'Link',
        order: 2
      },
      {
        columnName: 'playedAt',
        displayName: 'Date/Time',
        order: 3,
        customComponent: DateDisplay,
        sortDirectionCycle: ['desc', 'asc', null]
      },
      {
        columnName: 'requestedBy',
        displayName: 'Requested by',
        order: 4
        // customComponent: RequesterDisplay
      }
    ]
    return (
      <GriddleBootstrap
        results={this.props.musichistory}
        showFilter
        showSettings
        columns={['title', 'url', 'playedAt', 'requestedBy']}
        columnMetadata={columnMetadata}
        customPagerComponent={BootstrapPager}
        bordered
        striped
        hover
        pagerOptions={{ maxButtons: 5 }}
        resultsPerPage={10}
        condensed
        initialSort={'playedAt'}
      />
    )
  }
}

MusicHistoryGrid.propTypes = {
  musichistory: React.PropTypes.array
}
