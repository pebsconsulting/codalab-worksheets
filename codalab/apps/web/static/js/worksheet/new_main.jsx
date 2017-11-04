import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { SearchBar, clApp } from './search/search_bar.jsx';
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'

/**
 * Organizing Principles
 *
 * - Organize by feature
 * - Each top level feature / module should talk
 *   directly to the redux state
 * - Tests will be in the same directories as the
 *   source code
 * - Reuse state as much as possible
 *
 */

const store = createStore(
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
