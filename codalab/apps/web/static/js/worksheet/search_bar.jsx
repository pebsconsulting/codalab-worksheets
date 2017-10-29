import React from 'react';
import ReactDOM from 'react-dom';

class SearchBar extends React.Component {
  render() {
    return (
      <form className="navbar-form navbar-left">
        <div className="form-group">
          <input type="text" class="form-control" placeholder="Search" />
        </div>
      </form>
    );
  }
}

ReactDOM.render(<SearchBar />, document.getElementById('cl-search-bar'));
