const gulp = require('gulp');
const babel = require("gulp-babel");
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();

gulp.task('connect', ['sass', 'js'], () => {
    browserSync.init({
        port: 3000,
        server: './app/'
    });

    gulp.watch(['src/sass/*.scss', 'src/sass/**/*.scss', 'src/sass/**/**/*.scss'], ['sass']);

    gulp.watch(['src/scripts/*.js', 'src/scripts/**/*.js', 'src/scripts/**/**/*.js'], ['js']);

    gulp.watch(["./app/index.html", "./app/templates/*.html", "./app/templates/**/*.html"], browserSync.reload);
});


gulp.task('sass', function () {
    return gulp.src('src/sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/styles'));
});


gulp.task('js', () => {
    gulp.src(['src/scripts/*.js', 'src/scripts/**/*.js', 'src/scripts/**/**/*.js'])
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('app/scripts'));
});


gulp.task('build', ['js', 'sass']);
gulp.task('default', ['connect']);