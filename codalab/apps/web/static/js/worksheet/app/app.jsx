import React from 'react';
import PropTypes from 'prop-types';
import { NavBar, NavBarContainer } from '../navbar/nav_bar.jsx';
import { UserProfile } from '../userprofile/user_profile.jsx';
import { Route } from 'react-router-dom';
import { clFetch } from '../utils.jsx';
import mouseTrap from 'react-mousetrap';

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedInUser: {}
    };
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const self = this;
    const setState = (updater, callback) => 
      self.setState(updater, callback);
    clFetch({
      url: '/rest/user',
      setState,
      key: 'loggedInUser',
    });
  }

  render() {
    const self = this;
    const NavBarContainerWithProps = (props) => {
      let { loggedInUser } = self.state;
      if (loggedInUser.isFetching) {
        return null;
      }
      return (
        <NavBar
          loggedInUser={loggedInUser}
          {...props}
        />
      );
    };
    return (
      <div>
        <Route path="/" render={NavBarContainerWithProps} />
        <Route path="/account/user_profile/:userId?" component={UserProfile} />
      </div>
    );
  }
}

const App = mouseTrap(AppComponent);

export {
  App
};
