import fetch from 'isomorphic-fetch';

const REQUEST_WORKSHEETS_OF_USER = 'REQUEST_WORKSHEETS_OF_USER';
const RECEIVE_WORKSHEETS_OF_USER = 'RECEIVE_WORKSHEETS_OF_USER';
const REQUEST_USER = 'REQUEST_USER';
const RECEIVE_USER = 'RECEIVE_USER';

function requestWorksheetsOfUser(userId) {
  return {
    type: REQUEST_WORKSHEETS_OF_USER,
    userId
  };
}

function receiveWorksheetsOfUser(userId, results) {
  return {
    type: RECEIVE_WORKSHEETS_OF_USER,
    userId,
    results
  };
}

function fetchWorksheetsOfUser(userId) {
  /* userId can be either a UUID or '.mine' */
  return (dispatch) => {
    dispatch(requestWorksheetsOfUser(userId));

    return fetch(`/rest/worksheets?keywords=${userId}`, {
      credentials: 'same-origin',
    }).then(
      (response) => {
        if (response.status >= 400) {
          throw new Error('Bad response from server');
        }
        return response.json();
      },
      (error) => console.log('error: ', error)
    ).then(
      (json) => dispatch(receiveWorksheetsOfUser(userId, json))
    ).catch(
      (error) => console.log(error)
    );
  };
}

function requestUser(userId) {
  return {
    type: REQUEST_USER,
    userId,
  };
}

function receiveUser(userId, results) {
  return {
    type: RECEIVE_USER,
    userId,
    results,
  };
}

function fetchUser(userId) {
  return (dispatch) => {
    dispatch(requestUser(userId));

    return fetch(`/rest/users/${userId}`, {
      credentials: 'same-origin',
    }).then(
      (response) => {
        if (response.status >= 400) {
            throw new Error('Bad response from server');
        }
        return response.json();
      },
      (error) => console.log('error: ', error)
    ).then(
      (json) => dispatch(receiveUser(userId, json))
    ).catch(
      (error) => console.log(error)
    );
  }
}

export {
  REQUEST_WORKSHEETS_OF_USER,
  RECEIVE_WORKSHEETS_OF_USER,
  REQUEST_USER,
  RECEIVE_USER,
  fetchWorksheetsOfUser,
  fetchUser,
};
