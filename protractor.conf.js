'use strict';

exports.config = {
    framework: 'jasmine',
    baseUrl: 'http://localhost:3000',
    directConnect: true,
    specs: ['test/e2e/spec.js'],

    jasmineNodeOpts: {
        print: function() {},
        showColors: true,
        defaultTimeoutInterval: 30000,
    },

    onPrepare: function() {
        var SpecReporter = require('jasmine-spec-reporter'); // npm install jasmine-spec-reporter
        jasmine.getEnv().addReporter(new SpecReporter({
          displayStacktrace: 'none',      // display stacktrace for each failed assertion, values: (all|specs|summary|none)
          displaySuccessesSummary: false, // display summary of all successes after execution
          displayFailuresSummary: true,   // display summary of all failures after execution
          displayPendingSummary: false,    // display summary of all pending specs after execution
          displaySuccessfulSpec: false,    // display each successful spec
          displayFailedSpec: false,        // display each failed spec
          displayPendingSpec: false,      // display each pending spec
          displaySpecDuration: true,     // display each spec duration
          displaySuiteNumber: false,      // display each suite number (hierarchical)
          colors: {
            success: 'green',
            failure: 'red',
            pending: 'yellow'
          },
          prefixes: {
            success: '✓ ',
            failure: '✗ ',
            pending: '* '
          },
          customProcessors: []
        }));
    }

};
