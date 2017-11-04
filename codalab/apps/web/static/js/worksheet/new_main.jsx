import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { SearchBar } from "./search/search_bar.jsx";
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { combineReducers } from 'redux';
import { search } from './search/reducers.jsx';

const clApp = combineReducers({
  search
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
      <SearchBar />
    </Provider>,
    document.getElementById('cl-search-bar'));

