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
    $scope.headerselector = 'CLM';
    $scope.headerrowcount = 2;
    $scope.lineselector = 'PAY';
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

    $scope.addMap = function (n) {
      var o = {
            'name': 'New',
            'inwidth': 1,
            'instart': 1,
            'type': 'string',
            'outwidth': 10,
            'sourcerow': 0,
            'padding_position': 'end',
            'padding_symbol': ' '
        };

      $scope.maps.splice(n + 1, 0, o);
    };

    $scope.removeMap = function (n) {
    _.pullAt($scope.maps, n);
    };

    var setPreviews = function () {
        var line = (_.split($scope.outdata, '\n') || [])[0];
        var i = 0;
        var pos = 0;

        _.each($scope.maps, function(o, i) {
            $scope.maps[i].preview = '"' + line.substring(pos, pos + $scope.maps[i].outwidth) + '"';
            pos += $scope.maps[i].outwidth;
        });
    };

    $scope.onTextClick = function ($event) {
        $event.target.select();
    };

    var addRowsToSections = function (data) {
        var result = { rows: [] };

        _.each(data, function (row) {
            result.rows.push(row);
        });

        return (result);
    };

    var getSectionHeader = function (row) {
        var re;

        re = '^' + $scope.headerselector;
        re = new RegExp(re, '');
        return (re.exec(row));
    };

    var getDataRows = function (row) {
        var re;

        re = '^' + $scope.headerselector;
        re = new RegExp(re, '');
        return (re.exec(row));
    };

    var parseIntoSections = function (data, headerrowcount) {
        var datacopy = data;
        var arrtemp = [];
        var results = [];
        var i;

        if (headerrowcount > 0) {
            while (datacopy.length) {
                arrtemp = [];

                // grab the section header row(s)
                i = _.findIndex(datacopy, getSectionHeader);

                if (i > 0) {    // remove any rows before the header
                    datacopy = _.drop(datacopy, i);
                }

                arrtemp = _.concat(arrtemp, 
                    _.remove(datacopy, function (value, index) {
                        return (index < headerrowcount);
                    }
                ));

                // grab the data rows
                i = _.findIndex(datacopy, getDataRows);
                if (i >= 0) {   // another header was found - return each row up to the next header
                    arrtemp = _.concat(arrtemp, 
                        _.remove(datacopy, function (value, index) {
                            return (index < i);
                        }
                    ));
                } else {      // return remaining rows since no subsequent headers were found
                    arrtemp = _.concat(arrtemp,
                        _.remove(datacopy, function () {
                            return (true);
                        }
                    ));
                }

                results.push(addRowsToSections(arrtemp));   // each section becomes an item in the results array
            }
        } else {
            results.push(addRowsToSections(data));
        }
        return (results);
    };

    var buildValueMap = function (n) {
        var result = {};
        var i;

        result[0] = 'thisrow';
        for (i = 1; i <= n; i++) {
            result[i] = 'headerrow' + i;
        }
        return (result);
    };

    var buildLevels = function (headerrowcount, data) {
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

    var getDataRowsThatMatchSelector = function (str) {
        var re;

        re = '^' + $scope.lineselector;
        re = new RegExp(re, '');
        return (re.exec(str));
    };

    var validateIndata = function () {
      // todo: error when NaN is found

        var indata = $scope.indata;

        indata = _.split(indata, '\n');

        // var average = _.reduce(indata, function (sum, str) {
        //     return (sum + str.length);
        // }, 0) / indata.length;

        // if (average !== indata[0].length) {
        //     $scope.erroralert = 'Input data rows are not all the same length.';
        //     return();
        // }

        // if (average !== indata[0].length) {
        //     $scope.erroralert = 'Input data rows are not all the same length.';
        //     return;
        // }

        if (_.findIndex(indata, getSectionHeader) < 0) {
            $scope.erroralert = 'Warning: no matching section headers found.';
            return;
        }

        $scope.erroralert = '';   // if we made it this far...
    };

    $scope.calculateOutdata = function () {
        var keyMapping, valueMapping, inmaps, outmaps, options, nativedata, flatnativedata, j, i, predata, preheaderdata, result;
        var allinrowsclean = _.split($scope.indata, '\n');
        var sections = [];
        var headerwidths = [];
        var headerrowcount = $scope.headerrowcount;

        if (!$scope.headerselector) {
            // $scope.headerrowcount = 0;
        }

        if (!_.toInteger(headerrowcount)) {
            headerrowcount = 0;
            $scope.headerrowcount = headerrowcount;
        } else {
            headerrowcount = _.toInteger(headerrowcount);
            $scope.headerrowcount = headerrowcount;
        }

        $scope.outdata = '';
        sections[0] =  {}; // todo: parse out the actual multiple sections
        // sections[0].rows = allinrowsclean
        sections = parseIntoSections(allinrowsclean, headerrowcount);

        // assemble the map using the object keys that fixy needs
        keyMapping = {
            'name': 'name',
            'inwidth': 'width',
            'instart': 'start',
            'type': 'type',
            'sourcerow': 'level'
        };
        
        valueMapping = buildValueMap(headerrowcount);

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

        for (j = 0; j < sections.length; j++) {
            predata = sections[j].rows;

            validateIndata();
            preheaderdata = _.take(predata, headerrowcount);
            predata = _.filter(_.drop(predata, headerrowcount), getDataRowsThatMatchSelector);
            predata = _.concat(preheaderdata, predata);

            for (i = 0; i < headerrowcount; i++) {
                headerwidths.push(predata[i] ? predata[i].length : 0);
            }

            options = { skiplines: null };
            // options.skiplines = null;
            options.levels = buildLevels(headerrowcount, predata);
            predata = _.join(predata, '\n');

            nativedata = fixy.parse({
                map: inmaps,
                options: options
            }, predata);

            flatnativedata = _.cloneDeep(nativedata.thisrow);

            flatnativedata = _.each(flatnativedata, function (o) {
                for (i = 0; i < headerrowcount; i++) {
                    _.merge(o, nativedata['headerrow' + (i + 1)][0]);
                }
            });

            result = fixy.unparse(outmaps, flatnativedata);

            $scope.outdata += ($scope.outdata.length ? '\n' : '') + result;

            setPreviews();
        }
    };

    $scope.getCursorPos = function () {
        var n = window.getSelection().focusOffset;
        var rowlen = _.split($scope.indata, '\n')[0].length;

        $scope.cursorPosVal.pos = n;  // todo: n+1?
        $scope.cursorPosVal.col = n % rowlen;
        $scope.cursorPosVal.row = _.floor(n / rowlen) + 1;
    };        
});
