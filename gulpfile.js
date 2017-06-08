'use strict';
const gulp = require('gulp');

gulp.task('clean', () => {
  const del = require('del');
  return del([ './dist/' ]);
});

gulp.task('compile-ts', () => {
  const ts = require('gulp-typescript');
  const tsProject = ts.createProject('./tsconfig.json');
  const dest = tsProject.options.outDir;
  return tsProject.src()
		.pipe(tsProject())
		.pipe(gulp.dest(dest));
});

gulp.task('compile-ts-es5', () => {
  const ts = require('gulp-typescript');
  const tsProject = ts.createProject('./tsconfig.json');
  tsProject.options.target = 1;
  const dest = tsProject.options.outDir;
  return tsProject.src()
		.pipe(tsProject())
		.pipe(gulp.dest(dest));
});

gulp.task('copy-files', () => {
  return gulp.src([ './package.json', './README.md' ])
		.pipe(gulp.dest('./dist/'));
});

gulp.task('watch', () => {
  return gulp.start([ 'watch-ts' ]);
});

// =======================================================================
gulp.task('default', cb => {
  const sequence = require('gulp-sequence');
  return sequence('clean', 'compile-ts', 'copy-files', cb);
});

gulp.task('dev', cb => {
  const sequence = require('gulp-sequence');
  return sequence('clean', 'compile-ts-es5', 'copy-files', cb);
});
