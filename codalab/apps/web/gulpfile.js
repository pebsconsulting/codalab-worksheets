const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');

// Compile JSX for production
gulp.task('default', () => {
    return gulp.src(['static/js/bundle/*.jsx', 'static/js/worksheet/*.jsx'])
               .pipe(babel({
                    presets: ['react']
               }))
               .pipe(gulp.dest('static/dist'));
});

// Cleanup compiled jsx
gulp.task('clean', () => {
    del(['static/dist']);
});
