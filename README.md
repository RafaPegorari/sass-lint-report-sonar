# SASS-Lint Report to Sonar
*Dependencies [Sonar Web Front-End Reporters](https://github.com/groupe-sii/sonar-web-frontend-reporters), [Gulp Sass Lint](https://github.com/sasstools/gulp-sass-lint).*

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
    NAME_PROJECT = 'sass-lint-report-sonar';
    
gulp.task('sass-validate', function () {
    var sassReportSonar = new sassReportSonarClass('./scssReport.json');
    sassReportSonar.openReporter(NAME_PROJECT);

    var stream =  gulp.src('./src/scss/**/*.{scss, sass}')
        .pipe(sassLint({
            configFile: './.sass-lint.yml'
        }))
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
