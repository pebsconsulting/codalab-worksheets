import fetch from 'isomorphic-fetch'

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


export {
  UPDATE_CURRENT_QUERY,
  SEARCH_QUERY,
  RECEIVE_QUERY_RESULTS,
  updateCurrentQuery,
  receiveQueryResults,
  searchQuery,
};
