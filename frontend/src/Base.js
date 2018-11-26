import React, { Component } from 'react';
import codalabLogo from './img/codalab-logo.png';
import { Navbar, Nav, NavItem, NavLink } from 'reactstrap';

export class Header extends Component {
  render() {
    const requestPath = '/'; // TODO

    return (
      <header>
        <nav className="navbar navbar-default navbar-fixed-top" role="navigation">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="/" target="_self">
                <img src={codalabLogo} alt="Home" className="img-responsive" />
              </a>
            </div>
            <div className="collapse navbar-collapse" id="navbar_collapse">
              <ul className="nav navbar-nav navbar-right">
                <li><a href="/rest/worksheets/?name=home" target="_self">Public Home</a></li>
                <li className="user-authenticated">
                  <a href="/rest/worksheets/?name=%2F" target="_self">My Home</a>
                </li>
                <li className="user-authenticated">
                  <a href="/rest/worksheets/?name=dashboard" target="_self">My Dashboard</a>
                </li>
                <li>
                  <a href="https://github.com/codalab/codalab-worksheets/wiki" target="_blank">Help</a>
                </li>
                <li className="user-authenticated dropdown {% active request '/accounts/' %}">
                    <a>
                      <img src="{{ STATIC_URL }}img/icon_mini_avatar.png" className="mini-avatar" /> <span className="user-name"></span> <span className="caret"></span>
                    </a>
                    <ul className="dropdown-menu" role="menu">
                      <li><a href="/account/profile" target="_self">My Account</a></li>
                      <li><a href={'/rest/account/logout?redirect_uri=' + requestPath} target="_self">Sign Out</a></li>
                    </ul>
                </li>
                <li className="user-not-authenticated">
                  <a href="/account/signup" target="_self">Sign Up</a>
                </li>
                <li className="user-not-authenticated">
                  <a href={'/account/login?next=' + requestPath} target="_self">Sign In</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export class Footer extends Component {
  render() {
    return 'footer';
  }
}
