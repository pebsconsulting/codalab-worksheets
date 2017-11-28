import {
  UPDATE_CURRENT_QUERY,
  RECEIVE_SEARCH_WORKSHEETS,
  RECEIVE_SEARCH_BUNDLES,
} from './actions.jsx';
import update from 'immutability-helper';

/*
 * TODO add better docs
State description:

Note: the logger prints off the global state after every action.
It's a good way of figuring out the right state to use.

The search state stores the current query that has been typed
into the search box and then the results of queries from every
type of object (worksheets, bundles), with one key per object
type (`worksheetQueries`, `bundleQueries`). See the
`initialState` below.

Each type has its own key-value store, where the key is the 
input string, and the value is the JSON results returned by the API.
For example:

{
  "a": { ...Results... },
  "aa": { ...Results... },
}

All results for all object types have a standardized format
which can be found in the REST API docs under the "Primary Data"
and "Resource Object Schemas" section:

http://codalab.org/codalab-cli/rest.html#bundles-api.

*/

const initialState = {
  worksheetQueries: {},
  bundleQueries: {},
  currentQuery: ""
};

const search = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_CURRENT_QUERY:
      return update(
        state,
        {
          worksheetQueries: {
            [action.query]: {
              $set: {
                isFetching: true,
              }
            }
          },
          bundleQueries: {
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
    case RECEIVE_SEARCH_WORKSHEETS:
      return update(
        state,
        {
          worksheetQueries: {
            [action.query]: {
              $set: {
                isFetching: false,
                results: action.results
              }
            }
          }
        }
      );
    case RECEIVE_SEARCH_BUNDLES:
      return update(state, {
        bundleQueries: {
          [action.query]: {
            $set: {
              isFetching: false,
              results: action.results,
            }
          }
        }
      });
    default:
      return state;
  }
}

export {
  search,
};
