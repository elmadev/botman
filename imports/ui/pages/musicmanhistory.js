import React from 'react'
import { Row, Col } from 'react-bootstrap'
import MusicHistoryGrid from '../containers/musichistory-grid.js'

export const MusicmanHistory = () => (
  <Row>
    <Col xs={12}>
      <h4 className='page-header'>Musicman History</h4>
      <MusicHistoryGrid />
    </Col>
  </Row>
)
