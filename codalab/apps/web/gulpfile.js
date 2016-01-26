var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');
var less = require('gulp-less');
var path = require('path');

// Compile JSX for production
gulp.task('default', function() {
    return gulp.src(['static/js/bundle/*.jsx', 'static/js/worksheet/*.jsx'])
               .pipe(babel({
                    presets: ['react']
               }))
               .pipe(gulp.dest('static/dist'));
});

// Cleanup compiled jsx
gulp.task('clean', function() {
    del(['static/dist']);
});
 
gulp.task('less', function () {
  return gulp.src('static/less/imports.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('static/css'));
});