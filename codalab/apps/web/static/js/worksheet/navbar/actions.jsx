import fetch from 'isomorphic-fetch';

const FETCH_LOGGED_IN_USER = 'FETCH_LOGGED_IN_USER';
const REQUEST_LOGGED_IN_USER = 'REQUEST_LOGGED_IN_USER';
const RECEIVE_LOGGED_IN_USER = 'RECEIVE_LOGGED_IN_USER';

function fetchLoggedInUser() {
  return (dispatch) => {
    dispatch(requestLoggedInUser());

    return fetch(`/rest/user`, {
      credentials: 'same-origin'
    }).then(
      (response) => response.json(),
      (error) => console.log("error: ", error)
    ).then(json => {
      dispatch(receiveLoggedInUser(json));
    });
  };
  return {
    type: FETCH_LOGGED_IN_USER
  };
};

function requestLoggedInUser() {
  return {
    type: REQUEST_LOGGED_IN_USER
  };
}

function receiveLoggedInUser(user) {
  return {
    type: RECEIVE_LOGGED_IN_USER,
    user
  }
}

export {
  FETCH_LOGGED_IN_USER,
  REQUEST_LOGGED_IN_USER,
  RECEIVE_LOGGED_IN_USER,
  fetchLoggedInUser,
  requestLoggedInUser,
  receiveLoggedInUser,
};
