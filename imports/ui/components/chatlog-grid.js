import React from 'react'
import Griddle from 'griddle-react'
import { BootstrapPager, GriddleBootstrap } from 'griddle-react-bootstrap'

class ChannelDisplay extends React.Component {
  render() {
    let channel = '#' + this.props.data
    return (<span>{channel}</span>)
  }
}

class DateDisplay extends React.Component {
  render() {
    let date = this.props.data.toLocaleString()
    return (<span>{date}</span>)
  }
}

export class ChatLogGrid extends React.Component {
  render() {
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
        showFilter={true}
        showSettings={true}
        columns={['channel', 'nick', 'message', 'timestamp']}
        columnMetadata={columnMetadata}
        customPagerComponent={BootstrapPager}
        bordered={true}
        striped={true}
        hover={true}
        pagerOptions={{ maxButtons: 7 }}
        resultsPerPage={100}
        condensed={true}
        initialSort={'timestamp'}
      />
    )
  }
}

ChatLogGrid.propTypes = {
  chatlog: React.PropTypes.array
}
