import React from 'react'
import { BootstrapPager, GriddleBootstrap } from 'griddle-react-bootstrap'

class ChannelDisplay extends React.Component {
  render () {
    let channel = '#' + this.props.data
    return (<span>{channel}</span>)
  }
}

class DateDisplay extends React.Component {
  render () {
    let date = this.props.data.toLocaleString()
    return (<span>{date}</span>)
  }
}

export class ChatLogGrid extends React.Component {
  render () {
    let columnMetadata = [
      {
        columnName: 'channel',
        displayName: 'Channel',
        order: 1,
        customComponent: ChannelDisplay
      },
      {
        columnName: 'nick',
        displayName: 'Nick',
        order: 2
      },
      {
        columnName: 'message',
        displayName: 'Message',
        order: 3
      },
      {
        columnName: 'timestamp',
        displayName: 'Date/Time',
        order: 4,
        customComponent: DateDisplay,
        sortDirectionCycle: ['desc', 'asc', null]
      }
    ]
    return (
      <GriddleBootstrap
        results={this.props.chatlog}
        showFilter
        showSettings
        columns={['channel', 'nick', 'message', 'timestamp']}
        columnMetadata={columnMetadata}
        customPagerComponent={BootstrapPager}
        bordered
        striped
        hover
        pagerOptions={{ maxButtons: 5 }}
        resultsPerPage={50}
        condensed
        initialSort={'timestamp'}
      />
    )
  }
}

ChatLogGrid.propTypes = {
  chatlog: React.PropTypes.array
}
