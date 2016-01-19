CodaLab Frontend
-----------------

The entire CodaLab frontend is written using React, and JSX is all compiled
during the build process.

Setup
======

You must install the latest version of [Node.js](https://nodejs.org/en/) for your platform.
Node is a JavaScript runtime that's used often to write front-end tools. We use Node.js's
supplied package manager, NPM, to track the dependencies for our front-end build tools.

Once you've installed Node, you'll need to install development dependencies:

        $ cd WORKSHEETS_HOME/codalab/apps/web
        $ npm i

Building
=========

We have a few compiled resources, namely a set of LESS files as well as JSX that
we have inside our React components. Compilation is done through [NPM scripts](https://docs.npmjs.com/misc/scripts),
the relevant ones are below:

* **Compiling JSX**:

        $ npm run jsx

* **Cleaning**

        $ npm run clean
