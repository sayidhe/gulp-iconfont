var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var runTimestamp = Math.round(Date.now() / 1000);

var fontName1 = 'AudiIcons';

gulp.task('Iconfont', function() {
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

gulp.task('Iconfont-Css', function() {
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

// SVG files to json file

var fc2json = require('gulp-file-contents-to-json');
var jsonTransform = require('gulp-json-transform');
var svgPath = 'dist/svg/font-awesome/*.svg';

gulp.task('svg', function() {
  return gulp.src(svgPath)
    .pipe(fc2json('icons.json'))
    .pipe(jsonTransform(function(data) {
      var resultJson = '';
      //var objects = [];
      const dataSVG = {};

      for (const file in data) {

        const svgContent = data[file];
        
        console.log(svgContent);

        const svgContentValues = Object.values(svgContent)
        const svgContentKeys = Object.keys(svgContent)

        const dValues = extractDValuesFromSVG(svgContentValues);
        const dKeys = removeSvgExtension(svgContentKeys);

        console.log(dValues);
        console.log(dKeys);

        // Combine the keys and values into an object
        dKeys.forEach((key, index) => {
          dataSVG[key] = dValues[index];
        });
      }

      // Convert the object to JSON
      const jsonData = JSON.stringify(dataSVG, null, 2); // The third argument (2) adds indentation for readability

      return jsonData; 
    }))
    .pipe(gulp.dest('fonts/svg_json/'))
});

// Helper function to extract d values from SVG content
function extractDValuesFromSVG(svgContent) {
  // You can use any suitable method (like cheerio) to extract the d values from the SVG content
  // For this example, let's assume the SVG content is a string
  const regex = /d="([^"]*)"/g;
  const dValues = [];
  let match;

  while ((match = regex.exec(svgContent)) !== null) {
    dValues.push(match[1]);
  }

  return dValues;
}

// Remove .svg extension
function removeSvgExtension(fileNames) {
  const regex = /\.svg$/i;

  return fileNames.map(fileName => {
    const match = regex.exec(fileName);
    if (match) {
      return fileName.slice(0, match.index);
    }
    return fileName;
  });
}


// Include all svg content

gulp.task('svg1', function() {
  return gulp.src(svgPath)
    .pipe(fc2json('icons.json'))
    .pipe(jsonTransform(function(data) {
      var resultJson = '',
          objects = [],
          keys = Object.keys(data);

      for (var i = 0; i < keys.length; i++) {
          objects.push({
              name: keys[i],
              data: data[keys[i]]
          });
      }

      // return objects; it's correct json

      var i = 0;
      objects.map(function(e) {
          i++;
          resultJson += JSON.stringify(e) +
              (i == keys.length ? '' : ',\n');
      });

      return resultJson; // it's just what you want in result file, but it's no valid json file
    }))
    .pipe(gulp.dest('fonts/svg_json'));
});
