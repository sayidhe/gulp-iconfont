var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var runTimestamp = Math.round(Date.now()/1000);

var fontName1 = 'AudiIcons';

gulp.task('Iconfont', function(){
  return gulp.src(['dist/svg/static/*.svg'])
    .pipe(iconfont({
      fontName: fontName1, // required
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

var fontName2 = 'fontAwesome';

// Use font-awesome svg, which svg line is more prefect

gulp.task('Iconfont-Css', function(){
  return gulp.src(['dist/svg/font-awesome/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName2,
      path: 'node_modules/gulp-iconfont-css/templates/_icons.scss',
      targetPath: '../css/' + fontName2 + '.scss',
      fontPath: '../css/icons-css/',
      cssClass: 'i',
      centerHorizontally: true
    }))
    .pipe(iconfont({
      fontName: fontName2,
      prependUnicode: true, // recommended option
      formats: ['ttf', 'eot', 'woff', 'woff2'], // default, 'woff2' and 'svg' are available
      timestamp: runTimestamp, // recommended to get consistent builds when watching files
     }))
    .pipe(gulp.dest('fonts/iconfont/'));
});
