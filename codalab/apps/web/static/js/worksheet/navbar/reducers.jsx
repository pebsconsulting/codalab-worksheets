import {
  FETCH_LOGGED_IN_USER,
  REQUEST_LOGGED_IN_USER,
  RECEIVE_LOGGED_IN_USER,
  fetchLoggedInUser,
  requestLoggedInUser,
  receiveLoggedInUser,
} from './actions.jsx';
import update from 'immutability-helper';

/*
 *
 */
const initialState = {
  user: null,
  isFetching: false
};

const loggedInUser = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_LOGGED_IN_USER:
      return update(state,
          {
            isFetching: {
              $set: false,
            },
            user: {
              $set: action.user
            }
          }
      );
    case REQUEST_LOGGED_IN_USER:
      return update(state,
          {
            isFetching: {
              $set: true,
            }
          }
      );
    default:
      return state;
  }
};

export {
  loggedInUser,
};
