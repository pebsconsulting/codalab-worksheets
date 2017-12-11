const userIsLoggedIn = (state) => {
  return state.loggedInUser.results ? true : false;
};

const getLoggedInUser = (state) => {
  return state.loggedInUser.results;
};

export {
  userIsLoggedIn,
  getLoggedInUser,
};
