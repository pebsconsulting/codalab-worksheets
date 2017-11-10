import React from 'react';
import { connect } from 'react-redux';
import { searchQuery, searchUsers } from './actions.jsx';
import { SearchBarPresentation } from './search_bar_presentation.jsx';

/**
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
  let results, wsResults, bundleResults, isLoading;
  if (state.search.currentQuery !== "") {
    let wsQuery = state.search.queries[state.search.currentQuery];
    let userQuery = state.search.userQueries[state.search.currentQuery];
    if (wsQuery.isFetching || userQuery.isFetching) {
      isLoading = true;
      wsResults = [];
    } else {
      isLoading = false;
      // TODO refactor, should really do this parsing in the reducers / action creators
      wsResults = wsQuery.results.data ? wsQuery.results.data.map((item) => {
        return {
          id: item.attributes.uuid,
          title: item.attributes.name,
          key: item.attributes.uuid,
          type: 'worksheet'
        };
      }) : [];
      bundleResults = userQuery.results.data ? userQuery.results.data.map((item) => {
        return {
          id: item.attributes.uuid,
          title: item.attributes.metadata.name,
          key: item.attributes.uuid,
          type: 'bundle',
        };
      }) : [];

      results = {};

      if (wsResults.length > 0) {
        results['worksheets'] = {
          name: 'Worksheets',
          results: wsResults,
        };
      }
      if (bundleResults.length > 0) {
        results['bundles'] = {
          name: 'Bundles',
          results: bundleResults,
        }
      }
    }
  } else {
    results = [];
    isLoading = false;
  }

  return {
    results: results,
    isLoading: isLoading
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onInputChange: (inputValue) => {
      dispatch(searchQuery(inputValue));
      dispatch(searchUsers(inputValue));
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
