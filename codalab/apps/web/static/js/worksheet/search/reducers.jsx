import { 
  UPDATE_CURRENT_QUERY,
  SEARCH_QUERY,
  RECEIVE_QUERY_RESULTS,
  updateCurrentQuery,
  receiveQueryResults,
  searchQuery } from './actions.jsx';
import update from 'immutability-helper';

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

export {
  search,
};
