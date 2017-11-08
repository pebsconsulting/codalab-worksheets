// import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { SearchBar } from "./search/search_bar.jsx";
import { NavBarContainer } from './navbar/nav_bar.jsx';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { combineReducers } from 'redux';
import { search } from './search/reducers.jsx';
import { loggedInUser } from './navbar/reducers.jsx';
import "semantic-ui-less/semantic.less";

/**
 * TODO refactor the global state so 
 * that all worksheets, bundles, etc. are
 * stored in one place. Any features that
 * require that data should simply reference
 * by UUID. Will require thought into how
 * reducers should be organized.
 *
 * State shape:
 * {
 *   search: {
 *     queries: {
 *       "query1": {
 *         isFetching: false,
 *         results: ["worksheet name", "uuid", "owner username"]
 *       },
 *       "query2": {
 *         isFetching: true,
 *       }
 *     },
 *     currentQuery: "query2"
 *   }
 * }
 *
 */

const clApp = combineReducers({
  search,
  loggedInUser,
});

let store = createStore(
  clApp,
  applyMiddleware(
    thunkMiddleware,
    createLogger()
  )
);

ReactDOM.render(
    <Provider store={store}>
      <NavBarContainer />
    </Provider>,
    document.getElementById('cl-search-bar'));

