var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var runTimestamp = Math.round(Date.now() / 1000);
var plumber = require('gulp-plumber'); // For error handling

var fontName = 'Font';

// Generate icon font and iconfont CSS
gulp.task('Iconfont', function() {
  return gulp.src(['raw_icons/svg/brands/*.svg'])
    .pipe(plumber()) // Added for error handling
    .pipe(iconfontCss({
      fontName: fontName,
      path: 'node_modules/gulp-iconfont-css/templates/_icons.css',
      targetPath: '../css/' + fontName + '.css',
      fontPath: '../iconfont/',
      normalize: true,
      fontHeight: 1200,
      cssClass: 'i',
      centerHorizontally: true
    }))
    .pipe(iconfont({
      fontName: fontName,
      prependUnicode: true,
      formats: ['ttf', 'eot', 'woff', 'woff2'],
      timestamp: runTimestamp,
    }))
    .on('glyphs', function(glyphs, options) {
      glyphs = glyphs.map(glyph => ({
        ...glyph,
        unicode: glyph.unicode[0].codePointAt(0).toString(16).toUpperCase()
      }));
      console.log(glyphs, options);
    })
    .pipe(gulp.dest('dist/iconfont/'));
});

// convert SVG files to a JSON format

var fc2json = require('gulp-file-contents-to-json');
var jsonTransform = require('gulp-json-transform');

var svgPath = 'raw_icons/svg/brands/*.svg';

gulp.task('svg-to-json', function() {
  return gulp.src(svgPath)
    .pipe(plumber()) // Added for error handling
    .pipe(fc2json('icons-svg.json'))
    .pipe(jsonTransform(function(data) {
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
    .pipe(gulp.dest('dist/json/'))
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

// Include all SVG content in JSON conversion
gulp.task('svg-to-json-full', function() {
  return gulp.src('raw_icons/svg/brands/*.svg')
    .pipe(plumber()) // Added for error handling
    .pipe(fc2json('icons-svg-full.json'))
    .pipe(jsonTransform(function(data) {
      return JSON.stringify(Object.keys(data).map(key => ({
        name: key,
        data: data[key]
      })), null, 2); // Correct JSON formatting
    }))
    .pipe(gulp.dest('dist/json/'));
});


// Read the Font.css file to generate the html file
const cheerio = require('gulp-cheerio');
const fs = require('fs');

gulp.task('generate-html', function() {
  return gulp.src('dist/css/Font.css')
    .pipe(cheerio({
      run: function($, file) {
        // Use regular expression to match class names and codepoints
        const iconPattern = /\.([^\:]+):before {\s*content: "\\([A-F0-9]+)";\s*}/g;
        let match;
        let icons = [];

        // Extracting all icons
        while ((match = iconPattern.exec(file.contents.toString())) !== null) {
          icons.push({
            name: match[1],
            codepoint: match[2]
          });
        }

        // Generating HTML content
        let htmlContent = '<html>\n<head>\n<meta charset="utf-8">\n<title>iconfont</title>\n<link href="css/Font.css" rel="stylesheet">\n<style>\nbody { font-family: Gill Sans; text-align: center; background: #f7f7f7 }\nbody > h1 { color: #666; margin: 1em 0 }\n.glyph { padding: 0 }\n.glyph > li { display: inline-block; margin: .3em .2em; width: 5em; height: 6.5em; background: #fff; border-radius: .5em; position: relative; vertical-align: top; }\n.glyph > li span:first-child { display: block; margin-top: .1em; font-size: 4em; line-height: 1 }\n.glyph > li > .char { font-size: 4em; position: absolute; top: 0; left: 0; text-align: center; width: 100%; color: rgba(0,0,0,0); line-height: 1em }\n.glyph-name { font-size: .8em; color: #999; display: block }\n.glyph-codepoint { color: #999; font-family: monospace }\n</style>\n</head>\n<body>\n<ul class="glyph">\n';

        // Adding each icon to the HTML
        icons.forEach(icon => {
          htmlContent += `<li>\n<span class="${icon.name}"></span>\n<span class="glyph-name">${icon.name}</span>\n<span class="glyph-codepoint">${icon.codepoint}</span>\n</li>\n`;
        });

        htmlContent += '</ul>\n</body>\n</html>';

        // Writing the HTML to a file
        fs.writeFileSync('dist/index.html', htmlContent);
      }
    }));
});

// Replace 'path/to/Font.css' with the actual path to your Font.css file
// The HTML file will be generated in the 'output' directory

const path = require('path');

// Task for generating HTML template
gulp.task('generate-html-new', async function() {
  // Read Font.css content
  const cssContent = fs.readFileSync('dist/css/Font.css', 'utf8');
  
  // Extract relevant information from CSS
  const glyphs = extractGlyphs(cssContent);
  
  // Generate HTML content
  let htmlContent = `<html>
  <head>
    <meta charset="utf-8">
    <title>iconfont</title>
    <link href="css/Font.css" rel="stylesheet">
    <style>
      body { font-family: Gill Sans; text-align: center; background: #f7f7f7 }
      body > h1 { color: #666; margin: 1em 0 }
      .glyph { padding: 0 }
      .glyph > li { display: inline-block; margin: .3em .2em; width: 5em; height: 6.5em; background: #fff; border-radius: .5em; position: relative; vertical-align: top; }
      .glyph > li span:first-child { display: block; margin-top: .1em; font-size: 4em; line-height: 1 }
      .glyph > li > .char { font-size: 4em; position: absolute; top: 0; left: 0; text-align: center; width: 100%; color: rgba(0,0,0,0); line-height: 1em }
      .glyph-name { font-size: .8em; color: #999; display: block }
      .glyph-codepoint { color: #999; font-family: monospace }    
    </style>
  </head>
  <body>
    <ul class="glyph">`;

  glyphs.forEach(glyph => {
    htmlContent += `<li>
      <span class="${glyph.className}"></span>
      <span class="glyph-name">${glyph.name}</span>
      <span class="glyph-codepoint">${glyph.codepoint}</span>
    </li>`;
  });

  htmlContent += `</ul>
  </body>
  </html>`;

  // Write the HTML file
  fs.writeFileSync('dist/index.html', htmlContent);
});

function extractGlyphs(cssContent) {
  const regex = /\.([a-z0-9-]+):before\s*\{\s*content:\s*"\\([a-f0-9]+)"/gi;
  let match;
  const glyphs = [];

  while ((match = regex.exec(cssContent)) !== null) {
    glyphs.push({
      className: match[1],
      name: match[1].replace(/-/g, ' '),
      codepoint: `\\${match[2]}`
    });
  }

  return glyphs;
}
