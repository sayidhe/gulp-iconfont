var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var runTimestamp = Math.round(Date.now()/1000);

var fontName = 'Icons';

gulp.task('Iconfont', function(){
  return gulp.src(['dist/svg/static/*.svg'])
    .pipe(iconfont({
      fontName: fontName, // required
      prependUnicode: true, // recommended option
      formats: ['ttf', 'eot', 'woff', 'woff2'], // default, 'woff2' and 'svg' are available
      timestamp: runTimestamp, // recommended to get consistent builds when watching files
    }))
      .on('glyphs', function(glyphs, options) {
        // CSS templating, e.g.
        console.log(glyphs, options);
      })
    .pipe(gulp.dest('fonts/'));
});


gulp.task('Iconfont-Css', function(){
  return gulp.src(['dist/svg/static/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      path: 'templates/_icons.scss',
      targetPath: '../css/_icons.scss',
      fontPath: '../css/icons-css/'
    }))
    .pipe(iconfont({
      fontName: fontName
     }))
    .pipe(gulp.dest('fonts/iconfont/'));
});
