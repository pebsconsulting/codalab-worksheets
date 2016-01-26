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

        $ npm i

Building
=========

We have a few compiled resources, namely a set of LESS files as well as JSX that
we have inside our React components. Compilation is done using
[Gulp](http://gulpjs.com) via
[NPM scripts](https://docs.npmjs.com/misc/scripts), the relevant ones are below.

You would need to recompile after a clean checkout of the repository, and
anytime you make edits to the files in `static/js/bundle/`,
`static/js/worksheet/`, and `static/less/`.

* **Compiling only JSX**: Compile all the JSX code into the `static/dist/` directory

        $ npm run jsx

* **Compiling only LESS**: Compile all the LESS code into the `static/css/` directory

        $ npm run less

* **Compiling both JSX and LESS**: Compile all the JSX and LESS code

        $ npm run build

* **Cleaning**: Removes the `static/dist/` directory

        $ npm run clean
