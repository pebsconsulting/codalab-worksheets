import React from 'react';
import { connect } from 'react-redux';
import { searchQuery } from './actions.jsx';
import { SearchBarPresentation } from './search_bar_presentation.jsx';

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
 *   Before they have typed they should see no results.
 * Each letter typed sends off a query. All results of the
 *   query are shown in the dropdown.
 * Selecting one of the results takes the user to the appropriate page.
 *
 */

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
)(SearchBarPresentation);

export {
  SearchBar
};
