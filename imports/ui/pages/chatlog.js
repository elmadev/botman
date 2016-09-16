import React from 'react'
import { Row, Col } from 'react-bootstrap'
import ChatLogGrid from '../containers/chatlog-grid.js'

export const ChatLog = () => (
  <Row>
    <Col xs={12}>
      <h4 className='page-header'>Discord Chat Log</h4>
      <ChatLogGrid />
    </Col>
  </Row>
)
