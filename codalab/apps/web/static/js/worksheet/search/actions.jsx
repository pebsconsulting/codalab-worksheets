import fetch from 'isomorphic-fetch'

const UPDATE_CURRENT_QUERY = 'UPDATE_CURRENT_QUERY';
const SEARCH_QUERY = 'SEARCH_QUERY';
const RECEIVE_QUERY_RESULTS = 'RECEIVE_QUERY_RESULTS';
const SEARCH_USERS = 'SEARCH_USERS';
const REQUEST_SEARCH_USERS = 'REQUEST_SEARCH_USERS';
const RECEIVE_SEARCH_USERS = 'RECEIVE_SEARCH_USERS';


function updateCurrentQuery(query) {
  return {
    type: UPDATE_CURRENT_QUERY,
    query
  };
};

function receiveQueryResults(query, results) {
  return {
    type: RECEIVE_QUERY_RESULTS,
    query,
    results
  };
}

function convertInputToQueryString(input) {
  let keywordsQuery;
  keywordsQuery = input.split();
  keywordsQuery.push(".limit=5");
  let keywordsQueryString = keywordsQuery.reduce((accumulated, cur) => {
    return accumulated + `keywords=${encodeURIComponent(cur)}` + '&';
  }, '');
  return keywordsQueryString;
}

function searchQuery(query) {
  console.log(query);
  return (dispatch) => {
    dispatch(updateCurrentQuery(query));

    let url = `/rest/worksheets?${convertInputToQueryString(query)}`;
    return fetch(url, {
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

function searchUsers(query) {
  return (dispatch) => {
    dispatch(requestSearchUsers(query));

    return fetch(`/rest/bundles?${convertInputToQueryString(query)}`, {
      credentials: 'same-origin'
    }).then(
      (response) => response.json(),
      (error) => console.log("error: ", error)
    ).then(
      json => dispatch(receiveSearchUsers(query, json))
    );
  };
}

function requestSearchUsers(query) {
  return {
    type: RECEIVE_SEARCH_USERS,
    query,
  };
}

function receiveSearchUsers(query, results) {
  return {
    type: RECEIVE_SEARCH_USERS,
    query,
    results
  };
}

export {
  UPDATE_CURRENT_QUERY,
  SEARCH_QUERY,
  RECEIVE_QUERY_RESULTS,
  SEARCH_USERS,
  REQUEST_SEARCH_USERS,
  RECEIVE_SEARCH_USERS,
  updateCurrentQuery,
  receiveQueryResults,
  searchQuery,
  searchUsers,
  requestSearchUsers,
  receiveSearchUsers,
};
