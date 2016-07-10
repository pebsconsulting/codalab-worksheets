CodaLab Frontend
-----------------

The entire CodaLab frontend is written using React, and JSX is all compiled
during the build process.

Setup
======

You must install the latest version of [Node.js](https://nodejs.org/en/) for
your platform.  Node is a JavaScript runtime that's used often to write
front-end tools. We use Node.js's supplied package manager, NPM, to track the
dependencies for our front-end build tools.

Once you've installed Node, you'll need to install development dependencies.
Inside the directory that contains this README, run

    npm install

Building
=========

We have a few compiled resources, namely a set of LESS files as well as JSX that
we have inside our React components. Compilation is done using
[Gulp](http://gulpjs.com) via
[NPM scripts](https://docs.npmjs.com/misc/scripts), the relevant ones are below.

You would need to recompile after a clean checkout of the repository, and
anytime you make edits to the files in `static/js/bundle/`,
`static/js/worksheet/`, and `static/less/`.

You also must download the [Bower](https://bower.io) dependencies before
deploying the site, as Bower is how we track all of our third-party remote
dependencies. The NPM script for this is listed below as well.

* **Bower dependencies**: Install all of the third party dependencies before deploying.

        npm run bower

* **Compiling both JSX and LESS**: Compile all the JSX and LESS code into `static/dist` and `static/css`:

        npm run build

* **Cleaning**: Removes the `static/dist/` directory and `static/css/imports.css` file

        npm run clean
