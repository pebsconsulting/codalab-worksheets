const userIsLoggedIn = (state) => {
  return state.loggedInUser.user ? true : false;
};

const getLoggedInUser = (state) => {
  return state.loggedInUser.user;
};

export {
  userIsLoggedIn,
  getLoggedInUser,
};
