import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '../search/search_bar.jsx';
import { Dropdown } from 'semantic-ui-react';
import "semantic-ui-less/semantic.less";
import { fetchLoggedInUser } from './actions.jsx';
import { connect } from 'react-redux';
import styled from 'styled-components';
// TODO individually package CSS bundles
// https://medium.com/webmonkeys/webpack-2-semantic-ui-theming-a216ddf60daf

class NavBar extends React.Component {
  componentDidMount() {
    this.props.onLoad();
  }

  render() {
    let signInOrLoggedInUser = null;
    if (this.props.loggedInUser.user) {
      const OnTopDropdown = styled(Dropdown)`
        z-index: 1000
      `;
      signInOrLoggedInUser = (
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
                <a href="/rest/account/logout">Logout</a> {
                  //TODO add redirect uri
                }
              </Dropdown.Item>
            </Dropdown.Menu>
          </OnTopDropdown>
        </div>
      );
    } else {
      signInOrLoggedInUser = (
        <div>
          Sign in
        </div>
      );
    }
    return (
      <div style={{
        height: '50px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div style={{
          width: '600px',
          display: 'flex' }}>
          <div>
            <a href="/" tabIndex="1" target="_self">
              <img src="/static/img/codalab-logo.png" style={{height:'100%'}} alt="Home" />
            </a>
          </div>
          <div style={{
            marginTop: '5px',
            width: '100%' }} >
            <SearchBar />
          </div>
        </div>
        <div style={{
          width:'400px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }} >
          {
            // Show Dashboard link and either:
            // (sign in, sign up)
            // (user account dropdown)
            // To check if the user is logged in:
            //
          }
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
            {signInOrLoggedInUser}
          </div>
        </div>
      </div>
    );
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
