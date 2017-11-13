import {
  REQUEST_WORKSHEETS_OF_USER,
  RECEIVE_WORKSHEETS_OF_USER,
  REQUEST_USER,
  RECEIVE_USER,
} from './actions.jsx';
import update from 'immutability-helper';

const initialState = {
  isFetching: false,
  userId: null,
  results: {},
  user: {},
};

const userProfile = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_WORKSHEETS_OF_USER:
      return update(
        state,
        {
          isFetching: {
            $set: true,
          },
          userId: {
            $set: action.userId,
          }
        }
      );
    case RECEIVE_WORKSHEETS_OF_USER:
      return update(
        state,
        {
          isFetching: {
            $set: false,
          },
          userId: {
            $set: action.userId,
          },
          results: {
            $set: action.results,
          }
        }
      );
    case REQUEST_USER:
      return update(
        state,
        {
          userId: {
            $set: action.userId,
          }
        }
      );
    case RECEIVE_USER:
      return update(
        state,
        {
          user: {
            $set: action.results
          }
        }
      );
    default:
      return state;
  }
};

export {
  userProfile,
};
