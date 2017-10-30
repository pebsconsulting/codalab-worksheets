import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import Select from 'react-select';
import { combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch'
import update from 'immutability-helper';
import styled from 'styled-components';

/**
 * State shape:
 * {
 *   search: {
 *     queries: {
 *       "query1": {
 *         isFetching: false,
 *         results: ["worksheet name", "uuid", "owner username"]
 *       },
 *       "query2": {
 *         isFetching: true,
 *       }
 *     },
 *     currentQuery: "query2"
 *   }
 * }
 *
 * MVP Behavior:
 * User clicks on search bar. This search bar is only for worksheets.
 *   Before they have typed they should see no results.
 * Each letter typed sends off a query. The first five results of the
 *   query are shown in the dropdown.
 * Selecting one of the results takes the user to the appropriate page.
 *
 */


/** ACTIONS **/
const UPDATE_CURRENT_QUERY = 'UPDATE_CURRENT_QUERY';
const SEARCH_QUERY = 'SEARCH_QUERY';
const RECEIVE_QUERY_RESULTS = 'RECEIVE_QUERY_RESULTS';

function updateCurrentQuery(query) {
  return {
    type: UPDATE_CURRENT_QUERY,
    query
  };
};

function receiveQueryResults(response) {
  // TODO parse response
  let results;
  return {
    type: RECEIVE_QUERY_RESULTS,
    results
  };
}

function searchQuery(query) {
  console.log(query);
  return (dispatch) => {
    dispatch(updateCurrentQuery(query));

    return fetch(`/rest/worksheets/${query}`, {
      credentials: 'same-origin'
    }) // TODO use the right endpoint
      .then(response => {
        console.log("searchQuery response:", response);
        receiveQueryResults(response);
      });
  }
}

/** REDUCERS **/
const initialState = {
  queries: {},
  currentQuery: ""
};

const search = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CURRENT_QUERY:
      return update(
        state,
        {
          queries: {
            [state.query]: {
              $set: {
                isFetching: true,
              }
            }
          },
          currentQuery: {
            $set: state.query
          }
        }
      );
    case RECEIVE_QUERY_RESULTS:
      return state; // TODO
    default:
      return state;
  }
}

const clApp = combineReducers({
  search
});

class SearchBarContainer extends React.Component {
  render() {
    return (
      <span>
        <SearchBarPresentation
          onInputChange={this.props.onInputChange}
        />
      </span>
    );
  }
}

SearchBarContainer.propTypes = {
  onInputChange: PropTypes.func
};

const mapStateToProps = (state) => {
  let options = state.search.queries[state.search.currentQuery];
  options = options ? options : [];

  return {
    options: options
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onInputChange: (inputValue) => {
      dispatch(searchQuery(inputValue));
    }
  };
};

const SearchBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBarContainer);

class SearchBarPresentation extends React.Component {
  render() {
    const options = [
      { value: 'one', label: '' },
      { value: 'two', label: 'Two' }
    ];

    const onValueSelected = (selected) => {
      searchQuery(selected.value);
    };

    const onInputChange = (inputValue) => {
      console.log(inputValue);
      this.props.onInputChange(inputValue);
      return inputValue;
    };

    // TODO this isn working...
    // from: https://github.com/JedWatson/react-select/issues/1679
    const ClSearchSelect = styled(Select)`
      &.Select {
        .Select-control {
          display: inline;
          width: 50%;
        }
      }
    `;
    return (
      <Select
        name="Search"
        options={options}
        onChange={onValueSelected}
        onInputChange={onInputChange}
      />
    );
  }
}

SearchBarPresentation.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    })
  ),
  onInputChange: PropTypes.func
};

let store = createStore(
  clApp,
  applyMiddleware(
    thunkMiddleware,
    createLogger()
  )
);

ReactDOM.render(
    <Provider store={store}>
      <SearchBar />
    </Provider>,
    document.getElementById('cl-search-bar'));
