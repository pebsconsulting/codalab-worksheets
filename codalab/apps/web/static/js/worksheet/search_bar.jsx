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
 * MVP II Behavior:
 * User clicks on search bar. This search bar is only for worksheets.
 *   Before they have typed they should some suggestions:
 * Each letter typed sends off a query for all queries longer than 1 character.All results of the
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

function receiveQueryResults(query, results) {
  // TODO parse response
  return {
    type: RECEIVE_QUERY_RESULTS,
    query,
    results
  };
}

function searchQuery(query) {
  console.log(query);
  return (dispatch) => {
    dispatch(updateCurrentQuery(query));

    return fetch(`/rest/worksheets?keywords=${query}`, {
      credentials: 'same-origin'
    }).then(
        (response) => response.json(),
        (error) => console.log("error: ", error)
      )
      .then(json => {
        dispatch(receiveQueryResults(query, json));
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
            [action.query]: {
              $set: {
                isFetching: true,
              }
            }
          },
          currentQuery: {
            $set: action.query
          }
        }
      );
    case RECEIVE_QUERY_RESULTS:
      return update(
        state,
        {
          queries: {
            [action.query]: {
              $set: {
                isFetching: false,
                results: action.results
              }
            }
          }
        }
      );
    default:
      return state;
  }
}

const clApp = combineReducers({
  search
});

// TODO remove this class, wire directly
// into presentation class
class SearchBarContainer extends React.Component {
  render() {
    return (
      <span>
        <SearchBarPresentation
          onInputChange={this.props.onInputChange}
          options={this.props.options}
          isLoading={this.props.isLoading}
        />
      </span>
    );
  }
}

SearchBarContainer.propTypes = {
  onInputChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    })
  ),
};

const mapStateToProps = (state) => {
  let options, isLoading;
  if (state.search.currentQuery !== "") {
    let query = state.search.queries[state.search.currentQuery];
    if (query.isFetching) {
      isLoading = true;
      options = [];
    } else {
      isLoading = false;
      options = query.results.data.map((item) => {
        return {
          value: item.attributes.uuid,
          label: item.attributes.name
        };
      });
    }
  } else {
    options = [];
    isLoading = false;
  }

  return {
    options: options,
    isLoading: isLoading
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
    const onValueSelected = (selected) => {
      window.location.href = `/worksheets/${selected.value}`
    };

    const onInputChange = (inputValue) => {
      console.log(inputValue);
      this.props.onInputChange(inputValue);
      return inputValue;
    };

    // TODO this isn working...
    // from: https://github.com/JedWatson/react-select/issues/1679
    const ClSearchSelect = styled(Select)`
      z-index: 999;
    `;
    return (
      <ClSearchSelect
        name="Search"
        options={this.props.options}
        onChange={onValueSelected}
        onInputChange={onInputChange}
        onBlurResetsInput={false}
        isLoading={this.props.isLoading}
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
  onInputChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
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
