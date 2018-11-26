import React, { Component } from 'react';
import codalabLogoBig from './img/codalab-logo-onecolor-reverse.png';
import frontpageImage from './img/frontpage.png';
import { Header, Footer } from './Base';
import { FrontPage } from './FrontPage';
import 'bootstrap/dist/css/bootstrap.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <FrontPage />
        <Footer />
      </div>
    );
  }
}

export default App;
