import React from 'react'
import { Navbar, Nav, NavItem } from 'react-bootstrap'
import { Link } from 'react-router'
import { LinkContainer } from 'react-router-bootstrap'

export class AppNavigation extends React.Component {
  render () {
    return <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to='/'>botman</Link>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          <LinkContainer to='chatlog'>
            <NavItem eventKey={1} href='/chatlog'>Discord Chat Logs</NavItem>
          </LinkContainer>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  }
}
