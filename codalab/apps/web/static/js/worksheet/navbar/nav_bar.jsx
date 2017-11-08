import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '../search/search_bar.jsx';
import { Dropdown } from 'semantic-ui-react';
import "semantic-ui-less/semantic.less";
// TODO individually package CSS bundles
// https://medium.com/webmonkeys/webpack-2-semantic-ui-theming-a216ddf60daf

class NavBar extends React.Component {
  render() {
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
          alignItems: 'center'}} >
          {
            // Show Dashboard link and either:
            // (sign in, sign up)
            // (user account dropdown)
            // To check if the user is logged in:
            //
          }
          <div>
            Max Wang
          </div>
          <div>
            Home
          </div>
          <div>
						<Dropdown text='File'>
							<Dropdown.Menu>
								<Dropdown.Item text='New' />
								<Dropdown.Item text='Open...' description='ctrl + o' />
								<Dropdown.Item text='Save as...' description='ctrl + s' />
								<Dropdown.Item text='Rename' description='ctrl + r' />
								<Dropdown.Item text='Make a copy' />
								<Dropdown.Item icon='folder' text='Move to folder' />
								<Dropdown.Item icon='trash' text='Move to trash' />
								<Dropdown.Divider />
								<Dropdown.Item text='Download As...' />
								<Dropdown.Item text='Publish To Web' />
								<Dropdown.Item text='E-mail Collaborators' />
							</Dropdown.Menu>
						</Dropdown>
          </div>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  loggedInUser: PropTypes.object,
};

export { NavBar };
