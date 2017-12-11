import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Header
} from 'semantic-ui-react';
// import prettyBytes from 'pretty-bytes';
import { clFetch } from '../utils.jsx';

/**
State: {
  worksheets: ClRequest(context={}),
  user: ClRequest(context={userId: String}),
}

ClRequest: {
  isFetching: Boolean,
  results: JsonApiResponse,
  context: JSON object,
}
If `isFetching` is true, `result` may be null and/or outdated.
If `isFetching` is false, `result` is a valid JsonApiResponse and the latest result.
`context` is a vanilla JSON with arbitrary key-value pairs.

JsonApiResponse: {
  data: Array,
  meta: {
    version: String,
  }
}
**/

class UserProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      worksheets: {
        isFetching: true,
      },
      user: {
        isFetching: true,
      },
    };

    this.loadData = this.loadData.bind(this);
    this.dataIsLoaded = this.dataIsLoaded.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  dataIsLoaded() {
    const state = this.state;

    return !state.worksheets.isFetching && !state.user.isFetching;
  }

  loadData() {
    const self = this;

    // get the user ID from the url
    let userId = this.props.match.params.userId || '.mine';
    let urlForUserData, urlForWorksheetData;
    if (userId !== '.mine') {
      urlForUserData = `/rest/users/${userId}`;
      urlForWorksheetData = `/rest/worksheets?keywords=${encodeURIComponent(`owner=${userId}`)}`;
    } else {
      urlForUserData = `/rest/user`;
      urlForWorksheetData = `/rest/worksheets?keywords=${encodeURIComponent('.mine')}`
    }

    clFetch({
      url: urlForWorksheetData,
      setState: (updater, callback) => self.setState(updater, callback),
      key: 'worksheets',
      context: { userId },
      onReady: () => console.log(self.state)
    });

    clFetch({
      url: urlForUserData,
      setState: (updater, callback) => self.setState(updater, callback),
      key: 'user',
      context: { userId },
      onReady: () => console.log(self.state),
    });
  }

  render() {
    const state = this.state
    if (this.dataIsLoaded()) {
      return (
        <UserProfilePresentation 
          worksheets={this.state.worksheets.results}
          user={this.state.user.results}
          userProfileIsOfLoggedInUser={this.props.match.params.userId ? false : true}
        />
      );
    } else {
      return null;
    }
  }
}

UserProfile.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      // `userId` is null if showing the profile of the current user,
      // whereas it is a string representing a user's ID otherwise
      userId: PropTypes.string
    })
  })
};

const UserProfilePresentation = ({ worksheets, user, userProfileIsOfLoggedInUser }) => {
  let { user_name, first_name, last_name, affiliation, disk_used, time_used } = user.data.attributes;

  const ifShowingLoggedInUser = (components) => {
    if (userProfileIsOfLoggedInUser) {
      return components;
    }
    return null;
  };

  return (
    <Container>
      <Header as="h1">
        <img src="/static/img/icon_mini_avatar.png" className="mini-avatar cl-userprofile-usericon"/>
        { first_name } { last_name } ({ user_name })
      </Header>
      {ifShowingLoggedInUser(
      <div>
        <div>
          Disk usage: {disk_used}
        </div>
        <div>
          Time usage: {time_used} s
        </div>
      </div>
      )}
      <Header as='h3'>
        { affiliation }
      </Header>
      <Header as='h3'>
        Worksheets
      </Header>
      <div className="ws-item">
        <div className="type-table table-responsive table-striped">
          <table className='table table-striped'>
            <tbody>
            {worksheets.data.map((ws) => (
               <tr key={ ws.attributes.uuid }>
                 <td>
                   <span style={{ marginRight: '5px' }}>
                     <a href={`/worksheets/${ws.attributes.uuid}`}>
                       { ws.attributes.title }
                     </a>
                   </span>
                   (
                     <a href={`/worksheets/${ws.attributes.uuid}`}>
                       { ws.attributes.name }
                     </a>
                   )
                 </td>
               </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  )
};

UserProfilePresentation.propTypes = {
  worksheets: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  userProfileIsOfLoggedInUser: PropTypes.bool.isRequired,
};

export {
  UserProfile,
  UserProfilePresentation
};
