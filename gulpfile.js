'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    coffee = require('gulp-coffee'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    bower = require('gulp-bower'),
    path = require('path'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    gulpIf = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync').create();

var config = {
  srcDir: 'src',
  destDir: 'public',
  bowerDir: './bower_components'
};

gulp.task('bower', function() {
  return bower().pipe(gulp.dest(config.bowerDir))
});

gulp.task('clean', function() {
  return del.sync(config.destDir);
});

gulp.task('html', function() {
  return gulp.src(config.srcDir + '/*.html')
    .pipe(useref({
      searchPath: [config.destDir, config.bowerDir]
    }))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest(config.destDir))
});

gulp.task('css', function () {
  var css = {
    in: config.srcDir + '/css/styles.scss',
    out: config.destDir + '/css/'
  };

  return gulp.src(css.in)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested',
      precison: 3,
      errLogToConsole: true,
      imagePath: config.src + 'images',
      includePaths: [
        config.bowerDir + '/bootstrap-sass/assets/stylesheets',
        config.bowerDir + '/fontawesome/scss'
      ]
    }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', '> 1%', 'Explorer >= 8', {
      cascade: true
    }))
    .pipe(minifyCss({
      compatibility: 'ie8'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(css.out))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('images', function () {
  return gulp.src(config.srcDir + '/images/*')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(config.destDir + '/images/'));
});

gulp.task('fonts', function () {
  var fonts = {
    in: [
      config.srcDir + '/fonts/**/*',
      config.bowerDir + '/bootstrap-sass/assets/fonts/**/*',
      config.bowerDir + '/font-awesome/fonts/*'
    ],
    out: config.destDir + '/fonts/'
  };

  return gulp.src(fonts.in).pipe(gulp.dest(fonts.out));
});

gulp.task('build', function (callback) {
  runSequence(
    'clean', 'bower',
    ['css', 'images', 'fonts'],
    'html',
    callback
  )
});

gulp.task('watch', ['build'], function () {
  gulp.watch(config.srcDir + '/css/**/*', ['css']);
  gulp.watch(config.srcDir + '/images/**/*', ['images']);
  gulp.watch(config.srcDir + '/fonts/**/*', ['fonts']);
  gulp.watch(config.srcDir + '/**/*.html', ['html']);
});

gulp.task('default', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: [config.srcDir, config.destDir],
      routes: {
        '/bower_components': config.bowerDir
      }
    }
  })

  gulp.watch(config.srcDir + '/css/**/*', ['css']);
  gulp.watch(config.srcDir + '/images/**/*', browserSync.reload);
  gulp.watch(config.srcDir + '/fonts/**/*', browserSync.reload);
  gulp.watch(config.srcDir + '/**/*.html', browserSync.reload);
});
