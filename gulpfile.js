'use strict';

var gulp = require('gulp');
var electron = require('electron-connect').server.create();

gulp.task( 'default', [ 'serve' ] )
gulp.task('serve', function () {

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch('index.js', electron.restart);

  // Reload renderer process
  gulp.watch(['script.js', 'index.html'], electron.reload);
});
