var Model = require('sonar-web-frontend-reporters/reporterModel'),
    fs = require('fs'),
    map = require('map-stream'),
    inherits = require('util').inherits,
    through = require('through2'),
    PLUGIN_NAME = 'sass-lint-report-sonar',
    convertRulesSassToSCSSLint = {
        'attribute-quotes': 'StringQuotes',
        'bem-depth': 'BemDepth',
        'border-zero': 'BorderZero',
        'brace-style': 'SingleLinePerProperty',
        'class-name-format': 'SelectorFormat',
        'clean-import-paths': 'ImportPath',
        'empty-line-between-blocks': 'EmptyLineBetweenBlocks',
        'extends-before-declarations': 'DeclarationOrder',
        'extends-before-mixins': 'DeclarationOrder',
        'final-newline': 'FinalNewline',
        'force-attribute-nesting': 'MergeableSelector',
        'force-element-nesting': 'MergeableSelector',
        'force-pseudo-nesting': 'MergeableSelector',
        'function-name-format': 'NameFormat',
        'hex-length': 'HexLength',
        'hex-notation': 'HexNotation',
        'id-name-format': 'SelectorFormat',
        'indentation': 'Indentation',
        'leading-zero': 'LeadingZero',
        'mixin-name-format': 'NameFormat',
        'mixins-before-declarations': 'DeclarationOrder',
        'no-color-keywords': 'ColorKeyword',
        'nesting-depth': 'NestingDepth',
        'no-color-literals': 'ColorVariable',
        'no-css-comments': 'Comment',
        'no-debug': 'DebugStatement',
        'no-empty-rulesets': 'EmptyRule',
        'no-extends': 'ExtendDirective',
        'no-ids': 'IdSelector',
        'no-important': 'ImportantRule',
        'no-invalid-hex': 'HexValidation',
        'no-mergeable-selectors': 'MergeableSelector',
        'no-misspelled-properties': 'PropertySpelling',
        'no-qualifying-elements': 'QualifyingElement',
        'no-trailing-whitespace': 'TrailingWhitespace',
        'no-trailing-zero': 'TrailingZero',
        'no-transition-all': 'TransitionAll',
        'no-url-domains': 'UrlFormat',
        'no-url-protocols': 'UrlFormat',
        'no-vendor-prefixes': 'VendorPrefix',
        'placeholder-in-extend': 'PlaceholderInExtend',
        'placeholder-name-format': 'NameFormat',
        'property-sort-order': 'PropertySortOrder',
        'property-units': 'PropertyUnits',
        'quotes': 'StringQuotes',
        'shorthand-values': 'Shorthand',
        'single-line-per-selector': 'SingleLinePerSelector',
        'space-after-bang': 'BangFormat',
        'space-after-colon': 'SpaceAfterPropertyColon',
        'space-after-comma': 'SpaceAfterComma',
        'space-around-operator': 'SpaceAroundOperator',
        'space-before-bang': 'BangFormat',
        'space-before-brace': 'SpaceBeforeBrace',
        'space-before-colon': 'SpaceAfterPropertyName',
        'space-between-parens': 'SpaceBetweenParens',
        'trailing-semicolon': 'TrailingSemicolon',
        'url-quotes': 'UrlQuotes',
        'variable-for-property': 'VariableForProperty',
        'variable-name-format': 'NameFormat',
        'zero-unit': 'ZeroUnit',
        'no-duplicate-properties': 'DuplicateProperty',
        'leading-underscore': 'ImportPath',
        'filename-extension': 'ImportPath',
        'allow-element-with-attribute': 'QualifyingElement',
        'allow-element-with-class': 'QualifyingElement',
        'allow-element-with-id': 'QualifyingElement'
    };

function SASSReporter(reportFile) {
    Model.call(this, reportFile);
    global.selfSASSR = this;
}

inherits(SASSReporter, Model);

SASSReporter.prototype.reporter = function () {

    return through.obj(function (file, encoding, cb) {
        if (file.isNull()) {
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }

        var fileNbViolations = global.selfSASSR.openFileIssues(file, /^(\s+)?\/\*.*\*\//gm, /^(\s+)?\n$/gm),
            fileSassLint = file.sassLint[0];

        if ((fileSassLint.messages).length !== 0) {
            var d = (new Date()).getTime(),
                severity,
                errorCount = fileSassLint.errorCount + fileSassLint.warningCount;

            fileSassLint.messages.forEach(function (result, index) {
                switch (result.severity) {
                    case 1:
                        severity = 'MINOR';
                        global.selfSASSR.nbViolations[global.selfSASSR.MINOR]++;
                        fileNbViolations[global.selfSASSR.MINOR]++;
                        break;
                    case 2:
                        severity = 'MAJOR';
                        global.selfSASSR.nbViolations[global.selfSASSR.MAJOR]++;
                        fileNbViolations[global.selfSASSR.MAJOR]++;
                        break;
                    default:
                        severity = 'INFO';
                        global.selfSASSR.nbViolations[global.selfSASSR.INFO]++;
                        fileNbViolations[global.selfSASSR.INFO]++;
                        break;
                }

                fs.appendFileSync(global.selfSASSR.reportFile, '{\n\t\t"line" : ' + (result.line ? result.line : null) + ',\n\t\t' +
                    '"message" : "' + result.message.replace(/["']/g, '\'') + '",\n\t\t' +
                    '"description" : "' + result.message.replace(/["']/g, '\'') + '",\n\t\t' +
                    '"rulekey" : "' + convertRulesSassToSCSSLint[result.ruleId] + '",\n\t\t' +
                    '"severity" : "' + severity + '",\n\t\t' +
                    '"reporter" : "sassLint",\n\t\t' +
                    '"creationDate" : ' + d + '\n\t\t' + ((index < errorCount - 1) ? '},' : '}'));
            });
        }
        global.selfSASSR.closeFileIssues(fileNbViolations);

        this.push(file);
        cb();
    });
};

module.exports = SASSReporter;
