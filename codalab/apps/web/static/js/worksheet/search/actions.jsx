import fetch from 'isomorphic-fetch';
import { PARAMS } from './constants.jsx';

const UPDATE_CURRENT_QUERY = 'UPDATE_CURRENT_QUERY';
const RECEIVE_SEARCH_WORKSHEETS = 'RECEIVE_SEARCH_WORKSHEETS';
const RECEIVE_SEARCH_BUNDLES = 'RECEIVE_SEARCH_BUNDLES';

function updateCurrentQuery(query) {
  return {
    type: UPDATE_CURRENT_QUERY,
    query
  };
};

function receiveSearchWorksheets(query, results) {
  return {
    type: RECEIVE_SEARCH_WORKSHEETS,
    query,
    results
  };
}

function convertInputToKeywordQueryString(input) {
  let keywordsQuery;
  keywordsQuery = input.split();
  keywordsQuery.push(".limit=5");
  let keywordsQueryString = keywordsQuery.reduce((accumulated, cur) => {
    return accumulated + `keywords=${encodeURIComponent(cur)}` + '&';
  }, '');
  return keywordsQueryString;
}

function fetchSearch(query) {
  return (dispatch) => {
    dispatch(updateCurrentQuery(query));
    if (query.length <= PARAMS['MIN_INPUT_LENGTH']) return;

    let keywordQueryString = convertInputToKeywordQueryString(query);

    return [
      fetch(`/rest/worksheets?${keywordQueryString}`, {
        credentials: 'same-origin'
      }).then(
        (response) => {
          if (response.status >= 400) {
            throw new Error("Bad response from server");
          }
          return response.json();
        },
        (error) => console.log("error: ", error)
      ).then(
        json => dispatch(receiveSearchWorksheets(query, json))
      ).catch(
        error => console.log(error)
      ),
      fetch(`/rest/bundles?${keywordQueryString}`, {
        credentials: 'same-origin'
      }).then(
        (response) => {
          if (response.status >= 400) {
            throw new Error("Bad response from server");
          }
          return response.json();
        },
        (error) => console.log("error: ", error)
      ).then(
        json => dispatch(receiveSearchBundles(query, json))
      ).catch(
        error => console.log(error)
      ),
    ];
  };
}

function receiveSearchBundles(query, results) {
  return {
    type: RECEIVE_SEARCH_BUNDLES,
    query,
    results
  };
}

export {
  UPDATE_CURRENT_QUERY,
  RECEIVE_SEARCH_WORKSHEETS,
  RECEIVE_SEARCH_BUNDLES,
  fetchSearch,
};
