import React, { Component } from 'react';
import codalabLogoBig from './img/codalab-logo-onecolor-reverse.png';
import codalabLogo from './img/codalab-logo.png';
import frontpageImage from './img/frontpage.png';
import './FrontPage.css';
import 'bootstrap/dist/css/bootstrap.css';

export class FrontPage extends Component {
  render() {
    const welcome = (
      <div className="jumbotron">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 col-md-8 col-md-offset-2">
              <img src={codalabLogoBig} alt="CodaLab" className="img-responsive" />
              <h4><b><i>A collaborative platform for reproducible research.</i></b></h4>
              <div className="frontpage-buttons">
                <span className="user-authenticated frontpage-button">
                  <a href="/rest/worksheets/?name=%2F">My Home</a>
                </span>
                <span className="user-authenticated frontpage-button">
                  <a href="/rest/worksheets/?name=dashboard">My Dashboard</a>
                </span>
                <span className="user-not-authenticated frontpage-button">
                  <a href="/account/signup">Sign Up</a>
                </span>
                <span className="user-not-authenticated frontpage-button">
                  <a href="/account/login?next=foo">Sign In</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const description = (
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <p>
              Running 100 experiments in parallel on different versions of your code/data?
              Don't remember how you got that result from 6 months ago?
              CodaLab allows you to run your jobs on a cluster, document and share your experiments,
              all while keeping track of full provenance,
              so you can be a more efficient researcher.
            </p>
            <p>
              To get started, read more about the <a target="_blank" href="https://github.com/codalab/codalab-worksheets/wiki">mission</a>,
              check out our two-minute overview <a target="_blank" href="https://www.youtube.com/watch?v=WwFGfgf3-5s">video</a>,
              {' '}<a href="/account/signup">sign up</a> for an account,
              and go through the <a target="_blank" href="https://github.com/codalab/codalab-worksheets/wiki/Quickstart">tutorial</a> to try it out!
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6">
            <h2 className="frontpage-header">Upload</h2>
            Upload <i><b>co</b></i>de (in any programming language) and <i><b>da</b></i>ta (in any format) to <i><b>Coda</b></i>Lab.
            If you're using the <a target="_blank" href="https://github.com/codalab/codalab-worksheets/wiki/CLI-Reference">command-line interface (CLI)</a>, type, for example:
            <div className="frontpage-code">
              $ cl upload train.py
            </div>
            This produces an immutable <b>bundle</b>:
            <div className="frontpage-stage">
              <div className="frontpage-bundle-icon bg-blue">train.py</div>
            </div>

            <h2 className="frontpage-header">Run</h2>
            Run any bash shell command, which can depend on previous bundles.
            In the CLI or the web terminal, type, for example:
            <div className="frontpage-code">
              $ cl run :train.py 'python train.py --eta 0.2'
            </div>
            CodaLab records the execution environment using <a target="_blank" href="https://www.docker.com">docker</a> to ensure
            reproducibility, and produces a new bundle:
            <div className="frontpage-stage">
              <div className="frontpage-bundle-icon bg-blue">train.py</div>{' '}
              &rarr;{' '}
              <div className="frontpage-bundle-icon bg-green">run17</div>
            </div>
            This bundle is added to the global dependency graph over all research assets (see right).

            <h2 className="frontpage-header">Present</h2>
            Create <b>worksheets</b> to
            manage your runs, document your experimental results,
            and publish executable papers.
            Use <a target="_blank" href="https://github.com/codalab/codalab-worksheets/wiki/Worksheet-Markdown">CodaLab markdown</a> to
            create custom tables and graphs.
          </div>
          <div className="col-sm-1">
          </div>
          <div className="col-sm-5">
            <div className="frontpage-graphic">
              <img src={frontpageImage} className="img-responsive" />
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div>{welcome}{description}</div>
    );
  }
}
