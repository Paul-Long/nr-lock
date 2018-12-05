const gulp = require('gulp');
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.resolve(__dirname, './package.json'));
let packageJson = JSON.parse(content);

gulp.task('copy-doc', function () {
  return gulp.src([
    'doc/**/*',
  ]).pipe(gulp.dest('dist/doc'));
});

gulp.task('copy-readme', function () {
  return gulp.src([
    'README.md',
    'index.js',
    'LICENSE'
  ]).pipe(gulp.dest('dist'));
});

gulp.task('build', function () {
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  fs.writeFileSync(path.resolve(__dirname, './dist/package.json'), JSON.stringify(packageJson, null, 2));

  gulp.run('copy-doc');
  gulp.run('copy-readme');
});
