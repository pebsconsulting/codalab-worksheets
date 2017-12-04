import React from 'react';
import { connect } from 'react-redux';
import {
  fetchSearch,
} from './actions.jsx';
import { SearchBarPresentation } from './search_bar_presentation.jsx';
import { PARAMS } from './constants.jsx';
import { getCurrentSearchQuery, getCurrentSearchResults } from './utils.jsx';
import converter from 'number-to-words';

const mapStateToProps = (state) => {
  let results, wsResults, bundleResults, isLoading, isCategories;
  results = {};
  if (getCurrentSearchQuery(state).length <= PARAMS['MIN_INPUT_LENGTH']) {
    // if the input is less than or equal to the
    // minimum allowed length
    results['message'] = {
      name: '',
      results: [{
        title: `Type at least ${converter.toWords(PARAMS['MIN_INPUT_LENGTH'] + 1)} letters to search`,
        key: 'message',
      }]
    }
    isLoading = false;
    isCategories = false;
  } else if (getCurrentSearchQuery(state) !== "") {
    // if the user has entered some input
    let worksheetResults, bundleResults, userResults;
    ({ worksheetResults, bundleResults, userResults } = getCurrentSearchResults(state));

    if (worksheetResults.isFetching || bundleResults.isFetching || userResults.isFetching) {
      isLoading = true;
      isCategories = false;
    } else {
      isLoading = false;
      wsResults = worksheetResults.results.data ? worksheetResults.results.data.map((item) => {
        let description;
        if (item.attributes.title) {
          description = `Title: ${item.attributes.title}`;
        } else {
          description = '';
        }
        return {
          id: item.attributes.uuid,
          title: item.attributes.name,
          description,
          key: item.attributes.uuid,
          type: 'worksheet'
        };
      }) : [];
      bundleResults = bundleResults.results.data ? bundleResults.results.data.map((item) => {
        let description;
        if (item.attributes.command) {
          description = `command: ${item.attributes.command}`;
        } else {
          description = '';
        }
        return {
          id: item.attributes.uuid,
          title: item.attributes.metadata.name,
          description,
          key: item.attributes.uuid,
          type: 'bundle',
        };
      }) : [];
      userResults = userResults.results.data ? userResults.results.data.map((item) => {
        return {
          id: item.id,
          title: item.attributes.user_name,
          key: item.id,
          type: 'user',
        };
      }) : [];

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
        };
      }
      if (userResults.length > 0) {
        results['users'] = {
          name: 'Users',
          results: userResults,
        };
      }
      isCategories = true;
    }
  } else {
    isLoading = false;
    isCategories = false;
  }

  results['filters'] = {
    name: 'Filter results',
    results: [
      {
        id: 'mine',
        title: '.mine',
        type: 'filter',
        key: '.mine',
        description: 'Search only for items that I own',
      },
    ]
  };

  isCategories = true;

  return {
    results,
    isLoading,
    isCategories,
    value: getCurrentSearchQuery(state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onInputChange: (inputValue) => {
      dispatch(fetchSearch(inputValue));
    },
    onResultSelect: (e, selected) => {
      if (selected.result.type === 'worksheet') {
        window.location.href = 
        `/worksheets/${selected.result.id}`;
      } else if (selected.result.type === 'bundle') {
        window.location.href = 
        `/bundles/${selected.result.id}`;
      } else if (selected.result.type == 'filter') {
        dispatch(fetchSearch(`${selected.value} ${selected.result.key}`));
        let x;
      } else if (selected.result.type == 'user') {
        window.location.href = `/account/user_profile/${selected.result.id}`;
      }
    },
  };
};

const SearchBar = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBarPresentation);

export {
  SearchBar
};
