import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '../search/search_bar.jsx';
import { Dropdown } from 'semantic-ui-react';
import "semantic-ui-less/semantic.less";
import { fetchLoggedInUser } from './actions.jsx';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { userIsLoggedIn } from './utils.jsx';
// TODO individually package CSS bundles
// https://medium.com/webmonkeys/webpack-2-semantic-ui-theming-a216ddf60daf

const OnTopDropdown = styled(Dropdown)`
  z-index: 1000
`;

class NavBar extends React.Component {
  componentDidMount() {
    this.props.onLoad();
  }

  render() {
    // If the user is logged in, shows the account
    // menu / dropdown. Otherwise, shows the 
    // sign up and sign in buttons.
    let authStuff = null;
    // If the user is logged in, shows the
    // search bar and dashboard. Otherwise hides
    // both.
    let searchBar, dashboard;

    // TODO make two paths for logged in an not logged in
    if (userIsLoggedIn(this.props)) {
      searchBar = <SearchBar />;
      dashboard = (
        <div>
          <a href="/rest/worksheets/?name=dashboard">
            Dashboard
          </a>
        </div>
      );
      authStuff = (
        <div>
          <img src="/static/img/icon_mini_avatar.png" className="mini-avatar" style={{
            borderRadius: "50%",
            border: "1px solid #ccc",
            margin: "9px",
          }}/>
          <OnTopDropdown text={this.props.loggedInUser.user.data.attributes.user_name}>
            <Dropdown.Menu>
              <Dropdown.Item>
                <a href="/account/profile">My Account</a>
              </Dropdown.Item>
              <Dropdown.Item>
                <a href={`/rest/account/logout?redirect_uri=${encodeURIComponent(window.location.pathname)}`}>Logout</a> 
              </Dropdown.Item>
            </Dropdown.Menu>
          </OnTopDropdown>
        </div>
      );
    } else {
      searchBar = null;
      dashboard = null;
      let signInRedirectPath = (window.location.pathname === '/') ?
	      	'/rest/worksheets/?name=dashboard' :
          window.location.pathname;
      authStuff = [
        <div key="signup">
          <a href="/account/signup">
            Sign Up
          </a>
        </div>,
        <div key="signin">
          <a href={`/account/login?next=${encodeURIComponent(signInRedirectPath)}`}>
            Sign In
          </a>
        </div>
      ];
    }

    return (<div>
      <div style={{
        height: '50px',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'fixed',
        width: '100%',
        backgroundColor: 'white',
        zIndex: '1000',
      }}>
        <div style={{
          width: '600px',
          display: 'flex' }}>
          <div style={{width: "150px"}}>
            <a href="/" tabIndex="1" target="_self">
              <img src="/static/img/codalab-logo.png" style={{height:'100%'}} alt="Home" />
            </a>
          </div>
          <div style={{
            marginTop: '5px',
            width: '100%' }} >
            { searchBar }
          </div>
        </div>
        <div style={{
          width:'400px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }} >
          { dashboard }
          <div>
            <a href="https://github.com/codalab/codalab-worksheets/wiki" target="_blank">
              Help
            </a>
          </div>
          { authStuff }
        </div>
      </div>
      <div style={{height: "50px"}}></div>
    </div>);
  }
}

NavBar.propTypes = {
  loggedInUser: PropTypes.object,
  onLoad: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    loggedInUser: state.loggedInUser
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoad: () => {
      dispatch(fetchLoggedInUser());
    }
  };
};

const NavBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NavBar);

export { NavBarContainer };
