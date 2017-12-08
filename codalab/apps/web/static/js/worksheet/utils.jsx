import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';

/**
 * For use with CodaLab's REST API endpoints,
 * primarily with GET requests, inside of a
 * React component.
 *
 * The purpose of this utility method is to 
 * improve code reuse when fetching data from
 * CodaLab's REST API and storing that to a 
 * React component's state.
 *
 * Parameters:
 *
 * url : string : REST API endpoint
 * currentState : function : Parameterless function
 *   that returns the current state. Ex:
 *     () => self.state
 * setState : function : function to update
 *   component's state. Ex:
 *     (newState, callback) => self.setState(newState, callback)
 *   `newState` is a JSON of the next state.
 *   `callback` is a parameterless callback function.
 * key : string : The results of the API call will
 *   be stored in the component's state under this
 *   key
 * context : JSON : An arbitrary JSON object that
 *   provides context for the query that was made
 * onReady : function : Parameterless callback
 *   function that will be called after the state
 *   is updated with the results of the query.
 *
 * Example usage:
 *
    let self = this;
    clFetch({
      url: `/rest/users/${userId}`,
      currentState: () => self.state,
      setState: (newState, callback) => self.setState(newState, callback),
      key: 'worksheets',
      context: { userId },
      onReady: () => console.log(self.state)
    });
 */
const requiredParam = () => {
  throw new Error('missing parameter');
}

const clFetch = ({
  // required params
  url = required(),
  currentState = required(),
  setState = required(),
  key = required(),
  // optional params
  context = {},
  onReady = () => {}
}) => {
  setState(update(currentState(), {
    [key]: {
      isFetching: {
        $set: true
      },
      context: {
        $set: context
      }
    }
  }));

  fetch(url, {
    credentials: 'same-origin',
  }).then(
    (response) => {
      if (response.status >= 400) {
        throw new Error('Bad response from server');
      }
      return response.json();
    }
  ).then(
    (json) => {
      setState(update(currentState(), {
        [key]: {
          isFetching: {
            $set: false,
          },
          results: {
            $set: json
          }
        }
      }), () => {
        onReady();
      });
    }
  ).catch(
    (error) => console.error(error)
  );
};

export {
  requiredParam,
  clFetch
};
