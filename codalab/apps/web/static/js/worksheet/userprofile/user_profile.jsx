import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Header
} from 'semantic-ui-react';
import {
  fetchWorksheetsOfUser,
  fetchUser,
} from './actions.jsx';

class UserProfilePresentation extends React.Component {
  componentDidMount() {
    this.props.onLoad();
  }

  render() {
    let first_name, last_name, affiliation;
    if (this.props.user.data && this.props.user.data.attributes) {
      ({first_name, last_name, affiliation} = this.props.user.data.attributes);
    }
    return (
      <div style={{paddingTop: '30px',}}>
        <Container>
          <Header as='h1'>{`${first_name} ${last_name}`}</Header>
          <Header as='h3'>{affiliation}</Header>
          <p> Worksheets </p>
          {
            this.props.worksheets.data ? this.props.worksheets.data.map((ws) => {
              return (
                <p>
                  <a href={`/worksheets/${ws.attributes.uuid}`}>
                    {ws.attributes.name}
                  </a>
                </p>
              );
            }) : null
          }
        </Container>
      </div>
    );
  }
}

UserProfilePresentation.propTypes = {
  worksheets: PropTypes.object,
  onLoad: PropTypes.func,
  user: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
  let user;
  if (ownProps.match.params.userId) {
    user = state.userProfile.user;
  } else { // authenticated user
    user = state.loggedInUser.user;
  }

  return {
    worksheets: state.userProfile.results,
    user,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoad: () => {
      let userId = ownProps.match.params.userId;
      if (userId) {
        dispatch(fetchWorksheetsOfUser(userId));
        dispatch(fetchUser(userId));
      } else {
        dispatch(fetchWorksheetsOfUser('.mine'));
      }
    },
  };
};

const UserProfile = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserProfilePresentation);

export {
  UserProfile
};
