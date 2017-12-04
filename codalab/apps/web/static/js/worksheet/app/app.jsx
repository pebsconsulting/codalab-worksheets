import React from 'react';
import PropTypes from 'prop-types';
import { NavBarContainer } from '../navbar/nav_bar.jsx';
import { UserProfile } from '../userprofile/user_profile_no_redux.jsx';
import { Route } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <div>
        <Route path="/" component={NavBarContainer} />
        <Route path="/account/user_profile/:userId?" component={UserProfile} />
      </div>
    );
  }
}

export {
  App
};
