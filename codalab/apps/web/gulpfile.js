var gulp = require('gulp');
var babel = require('gulp-babel');
var del = require('del');

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
