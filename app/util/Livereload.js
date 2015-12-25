//Contains the live reload code that refreshes the app page whenever a change in the script, style, or html file is detected
var gulp = require('gulp');

var livereload={
  start: function(){
      gulp.task('html', function () {
        if (location) location.reload();
      });

      gulp.task('scripts', function () {
        if (location) location.reload();
      });

      gulp.task('css', function () {
        var styles = document.querySelectorAll('link[rel=stylesheet]');

        for (var i = 0; i < styles.length; i++) {
          // reload styles
          var restyled = styles[i].getAttribute('href') + '?v='+Math.random(0,10000);
          styles[i].setAttribute('href', restyled);
        };
      });

      gulp.watch(['**/*.css'], ['css']);
      gulp.watch(['**/*.html'], ['html']);
      gulp.watch(['**/*.js'], ['scripts']);
  }
}

module.exports=livereload;