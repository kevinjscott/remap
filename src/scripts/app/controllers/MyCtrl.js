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
    // console.log(_.VERSION);

    // $scope.indata = _.repeat('0123456789', 8);
    $scope.indata = 'YES210001234ABC\nYES220000011DEF\nNOO230000123GHI\nYES240000234JKL';
    $scope.lineselector = '^YES';
    $scope.maps = [ 
        {
            'name': 'Age',
            'inwidth': 2,
            'instart': 4,
            'type': 'int',
            'transform': null, // todo
            'outwidth': 7,
            'padding_position': 'end',
            'padding_symbol': '-'
        }, {
            'name': 'Initials',
            'inwidth': 3,
            'instart': 13,
            'type': 'string',
            'transform': null, // todo
            'outwidth': 10,
            'padding_position': 'end',
            'padding_symbol': '_'
        }, {
            'name': 'Price',
            'inwidth': 7,
            'instart': 6,
            'type': 'float',
            'transform': null, // todo
            'outwidth': 10,
            'padding_position': 'start',
            'padding_symbol': '0'
        }
    ];
    $scope.cursorPosVal = {};

    $scope.validateIndata = function () {
      // todo: error when NaN is found

      var indata = $scope.indata;

      indata = _.split(indata, '\n');

      var average = _.reduce(indata, function(sum, str) {
        return (sum + str.length);
      }, 0) / indata.length;

      if (average !== indata[0].length) {
        $scope.erroralert = 'Input data rows are not all the same length.';
      } else {
        $scope.erroralert = '';
      }
    };


    $scope.calculateOutdata = function () {
        var keyMapping, maps, datawidth;
        var predata = _.split($scope.indata, '\n');

        $scope.validateIndata();

        keyMapping = {
            'name': 'name',
            'inwidth': 'width',
            'instart': 'start',
            'type': 'type'
        };
        maps = _.map($scope.maps, function (currentObject) {
            return _.transform(currentObject, function (result, value, key) {
                if (keyMapping[key] && value) {
                    result[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });

        // console.log(maps);
        // console.log(predata);
        predata = _.filter(predata, function (str) {
            var re = $scope.lineselector;

            re = new RegExp(re, '');
            return (re.exec(str));
        });

        // console.log(predata);

        datawidth = predata[0] ? predata[0].length : 0;
        // $scope.erroralert = "damn";
        predata = _.join(predata, '\n');

        var nativedata = fixy.parse({
            map: maps,
            options: {
                fullwidth: datawidth,
                skiplines: [], // todo
                format: 'json'
            }
        }, predata);

        keyMapping = {
            'name': 'name',
            'outwidth': 'width',
            'padding_position': 'padding_position',
            'padding_symbol': 'padding_symbol'
        };
        maps = _.map($scope.maps, function (currentObject) {
            return _.transform(currentObject, function (result, value, key) {
                if (keyMapping[key] && value) {
                    result[keyMapping[key]] = value * 1 ? value * 1 : value;
                }
            });
        });
        // console.log(maps);

        var result = fixy.unparse(maps, nativedata);

        $scope.outdata = result;
    };

    $scope.getCursorPos = function($event) {
        var n = window.getSelection().focusOffset;
        var rowlen = _.split($scope.indata, '\n')[0].length;

        $scope.cursorPosVal.pos = n;  // todo: n+1?
        $scope.cursorPosVal.col = n % rowlen;
        $scope.cursorPosVal.row = _.floor(n / rowlen) + 1;
    };        
});
