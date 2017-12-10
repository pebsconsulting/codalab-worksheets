import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';

const requiredParam = () => {
  throw new Error('missing parameter');
}

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
 * setState : function : function to update
 *   component's state. Ex:
 *     (newState, callback) => self.setState(newState, callback)
 *   `newState` is a function of the form:
 *     (prevState, props) => { ... returns new state ... }
 *   `callback` is a parameterless callback function.
 * key : string|array(string) : The results of the API call will
 *   be stored in the component's state under this
 *   key. If the `key` is an array of strings, will
 *   follow the "path" that's created by the sequence
 *   of strings. For example, ['a', 'b'] would
 *   alter the JSON at:
 *   {
 *     'a': {
 *       'b': [value goes here...]:
 *     } 
 *   }
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
// TODO convert into a promise
const clFetch = ({
  // required params
  url = required(),
  setState = required(),
  key = required(),
  // optional params
  context = {},
  onReady = () => {}
}) => {
  const createMergeObj = (keyAsArray, val) => {
    if (keyAsArray.length === 0) {
      return val;
    }
    let mergeObj = {};
    let originalObj = mergeObj;
    for(let m = 0; m < key.length - 1; m++) {
      if (!(key[m] in mergeObj)) {
        mergeObj[key[m]] = {};
      }
      mergeObj = mergeObj[key[m]];
    }
    mergeObj[key[key.length - 1]] = val;
    return originalObj;
  };

    /*
  if (Array.isArray(key)) {
    return; // TODO noop for now
  }
  */
  if (typeof key === 'string') {
    key = [key];
  }

  /*
  let mergeObj = createMergeObj(
    key,
    {
      $set: {
        isFetching: true,
        context: context,
      }
    });
  let currStateSaved = currentState();
  let updateResult = update(
      currStateSaved,
      mergeObj);
    */
  setState((prevState /*, props*/) => {
    return update(prevState, createMergeObj(
      key, {
        $set: {
          isFetching: true,
          context,
        }
      }
    ));
  });

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
      /*
      let dataMergeObj = createMergeObj(
        key,
        {
          $merge: {
            isFetching: false,
            results: json,
          }
        }
      );
      let currStateSavedAgain = currentState();
      debugger;
      */
      setState((prevState, props) => {
        return update(prevState, createMergeObj(key, {
            $merge: {
              isFetching: false,
              results: json
            }
          }
        ))
      },
        () => {
          onReady();
        }
      );
    }
  ).catch(
    (error) => console.error(error)
  );
};

export {
  requiredParam,
  clFetch
};
