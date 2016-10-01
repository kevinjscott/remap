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

    // $scope.indata = 'YES210001234ABC\nYES220000011DEF\nNOO230000123GHI\nYES240000234JKL';
    // $scope.indata = 'PAY210001234ABC\nCLM0012301101975\nJane           Doe2             \nPAY220000011DEF\nNOO230000123GHI\nPAY240000234JKL\nPAY250001234ABC\nCLM0005601101974\nJohn           Doe              \nPAY260000011DEF\nNOO270000123GHI\nPAY280000234JKL';
    $scope.indata = 'CLM00123Big  \nJohn      Doe       \nPAY78111\nPAY87222\nPAY98333\nPAY89444';   // todo: this is just one section
    $scope.headerselector = '^CLM';
    $scope.headerrowcount = 2;
    $scope.lineselector = '^PAY';
    $scope.maps = [ 
        {
            'name': 'Claim number',
            'inwidth': 5,
            'instart': 4,
            'type': 'string',
            'transform': null, // todo
            'outwidth': 10,
            'sourcerow': 1,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Size',
            'inwidth': 5,
            'instart': 9,
            'type': 'string',
            'transform': null, // todo
            'outwidth': 10,
            'sourcerow': 1,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'First name',
            'inwidth': 10,
            'instart': 1,
            'type': 'string',
            'transform': null, // todo
            'outwidth': 10,
            'sourcerow': 2,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Last name',
            'inwidth': 10,
            'instart': 11,
            'type': 'string',
            'transform': null, // todo
            'outwidth': 10,
            'sourcerow': 2,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Amount',
            'inwidth': 2,
            'instart': 4,
            'type': 'string',
            'transform': null, // todo
            'outwidth': 10,
            'sourcerow': 0,
            'padding_position': 'end',
            'padding_symbol': '_'
        }, {
            'name': 'Blah',
            'inwidth': 3,
            'instart': 6,
            'type': 'string',
            'transform': null, // todo
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

    $scope.buildValueMap = function (n) {
        var result = {};

        result[0] = 'thisrow';
        for (var i = 1; i <= n; i++) {
            result[i] = 'headerrow' + i;
        }
        return (result);
    };

    $scope.buildLevels = function (headerrowcount, data) {
      var result = {};

      if (data.length - headerrowcount) {
          result['thisrow'] = {
              nickname: "thisrow",
              start: headerrowcount,
              end: data.length - 1,
              fullwidth: data[headerrowcount].length
          };
      }

      for (var i = 1; i <= headerrowcount; i++) {
          result['headerrow' + i] = {
              nickname: 'headerrow' + i,
              start: i - 1,
              end: i - 1,
              fullwidth: data[i - 1].length
          }
      }
      return (result);
    }

    $scope.calculateOutdata = function () {
        var keyMapping, valueMapping, inmaps, outmaps, datawidth;
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
        sections[0] =  {} // todo: parse out the actual multiple sections
        sections[0].rows = allinrowsclean

        // assemble the map using the object keys that fixy needs
        keyMapping = {
            'name': 'name',
            'inwidth': 'width',
            'instart': 'start',
            'type': 'type',
            'sourcerow': 'level'
        };
        
        valueMapping = $scope.buildValueMap($scope.headerrowcount);

        inmaps = _.map($scope.maps, function (currentObject) {
            return _.transform(currentObject, function (result, value, key) {
                if (keyMapping[key] && (value != null)) {
                    if (key === 'sourcerow') {
                        value = valueMapping[value];
                    }
                    result[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });

        keyMapping = {
            'name': 'name',
            'outwidth': 'width',
            'padding_position': 'padding_position',
            'padding_symbol': 'padding_symbol'
        };
        outmaps = _.map($scope.maps, function (currentObject) {
            return _.transform(currentObject, function (result, value, key) {
                if (keyMapping[key] && value) {
                    result[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });

        for (var i = 0; i < sections.length; i++) {   // start section loop
            var predata = sections[i].rows;

            // $scope.validateIndata();
            var preheaderdata = _.take(predata, $scope.headerrowcount);
            predata = _.filter(_.drop(predata, $scope.headerrowcount), function (str) {
                // only grab lines that meet our line selector regex
                var re = $scope.lineselector;

                re = new RegExp(re, '');
                return (re.exec(str));
            });

            predata = _.concat(preheaderdata, predata);

            // console.log(predata);

            for (var i = 0; i < $scope.headerrowcount; i++) {
              headerwidths.push(predata[i] ? predata[i].length : 0);
            }

            datawidth = predata[$scope.headerrowcount] ? predata[$scope.headerrowcount].length : 0;   // todo: test this e.g. no PAY records

            var options = {};

            options.skiplines = null;
            options.levels = $scope.buildLevels($scope.headerrowcount, predata);
            predata = _.join(predata, '\n');

            var nativedata = fixy.parse({
                map: inmaps,
                options: options
            }, predata);

            var flatnativedata = _.cloneDeep(nativedata.thisrow);
            flatnativedata = _.each(flatnativedata, function(o) {
                for (var i = 0; i < $scope.headerrowcount; i++) {
                    _.merge(o,nativedata["headerrow" + (i+1)][0])
                }
            })

            var result = fixy.unparse(outmaps, flatnativedata);

            $scope.outdata += result;
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
