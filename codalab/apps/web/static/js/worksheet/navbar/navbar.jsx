import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '../search/search_bar_presentation.jsx';
import { Dropdown } from 'semantic-ui-react';
import "semantic-ui-less/semantic.less";
import { connect } from 'react-redux';
import styled from 'styled-components';
import { userIsLoggedIn } from './utils.jsx';
import "./navbar.less";
// TODO individually package CSS bundles
// https://medium.com/webmonkeys/webpack-2-semantic-ui-theming-a216ddf60daf

const OnTopDropdown = styled(Dropdown)`
  z-index: 1000
`;

const NavBar = (props) => {
  if (userIsLoggedIn(props)) {
    return (
      <div>
        <div className="cl-navbar">
          <div className="cl-navbar-leftcontainer">
            <div className="cl-navbar-left-clicon">
              <a href="/" tabIndex="1" target="_self">
                <img src="/static/img/codalab-logo.png" className="cl-navbar-left-clicon" alt="Home" />
              </a>
            </div>
            <div className="cl-navbar-left-search">
              <SearchBar />
            </div>
          </div>
          <div className="cl-navbar-rightcontainer">
            <div>
              <a href="/rest/worksheets/?name=home">
                Public Home
              </a>
            </div>
            <div>
              <a href="/rest/worksheets/?name=dashboard">
                Dashboard
              </a>
            </div>
            <div>
              <a href="https://github.com/codalab/codalab-worksheets/wiki" target="_blank">
                Help
              </a>
            </div>
            <div>
              <img src="/static/img/icon_mini_avatar.png" className="mini-avatar" style={{
                borderRadius: "50%",
                border: "1px solid #ccc",
                margin: "9px",
              }}/>
              <OnTopDropdown text={props.loggedInUser.results.data.attributes.user_name}>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <a href="/account/profile">My Account</a>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <a href="/account/user_profile">My Profile</a>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <a href={`/rest/account/logout?redirect_uri=${encodeURIComponent(window.location.pathname)}`}>Logout</a> 
                  </Dropdown.Item>
                </Dropdown.Menu>
              </OnTopDropdown>
            </div>
          </div>
        </div>
        <div style={{height: "50px"}}></div>
      </div>
    );
  } else {
    let signInRedirectPath = (window.location.pathname === '/') ?
        '/rest/worksheets/?name=dashboard' :
        window.location.pathname;
    return (
      <div>
        <div className="cl-navbar">
          <div className="cl-navbar-leftcontainer">
            <div className="cl-navbar-left-clicon">
              <a href="/" tabIndex="1" target="_self">
                <img src="/static/img/codalab-logo.png" style={{height:'100%'}} alt="Home" />
              </a>
            </div>
            <div className="cl-navbar-left-search">
            </div>
          </div>
          <div className="cl-navbar-rightcontainer">
            <div>
              <a href="https://github.com/codalab/codalab-worksheets/wiki" target="_blank">
                Help
              </a>
            </div>
            <div key="signup">
              <a href="/account/signup">
                Sign Up
              </a>
            </div>
            <div key="signin">
              <a href={`/account/login?next=${encodeURIComponent(signInRedirectPath)}`}>
                Sign In
              </a>
            </div>
          </div>
        </div>
        <div style={{height: "50px"}}></div>
      </div>
    );
  }
}

NavBar.propTypes = {
  loggedInUser: PropTypes.object,
};

export { NavBar };
