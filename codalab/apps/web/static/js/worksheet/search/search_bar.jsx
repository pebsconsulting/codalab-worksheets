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
  if (getCurrentSearchQuery(state).length <= PARAMS['MIN_INPUT_LENGTH']) {
    results = [{
      title: `Type at least ${converter.toWords(PARAMS['MIN_INPUT_LENGTH'] + 1)} letters to search`
    }];
    isLoading = false;
    isCategories = false;
  } else if (getCurrentSearchQuery(state).length !== "") {
    let worksheetResults, bundleResults;
    ({ worksheetResults, bundleResults } = getCurrentSearchResults(state));

    if (worksheetResults.isFetching || bundleResults.isFetching) {
      isLoading = true;
      wsResults = [];
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
      isCategories = true;
    }
  } else {
    results = [];
    isLoading = false;
    isCategories = false;
  }

  return {
    results,
    isLoading,
    isCategories
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onInputChange: (inputValue) => {
      dispatch(fetchSearch(inputValue));
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
