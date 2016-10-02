'use strict';

var mCtrls = require('./_mCtrls'),
    // debug = require('debug'),
    // log = debug('Ctrls'),
    _ = require('lodash'),
    // loader = require('../../utilities/loader'),
    fixy = require('fixy');

mCtrls.controller('MyCtrl', function ($scope) {
    // log('test');
    // $scope.test = 'test2';
    // console.log(loader.getLoader('main').getResult('app-data'));

    $scope.indata = 'CLM00123Big  \nJohn      Doe       \nPAY78111\nPAY87222\nPAY98333\nPAY89444\n';
    $scope.indata += 'CLM00234Small\nJane      Doe       \nPAY12555\nPAY23666\nPAY34777\nPAY45888';
    $scope.headerselector = '^CLM';
    $scope.headerrowcount = 2;
    $scope.lineselector = '^PAY';
    $scope.maps = [ 
        {
            'name': 'Claim number',
            'inwidth': 5,
            'instart': 4,
            'type': 'string',
            'outwidth': 10,
            'sourcerow': 1,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Size',
            'inwidth': 5,
            'instart': 9,
            'type': 'string',
            'outwidth': 10,
            'sourcerow': 1,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'First name',
            'inwidth': 10,
            'instart': 1,
            'type': 'string',
            'outwidth': 10,
            'sourcerow': 2,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Last name',
            'inwidth': 10,
            'instart': 11,
            'type': 'string',
            'outwidth': 10,
            'sourcerow': 2,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Amount',
            'inwidth': 2,
            'instart': 4,
            'type': 'string',
            'outwidth': 10,
            'sourcerow': 0,
            'padding_position': 'end',
            'padding_symbol': '_'
        }, {
            'name': 'Blah',
            'inwidth': 3,
            'instart': 6,
            'type': 'string',
            'outwidth': 15,
            'sourcerow': 0,
            'padding_position': 'start',
            'padding_symbol': '.'
        }
    ];

    $scope.cursorPosVal = {};

    $scope.validateIndata = function () {
      // todo: error when NaN is found

        var indata = $scope.indata;

        indata = _.split(indata, '\n');

        var average = _.reduce(indata, function (sum, str) {
            return (sum + str.length);
        }, 0) / indata.length;

        if (average !== indata[0].length) {
            $scope.erroralert = 'Input data rows are not all the same length.';
        } else {
            $scope.erroralert = '';
        }
    };

    $scope.parseIntoSections = function (data) {
        var re;
        var datacopy = data;
        var arrtemp = [];
        var results = [];
        var i;

        while (datacopy.length) {
            arrtemp = [];

            // grab the section header row(s)
            i = _.findIndex(datacopy, function (row) {
                re = $scope.headerselector;
                re = new RegExp(re, '');
                return (re.exec(row));
            });

            if (i > 0) {    // remove any rows before the header
                datacopy = _.drop(datacopy, i);
            }

            arrtemp = _.concat(arrtemp, 
                _.remove(datacopy, function (value, index) {
                    return (index < $scope.headerrowcount);
                })
            );

            // grab the data rows
            i = _.findIndex(datacopy, function (row) {
                re = $scope.headerselector;
                re = new RegExp(re, '');
                return (re.exec(row));
            });
            arrtemp = _.concat(arrtemp,
                _.remove(datacopy, function (value, index) {
                    if (i >= 0) {
                        return (index < i); // return each row up to the next header
                    } else {
                        return (true);  // return everything if no remaining headers were found
                    }
                })
            );

            results.push($scope.addRowsToSections(arrtemp));   // each section becomes an item in the results array
        }
        return (results);
    };

    $scope.addRowsToSections = function (data) {
        var result = { rows: [] };

        _.each(data, function (row) {
            result.rows.push(row);
        });

        return (result);
    };

    $scope.buildValueMap = function (n) {
        var result = {};
        var i;

        result[0] = 'thisrow';
        for (i = 1; i <= n; i++) {
            result[i] = 'headerrow' + i;
        }
        return (result);
    };

    $scope.buildLevels = function (headerrowcount, data) {
        var result = {};
        var i;

        if (data.length - headerrowcount) {
            result.thisrow = {
                nickname: 'thisrow',
                start: headerrowcount,
                end: data.length - 1,
                fullwidth: data[headerrowcount].length
            };
        }

        for (i = 1; i <= headerrowcount; i++) {
            result['headerrow' + i] = {
                nickname: 'headerrow' + i,
                start: i - 1,
                end: i - 1,
                fullwidth: data[i - 1].length
            };
        }
        return (result);
    };

    $scope.calculateOutdata = function () {
        var keyMapping, valueMapping, inmaps, outmaps, options, nativedata, flatnativedata, datawidth, j, i, predata, preheaderdata, re, result;
        var allinrowsclean = _.split($scope.indata, '\n');
        var sections = [];
        var headerwidths = [];

        if (!$scope.headerselector) {
            $scope.headerrowcount = 0;
        }

        if (!_.toInteger($scope.headerrowcount)) {
            $scope.headerrowcount = 0;
        } else {
            $scope.headerrowcount = _.toInteger($scope.headerrowcount);
        }

        $scope.outdata = '';
        sections[0] =  {}; // todo: parse out the actual multiple sections
        // sections[0].rows = allinrowsclean
        sections = $scope.parseIntoSections(allinrowsclean);

        // assemble the map using the object keys that fixy needs
        keyMapping = {
            'name': 'name',
            'inwidth': 'width',
            'instart': 'start',
            'type': 'type',
            'sourcerow': 'level'
        };
        
        valueMapping = $scope.buildValueMap($scope.headerrowcount);

        inmaps = _.map($scope.maps, function (o) {
            return _.transform(o, function (res, value, key) {
                if (keyMapping[key] && (value != null)) {
                    if (key === 'sourcerow') {
                        value = valueMapping[value];
                    }
                    res[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });

        keyMapping = {
            'name': 'name',
            'outwidth': 'width',
            'padding_position': 'padding_position',
            'padding_symbol': 'padding_symbol'
        };
        outmaps = _.map($scope.maps, function (o) {
            return _.transform(o, function (res, value, key) {
                if (keyMapping[key] && value) {
                    res[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });

        for (j = 0; j < sections.length; j++) {   // start section loop
            predata = sections[j].rows;

            // $scope.validateIndata();
            preheaderdata = _.take(predata, $scope.headerrowcount);
            predata = _.filter(_.drop(predata, $scope.headerrowcount), function (str) {
                // only grab lines that meet our line selector regex
                re = $scope.lineselector;

                re = new RegExp(re, '');
                return (re.exec(str));
            });

            predata = _.concat(preheaderdata, predata);

            // console.log(predata);

            for (i = 0; i < $scope.headerrowcount; i++) {
                headerwidths.push(predata[i] ? predata[i].length : 0);
            }

            datawidth = predata[$scope.headerrowcount] ? predata[$scope.headerrowcount].length : 0;   // todo: test this e.g. no PAY records

            options = {};

            options.skiplines = null;
            options.levels = $scope.buildLevels($scope.headerrowcount, predata);
            predata = _.join(predata, '\n');

            nativedata = fixy.parse({
                map: inmaps,
                options: options
            }, predata);

            flatnativedata = _.cloneDeep(nativedata.thisrow);

            flatnativedata = _.each(flatnativedata, function (o) {
                for (i = 0; i < $scope.headerrowcount; i++) {
                    _.merge(o, nativedata['headerrow' + (i + 1)][0]);
                }
            });

            result = fixy.unparse(outmaps, flatnativedata);

            $scope.outdata += ($scope.outdata.length ? '\n' : '') + result;
        } // end section loop
    };

    $scope.getCursorPos = function () {
        var n = window.getSelection().focusOffset;
        var rowlen = _.split($scope.indata, '\n')[0].length;

        $scope.cursorPosVal.pos = n;  // todo: n+1?
        $scope.cursorPosVal.col = n % rowlen;
        $scope.cursorPosVal.row = _.floor(n / rowlen) + 1;
    };        
});
