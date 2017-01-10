# SASS-Lint Report to Sonar
*Dependency [Gulp Sass Lint](https://github.com/sasstools/gulp-sass-lint). Based in [Sonar Web Front-End Reporters  2.1.1](https://github.com/groupe-sii/sonar-web-frontend-reporters).*

## Installation

```sh
$ npm install sass-lint-report-sonar --save-dev
```

## Using with Gulp

Create task Gulp for report SASS-Lint.


```javascript
var gulp = require('gulp'),
    sassLint = require('gulp-sass-lint'),
    sassReportSonarClass = require('sass-lint-report-sonar'),
    NAME_PROJECT = 'sass-lint-report-sonar',
    LANGUAGE = 'SCSS', // Optinal, Default 'SCSS'
    BASE_PROJECT = '.'; // Optinal, Default '.'
    BASE_FILE_PATH = null; // Optinal, Default null

gulp.task('sass-validate', function () {
    var sassReportSonar = new sassReportSonarClass('./scssReport.json');
    sassReportSonar.openReporter(NAME_PROJECT, LANGUAGE, BASE_PROJECT, BASE_FILE_PATH);

    var stream =  gulp.src('./src/scss/**/*.{scss, sass}')
        .pipe(sassLint({
            configFile: './.sass-lint.yml'
        }))
        .pipe($.sassLint.format())
        .pipe(sassReportSonar.reporter())
        .pipe(sassLint.failOnError());

    stream.on('finish', function() {
        sassReportSonar.closeReporter(sassReportSonar);
    });

    return stream;
});
```

## Convert rules SCSS-Lint to Sass-Lint
[Make-Sass-Lint-Config](https://sasstools.github.io/make-sass-lint-config/) - Convert your .scss-lint.yml config file into the equivalent .sass-lint.yml
