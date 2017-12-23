import 'core-js';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { App } from './app/app.jsx';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { combineReducers } from 'redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import "semantic-ui-less/semantic.less";
import "./styles/styles.less";

ReactDOM.render(
    <Router>
      <Route path="/" component={App} />
    </Router>,
    document.getElementById('cl-main'));

