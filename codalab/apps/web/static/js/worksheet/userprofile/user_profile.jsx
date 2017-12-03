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
import prettyBytes from 'pretty-bytes';

class UserProfilePresentation extends React.Component {
  componentDidMount() {
    this.props.onLoad();
  }

  render() {
    let user_name, first_name, last_name, affiliation, title;
    let self_info;
    if (this.props.user && this.props.user.data && this.props.user.data.attributes) {
      ({first_name, last_name, affiliation, user_name} = this.props.user.data.attributes);

      if (!this.props.match.params.userId) {
        self_info = (
          <div>
            <div>
              Disk usage: {prettyBytes(this.props.user.data.attributes.disk_used)}
            </div>
            <div>
              Time usage: {this.props.user.data.attributes.time_used} s
            </div>
          </div>
        );
      }
    }

    if (first_name && last_name) {
      title = `Name: ${first_name} ${last_name}`;
    } else {
      title = `Username: ${user_name}`;
    }
    return (
      <div style={{paddingTop: '30px',}}>
        <Container>
          <Header as='h1'>
            <img src="/static/img/icon_mini_avatar.png" className="mini-avatar" style={{
              borderRadius: "50%",
              border: "1px solid #ccc",
              margin: "9px",
              width: "5%",
            }}/>
            {title}
          </Header>
          {self_info}
          <Header as='h3'>{affiliation}</Header>
          <p> Worksheets </p>
          {
            this.props.worksheets.data ? this.props.worksheets.data.map((ws) => {
              return (
                <p key={ws.attributes.uuid}>
                  <a href={`/worksheets/${ws.attributes.uuid}`}>
                    {ws.attributes.title === null ? "[No title]" : ws.attributes.title}: (
                  </a>
                  <a href={`/worksheets/${ws.attributes.uuid}`}>
                    {ws.attributes.name}
                  </a>
                  )
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
    user = state.loggedInUser.user ? state.loggedInUser.user : {};
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
