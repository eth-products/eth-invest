const gulp = require('gulp');
const babel = require("gulp-babel");
const concat = require('gulp-concat');


gulp.task('js', () => {
    gulp.src(['src/scripts/*.js', 'src/scripts/**/*.js', 'src/scripts/**/**/*.js'])
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('app/scripts'));
});


gulp.task('default', ['js']);